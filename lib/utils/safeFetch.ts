/**
 * THINKIOR — SAFE FETCH JSON
 * ─────────────────────────────────────────────────────────────────
 * Centralized fetch wrapper that never throws "is not valid JSON"
 * when the server returns an HTML error page (Vercel/Cloudflare 502,
 * Next.js error boundary, plain "An error occurred" text, etc.).
 *
 * Why this exists:
 *   Several features used to do `await res.json()` directly. When
 *   the API route crashed *before* returning a JSON body, the
 *   response was an HTML page (or sometimes a plain text body
 *   like "An error occurred"). JSON.parse then blew up with
 *   `Unexpected token 'A', "An error o"... is not valid JSON` and
 *   the user saw a raw parser error in the UI.
 *
 * What this does:
 *   1. Read the response as text first (cheap, always works).
 *   2. Try to parse it as JSON.
 *   3. If parsing fails, surface a friendly Error with the
 *      status code and a short preview of the body, so the UI
 *      can show a real message instead of a parser stack trace.
 *   4. If parsing succeeds, return the parsed value.
 *
 * Non-JSON 2xx responses (rare) are still returned as `{ raw }`
 * so callers can decide what to do.
 */

export interface SafeFetchJsonOptions extends RequestInit {
  /** If true, treat any 2xx as success. Default: true. */
  okStatuses?: number[]
}

export class FetchError extends Error {
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly bodyPreview: string

  constructor(
    message: string,
    init: {
      status: number
      statusText: string
      url: string
      bodyPreview: string
    }
  ) {
    super(message)
    this.name = 'FetchError'
    this.status = init.status
    this.statusText = init.statusText
    this.url = init.url
    this.bodyPreview = init.bodyPreview
  }
}

function preview(text: string, max = 200): string {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max) + '…'
}

function looksLikeHtml(text: string): boolean {
  const head = text.slice(0, 64).trim().toLowerCase()
  return (
    head.startsWith('<!doctype') ||
    head.startsWith('<html') ||
    head.startsWith('<?xml') ||
    head.startsWith('<head') ||
    head.startsWith('<body')
  )
}

export async function safeFetchJson<T = unknown>(
  input: RequestInfo | URL,
  init: SafeFetchJsonOptions = {}
): Promise<T> {
  const res = await fetch(input, init)

  // Read the body once, as text, so we can both inspect and parse it.
  const rawText = await res.text()

  // Try to parse JSON. If it fails, fall through to a friendly error.
  let parsed: unknown = undefined
  let parseError: unknown = undefined
  if (rawText.length > 0) {
    try {
      parsed = JSON.parse(rawText)
    } catch (err) {
      parseError = err
    }
  }

  const okStatuses = init.okStatuses ?? [200, 201, 202, 204]
  const isOk = okStatuses.includes(res.status)

  if (!isOk) {
    // Prefer a server-supplied message if we managed to parse JSON.
    let serverMsg = ''
    if (parsed && typeof parsed === 'object') {
      const p = parsed as Record<string, unknown>
      serverMsg =
        (typeof p.message === 'string' && p.message) ||
        (typeof p.error === 'string' && p.error) ||
        (typeof p.details === 'string' && p.details) ||
        (typeof p.detail === 'string' && p.detail) ||
        ''
    }
    if (!serverMsg && looksLikeHtml(rawText)) {
      serverMsg = `Server returned an HTML error page (${res.status}).`
    }
    if (!serverMsg && rawText) {
      serverMsg = preview(rawText, 160)
    }
    throw new FetchError(
      serverMsg || `${res.status} ${res.statusText || 'Request failed'}`,
      {
        status: res.status,
        statusText: res.statusText,
        url: typeof input === 'string' ? input : input.toString(),
        bodyPreview: preview(rawText),
      }
    )
  }

  if (parseError) {
    // 2xx but the body wasn't JSON. This is a server bug, but we
    // still want the UI to render something useful, not a stack trace.
    if (looksLikeHtml(rawText)) {
      throw new FetchError(
        'Server returned an unexpected HTML response. Please try again.',
        {
          status: res.status,
          statusText: res.statusText,
          url: typeof input === 'string' ? input : input.toString(),
          bodyPreview: preview(rawText),
        }
      )
    }
    throw new FetchError(
      `Server returned a non-JSON response: ${preview(rawText, 120)}`,
      {
        status: res.status,
        statusText: res.statusText,
        url: typeof input === 'string' ? input : input.toString(),
        bodyPreview: preview(rawText),
      }
    )
  }

  return parsed as T
}
