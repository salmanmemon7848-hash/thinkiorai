/**
 * THINKIOR — TAVILY SEARCH
 * ─────────────────────────────────────────────────────────────────
 * Tavily is a paid search API purpose-built for AI agents. It
 * returns both search results (title/url/snippet) AND — at
 * "advanced" depth — cleaned raw page content per result. That
 * replaces the SearXNG + cheerio-scrape pipeline we used to have.
 *
 * Fallback chain
 * ──────────────
 * We support up to 4 Tavily API keys (TAVILY_API_KEY_1 .. _4).
 * The first key is tried first; if it returns a non-2xx response
 * or times out, we move to the next. This protects us from a
 * single key being rate-limited or exhausted.
 *
 * A failed key is recorded in a small in-memory cooldown map so
 * the next request in the same Node process prefers a different
 * key first. Cooldowns expire after 60s.
 *
 * Usage
 * ─────
 *   import { tavilySearch } from '@/lib/research/tavily'
 *   const results = await tavilySearch('fintech market India 2025', { maxResults: 5 })
 *
 * Returns
 * ───────
 *   Array<{
 *     title: string
 *     url: string
 *     snippet: string    // Tavily's "content" field — already cleaned
 *     rawContent: string // Tavily's "raw_content" — full page text
 *     score: number      // Tavily's relevance score
 *     engine: string     // always "tavily" — kept for compatibility
 *   }>
 *
 * Throws nothing — returns [] on every failure path so callers
 * never have to wrap in try/catch. The previous SearXNG version
 * also returned [] on failure, so existing callers stay clean.
 */

const TAVILY_ENDPOINT = "https://api.tavily.com/search"
const REQUEST_TIMEOUT_MS = 8_000
const KEY_COOLDOWN_MS = 60_000

export interface TavilyResult {
  title: string
  url: string
  snippet: string
  rawContent: string
  score: number
  engine: "tavily"
}

export interface TavilySearchOptions {
  maxResults?: number
  /** "basic" = faster + cheaper, "advanced" = full page content. Default: "advanced". */
  depth?: "basic" | "advanced"
  /** Restrict to Indian domains. Default: false (Tavily handles geo by query content). */
  includeIndiaBias?: boolean
}

/**
 * Returns the configured Tavily keys in priority order. Keys that
 * are currently in cooldown are moved to the end of the list so the
 * next request tries a fresh key first.
 */
function getKeyPool(): string[] {
  const all = [
    process.env.TAVILY_API_KEY_1,
    process.env.TAVILY_API_KEY_2,
    process.env.TAVILY_API_KEY_3,
    process.env.TAVILY_API_KEY_4,
    // Legacy single-key env var — keep working if a user has it set
    process.env.TAVILY_API_KEY,
  ]
    .filter((k): k is string => typeof k === "string" && k.trim().length > 0)
    .map((k) => k.trim())

  if (all.length === 0) return []

  // Move keys in cooldown to the end so healthy keys get tried first
  const now = Date.now()
  const cooldownMap = (cooldownState as Map<string, number>)
  const fresh = all.filter((k) => !cooldownMap.has(k) || (cooldownMap.get(k) ?? 0) < now)
  const cooling = all.filter((k) => !fresh.includes(k))
  return [...fresh, ...cooling]
}

const cooldownState: Map<string, number> = new Map()

function putKeyInCooldown(key: string, ms: number = KEY_COOLDOWN_MS): void {
  cooldownState.set(key, Date.now() + ms)
}

function clearKeyCooldown(key: string): void {
  cooldownState.delete(key)
}

/** Internal: do one Tavily call. Throws on non-2xx or timeout. */
async function tavilyCallOnce(
  apiKey: string,
  query: string,
  maxResults: number,
  depth: "basic" | "advanced"
): Promise<TavilyResult[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(TAVILY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults,
        search_depth: depth,
        // We get a per-result summary ("content") and, at advanced
        // depth, the cleaned full page text ("raw_content"). Skip
        // the generated LLM answer — we'll have Groq synthesize.
        include_answer: false,
        include_raw_content: depth === "advanced",
        include_images: false,
        // Tavily deduplicates internally; no need for our own dedupe
        topic: "general",
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      const err = new Error(
        `Tavily ${res.status}: ${body.slice(0, 200) || res.statusText}`
      ) as Error & { status?: number }
      err.status = res.status
      throw err
    }

    const data = (await res.json()) as {
      results?: Array<{
        title?: string
        url?: string
        content?: string
        raw_content?: string
        score?: number
      }>
    }

    return (data.results ?? []).map((r) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      snippet: r.content ?? "",
      rawContent: r.raw_content ?? "",
      score: typeof r.score === "number" ? r.score : 0,
      engine: "tavily" as const,
    }))
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Search via Tavily with automatic 4-key fallback. Returns [] if
 * every key fails — never throws. The previous SearXNG version
 * also returned [] on failure, so this is a drop-in replacement.
 */
export async function tavilySearch(
  query: string,
  options: TavilySearchOptions = {}
): Promise<TavilyResult[]> {
  const { maxResults = 10, depth = "advanced" } = options

  const keys = getKeyPool()
  if (keys.length === 0) {
    console.warn(
      "[ThinkiorAI] Tavily: no TAVILY_API_KEY_* env vars configured. Set at least TAVILY_API_KEY_1."
    )
    return []
  }

  let lastError: unknown = null
  for (const key of keys) {
    try {
      const results = await tavilyCallOnce(key, query, maxResults, depth)
      // Success — clear any cooldown entry for this key
      clearKeyCooldown(key)
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[ThinkiorAI] Tavily: ${results.length} results for "${query.slice(0, 50)}…"`
        )
      }
      return results
    } catch (err) {
      lastError = err
      const status =
        (err as { status?: number })?.status ??
        (err instanceof Error && err.name === "AbortError" ? 408 : 0)
      // 4xx (except 408/429) are client errors — key is bad, put it
      // in long cooldown. 5xx and 429 are transient — short cooldown.
      const cooldownMs = status === 429 || status >= 500 || status === 408 ? 30_000 : 600_000
      putKeyInCooldown(key, cooldownMs)
      console.warn(
        `[ThinkiorAI] Tavily key …${key.slice(-6)} failed (status=${status}), cooling ${Math.round(
          cooldownMs / 1000
        )}s, trying next key:`,
        err instanceof Error ? err.message : err
      )
      // Continue to the next key
    }
  }

  console.error(
    "[ThinkiorAI] Tavily: all keys failed. Last error:",
    lastError instanceof Error ? lastError.message : lastError
  )
  return []
}

/** True if at least one Tavily key is configured. Useful for diagnostics. */
export function tavilyConfigured(): boolean {
  return getKeyPool().length > 0
}
