/**
 * THINKIOR — CARD PARSER
 * ─────────────────────────────────────────────────────────────────
 * LLM responses can be messy. The model may:
 *   - Put the card block in the middle of the response
 *   - Forget the closing "-->" (occasionally)
 *   - Include trailing commas
 *   - Wrap the comment in extra whitespace
 *   - Wrap the inner JSON in ```json fences anyway
 *
 * This parser is deliberately lenient. It tries multiple extraction
 * strategies, normalises the JSON, validates with Zod, and falls back
 * gracefully when the contract isn't met.
 * ─────────────────────────────────────────────────────────────────
 */

import { z, ZodTypeAny } from 'zod'
import {
  ValidatorCardSchema,
  ValidatorPreviewSchema,
  CompetitorCardSchema,
  IdeasCardSchema,
} from './cardSchemas'

export type CardKind = 'validator' | 'preview' | 'competitor' | 'ideas'

export interface ParsedMessage<T = unknown> {
  /** The original text, with the structured block removed. */
  text: string
  /** The parsed card, or null if extraction/validation failed. */
  card: T | null
  /** The card kind we detected, or null if nothing matched. */
  cardKind: CardKind | null
  /** Why parsing failed, if it did. Useful for debugging. */
  parseError?: string
}

const COMMENT_RE = /<!--\s*THINKIOR_(CARD|PREVIEW)\s*:\s*([\s\S]*?)\s*-->/i

const SCHEMAS: Record<CardKind, ZodTypeAny> = {
  validator: ValidatorCardSchema,
  preview: ValidatorPreviewSchema,
  competitor: CompetitorCardSchema,
  ideas: IdeasCardSchema,
}

/**
 * Strip the structured block out of the LLM response and return the
 * remaining human-readable text. Removes leading/trailing whitespace
 * and any leftover empty lines.
 */
export function stripStructuredBlock(text: string): string {
  return text
    .replace(COMMENT_RE, '')
    .replace(/```json\s*[\s\S]*?```/g, '') // safety: also strip raw json fences
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Best-effort JSON repair. Handles the most common LLM slip-ups.
 * For anything more complex we surface a parse error and let the UI
 * show a "we couldn't render the structured card" message.
 */
function tryRepairJson(raw: string): string {
  let s = raw.trim()
  // Strip code fences if the model wrapped the JSON anyway
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
  // Drop trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, '$1')
  // Replace literal newlines inside string values with \n
  // (the LLM occasionally drops the escaping)
  s = s.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (m) => {
    return m.replace(/\r?\n/g, '\\n')
  })
  return s
}

/**
 * Extract and parse a THINKIOR_CARD or THINKIOR_PREVIEW block.
 * Returns both the cleaned text and the parsed card (or null on failure).
 */
export function parseThinkiorCard<T = unknown>(
  rawText: string,
  kind: CardKind
): ParsedMessage<T> {
  const match = rawText.match(COMMENT_RE)
  if (!match) {
    return {
      text: stripStructuredBlock(rawText),
      card: null,
      cardKind: null,
      parseError: 'No structured block found in the response.',
    }
  }

  // The LLM emits either <!-- THINKIOR_CARD: ... --> or
  // <!-- THINKIOR_PREVIEW: ... -->. We map both to the appropriate
  // schema: PREVIEW → preview schema, CARD → requested kind's schema
  // (the caller knows which feature they're parsing for).
  const isPreview = match[1].toUpperCase() === 'PREVIEW'
  const detectedKind: CardKind = isPreview ? 'preview' : kind

  const jsonRaw = tryRepairJson(match[2])
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonRaw)
  } catch (e) {
    return {
      text: stripStructuredBlock(rawText),
      card: null,
      cardKind: detectedKind,
      parseError: `Invalid JSON in structured block: ${(e as Error).message}`,
    }
  }

  const schema = SCHEMAS[detectedKind] ?? SCHEMAS[kind]
  const result = schema.safeParse(parsed)

  if (!result.success) {
    return {
      text: stripStructuredBlock(rawText),
      card: null,
      cardKind: detectedKind,
      parseError: `Schema validation failed: ${result.error.issues
        .slice(0, 2)
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    }
  }

  return {
    text: stripStructuredBlock(rawText),
    card: result.data as T,
    cardKind: detectedKind,
  }
}

/**
 * Convenience: just check whether the LLM response contains a
 * parseable structured block. Returns the kind or null. Used by the
 * API route to decide whether to attach `card` to the response.
 */
export function detectCardKind(rawText: string): CardKind | null {
  const m = rawText.match(COMMENT_RE)
  if (!m) return null
  if (m[1].toUpperCase() === 'PREVIEW') return 'preview'
  // We can't tell THINKIOR_CARD apart from competitor vs validator
  // without a schema — let the caller decide based on the feature.
  return null
}
