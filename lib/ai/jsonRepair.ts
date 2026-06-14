/**
 * THINKIOR — JSON REPAIR
 * ─────────────────────────────────────────────────────────────────
 * LLM responses are messy. Models can:
 *   - Wrap JSON in ```json fences even when asked not to
 *   - Add a stray preamble like "Sure! Here is the report:"
 *   - Forget to escape quotes inside string values
 *   - Truncate mid-object when max_tokens is hit
 *   - Emit a plain "An error occurred" string instead of JSON
 *
 * `safeParseJsonObject` does the best it can:
 *   1. Returns null for non-string / empty input
 *   2. Strips code fences
 *   3. Tries to extract the first balanced {...} or [...] block
 *   4. Tries multiple JSON.parse attempts with progressive repair:
 *      - trailing-comma removal
 *      - escape literal newlines inside strings
 *      - escape stray control characters
 *   5. Returns the parsed value or null
 *
 * The caller MUST check for null and treat it as "AI returned
 * garbage" — that path always means a clean 502 to the UI, never
 * a 500 with raw text leaking into the error.
 *
 * Throws nothing.
 */

export interface JsonRepairResult {
  ok: boolean
  value: unknown
  /** When ok=false, the original raw text (for logging). */
  raw: string
  /** Optional diagnostic when parse failed. */
  error?: string
  /** Was a balanced-JSON extraction needed? (true = messy response) */
  extracted: boolean
  /** Was any repair step applied? */
  repaired: boolean
}

export function safeParseJson(raw: string): JsonRepairResult {
  const result: JsonRepairResult = {
    ok: false,
    value: null,
    raw,
    extracted: false,
    repaired: false,
  }

  if (typeof raw !== 'string' || raw.length === 0) {
    result.error = 'Empty response'
    return result
  }

  // Step 1: strip outer code fences if the model wrapped the JSON
  // in ```json ... ``` anyway.
  let text = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')

  // Step 2: if the response is clearly NOT JSON (e.g. "An error
  // occurred", or a friendly preamble with no JSON), try to
  // extract the first balanced {...} or [...] block.
  if (!/^[\s]*[{\[]/.test(text)) {
    const extracted = extractFirstBalancedBlock(text)
    if (extracted) {
      text = extracted
      result.extracted = true
    } else {
      result.error = 'No JSON object/array found in response'
      return result
    }
  }

  // Step 3: try parsing the cleaned text. If that fails, try
  // progressive repairs.
  const attempts: string[] = [text]
  attempts.push(removeTrailingCommas(text))
  attempts.push(escapeStringControlChars(text))
  attempts.push(removeTrailingCommas(escapeStringControlChars(text)))

  for (let i = 0; i < attempts.length; i++) {
    try {
      result.value = JSON.parse(attempts[i]!)
      result.ok = true
      result.repaired = i > 0
      return result
    } catch (e) {
      // continue to next attempt
      result.error = (e as Error).message
    }
  }

  return result
}

// ── Internal helpers ───────────────────────────────────────────

function removeTrailingCommas(s: string): string {
  return s.replace(/,(\s*[}\]])/g, '$1')
}

/** Escape literal newlines / tabs / control chars inside string values.
 *  The model occasionally drops the escaping.
 *  The regex matches a quoted string and replaces any CR/LF/TAB inside
 *  with the escape form.
 */
function escapeStringControlChars(s: string): string {
  return s.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (m) =>
    m.replace(/\r?\n/g, '\\n').replace(/\t/g, '\\t')
  )
}

/** Find the first balanced {...} or [...] block in the text. */
function extractFirstBalancedBlock(s: string): string | null {
  const trimmed = s.trim()
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed[i]
    if (c !== '{' && c !== '[') continue
    const close = c === '{' ? '}' : ']'
    let depth = 0
    let inString = false
    let escape = false
    for (let j = i; j < trimmed.length; j++) {
      const ch = trimmed[j]
      if (inString) {
        if (escape) escape = false
        else if (ch === '\\') escape = true
        else if (ch === '"') inString = false
        continue
      }
      if (ch === '"') {
        inString = true
        continue
      }
      if (ch === c) depth += 1
      else if (ch === close) {
        depth -= 1
        if (depth === 0) return trimmed.slice(i, j + 1)
      }
    }
  }
  return null
}
