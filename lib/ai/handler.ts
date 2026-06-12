import { getUnifiedApiKey, fetchWithUnifiedKey } from '../unifiedApiKey'

export type TaskComplexity = 'simple' | 'complex'

interface HandlerInput {
  prompt: string
  systemPrompt: string
  feature: string
  complexity: TaskComplexity
}

interface HandlerOutput {
  result: string
  provider: string
  fallbackTriggered: boolean
}

// Model selection per provider
// Groq: llama-3.1-8b-instant (simple) / llama-3.3-70b-versatile (complex)
// Cerebras: llama3.1-8b (simple) / llama-3.3-70b (complex) — same family
const MODELS = {
  groq: {
    simple: 'llama-3.1-8b-instant',
    complex: 'llama-3.3-70b-versatile',
  },
  cerebras: {
    simple: 'llama3.1-8b',
    complex: 'llama-3.3-70b',
  },
} as const

const ENDPOINTS = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  cerebras: 'https://api.cerebras.ai/v1/chat/completions',
} as const

type Provider = keyof typeof ENDPOINTS

// Build a list of (provider, apiKey) candidates in priority order.
// The key determines which provider the candidate is for — any
// GROQ_* key is a Groq key, any CEREBRAS_* key is a Cerebras key.
function getKeyCandidates(): Array<{ provider: Provider; key: string }> {
  const out: Array<{ provider: Provider; key: string }> = []
  const env = process.env

  for (const name of [
    'GROQ_API_KEY',
    'GROQ_API_KEY_2',
    'GROQ_API_KEY_3',
    'GROQ_FALLBACK_API_KEY_1',
    'GROQ_FALLBACK_API_KEY_2',
    'GROQ_FALLBACK_API_KEY_3',
  ]) {
    if (env[name]) out.push({ provider: 'groq', key: env[name]! })
  }
  for (const name of [
    'CEREBRAS_API_KEY',
    'CEREBRAS_FALLBACK_API_KEY_1',
    'CEREBRAS_FALLBACK_API_KEY_2',
  ]) {
    if (env[name]) out.push({ provider: 'cerebras', key: env[name]! })
  }
  return out
}

interface ChatResponse {
  choices?: Array<{ message?: { content?: string | null } }>
}

async function callProvider(
  provider: Provider,
  apiKey: string,
  input: HandlerInput
): Promise<string> {
  const model = MODELS[provider][input.complexity]
  const url = ENDPOINTS[provider]
  const body = {
    model,
    messages: [
      { role: 'system', content: input.systemPrompt },
      { role: 'user', content: input.prompt },
    ],
    max_tokens: input.complexity === 'simple' ? 1024 : 4096,
    temperature: 0.7,
  }

  // We bypass fetchWithUnifiedKey here because we need per-provider
  // endpoint selection, not just a single URL. We still want 401/403/429
  // to bubble up so the outer retry loop can pick the next candidate.
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    // Vercel/Next: keep serverless function snappy
    signal: AbortSignal.timeout(25_000),
  })

  if (!res.ok) {
    // Throw a tagged error so the caller knows it's a retryable status
    const err = new Error(`${provider} HTTP ${res.status}`) as Error & {
      status?: number
      provider?: string
    }
    err.status = res.status
    err.provider = provider
    throw err
  }

  const data = (await res.json()) as ChatResponse
  const text = data.choices?.[0]?.message?.content ?? ''
  return text.trim()
}

// Small helper to sleep — used for the 1.5s backoff between candidates.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Balanced fallback strategy:
 *  - Walk the unified key list in priority order (Groq primary → Groq
 *    fallback → Cerebras).
 *  - On 429 / 5xx / network error → sleep 1500ms → try next.
 *  - On 401 / 403 → try next immediately (key is dead, no point waiting).
 *  - On any other 4xx (e.g. 400 bad request) → bail out, the prompt is
 *    the problem, not the key.
 *  - Hard wall: total 2 retries per call (so 3 candidate attempts max).
 *  - Outer Promise.race timeout of 28s keeps Vercel serverless happy.
 */
export async function aiHandler(input: HandlerInput): Promise<HandlerOutput> {
  const candidates = getKeyCandidates()
  if (candidates.length === 0) {
    console.error('[AI] No API keys configured (set GROQ_API_KEY or CEREBRAS_API_KEY)')
    return {
      result: 'Thinkior is temporarily unavailable. Please try again in a moment.',
      provider: 'none',
      fallbackTriggered: true,
    }
  }

  const MAX_ATTEMPTS = Math.min(3, candidates.length)
  const lastErrors: string[] = []

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const { provider, key } = candidates[i]
    const attemptNum = i + 1

    try {
      const result = await Promise.race([
        callProvider(provider, key, input),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI timeout')), 28_000)
        ),
      ])

      if (!result || result.length === 0) {
        throw new Error('Empty response from provider')
      }

      return {
        result,
        provider: attemptNum === 1 ? provider : `${provider} (fallback #${attemptNum - 1})`,
        fallbackTriggered: attemptNum > 1,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const status = (err as { status?: number }).status
      lastErrors.push(`${provider}#${attemptNum}: ${msg}`)

      // 4xx other than 429 → user's fault, no point retrying
      if (status && status >= 400 && status < 500 && status !== 429) {
        console.error(`[AI] ${provider} ${status} — non-retryable, aborting:`, msg)
        break
      }

      // 429 / 5xx / network — backoff and try next candidate
      if (i < MAX_ATTEMPTS - 1) {
        const wait = status === 429 ? 1500 : 800
        await sleep(wait)
        continue
      }
    }
  }

  console.error('[AI] All candidates failed:', lastErrors.join(' | '))
  return {
    result: 'Thinkior is temporarily unavailable. Please try again in a moment.',
    provider: 'none',
    fallbackTriggered: true,
  }
}

// Re-export so existing callers that imported getUnifiedApiKey still work
export { getUnifiedApiKey, fetchWithUnifiedKey }
