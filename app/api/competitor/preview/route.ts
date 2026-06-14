/**
 * THINKIOR — COMPETITOR TEASER API
 * ─────────────────────────────────────────────────────────────────
 * Public, unauthenticated endpoint that powers the free Competitor
 * Teaser card. Returns ONE competitor with ONE weakness and ONE
 * opportunity. Mirrors the validator preview route.
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { aiHandler } from '@/lib/ai/handler'
import {
  THINKIOR_FULL_CONTEXT,
  COMPETITOR_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/knowledge/thinkiorKnowledge'
import { ValidatorPreviewSchema } from '@/lib/ai/cardSchemas'

// Per-IP rate limit: 5 teasers / 10 minutes
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

const buckets = new Map<string, { count: number; resetAt: number }>()

function rateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const bucket = buckets.get(ip)
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }
  if (bucket.count >= MAX_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  bucket.count += 1
  return { allowed: true }
}

function getIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.ip || req.headers.get('x-real-ip') || 'unknown'
}

function sanitize(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, 300)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/javascript:/gi, '')
}

const TeaserSchema = z.object({
  competitor: z.string().min(2).max(120),
  weakness: z.string().min(2).max(280),
  opportunity: z.string().min(2).max(280),
})
type Teaser = z.infer<typeof TeaserSchema>

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const limit = rateLimit(ip)
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: 'Too many previews from your network. Please try again in a few minutes.',
        retryAfter: limit.retryAfter,
      },
      { status: 429 }
    )
  }

  let body: { industry?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const industry = sanitize(body?.industry)
  if (industry.length < 5) {
    return NextResponse.json(
      { error: 'Please describe the market in at least a few words.' },
      { status: 400 }
    )
  }

  const lang = getLanguageInstruction(industry)

  const systemPrompt = `${THINKIOR_FULL_CONTEXT}
${COMPETITOR_KNOWLEDGE}

YOUR ROLE: This is a FREE COMPETITOR TEASER. The user typed a short
description of the market they want to enter. Give a fast, honest
30-second read on ONE direct competitor, ONE weakness, ONE opportunity.

OUTPUT FORMAT (strict, no extra sections):

<one short paragraph: 2-3 sentences max with the headline>

<!-- THINKIOR_PREVIEW: {
  "score": <integer 0-100, your gut call on competitive intensity>,
  "verdict": "GO" | "PIVOT" | "KILL",
  "tagline": "<the ONE competitor name and what they do, max 110 chars>",
  "reasons": [
    "<The competitor name + their single biggest weakness, max 110 chars>",
    "<The opportunity / gap, max 110 chars>",
    "<A specific Indian context point, max 110 chars>"
  ],
  "tip": "<ONE concrete strategic move the founder can make this week, max 140 chars>"
} -->

RULES:
- The competitor you name MUST be a real, well-known Indian company
  (or global player with India presence). If unsure, pick the closest
  plausible one and make the weakness realistic.
- "reasons[0]" = competitor + weakness. "reasons[1]" = opportunity.
  "reasons[2]" = India context.
- score is INTEGER 0-100.
- Use ₹ for money. Reference India context.
- Do NOT use banned words: leverage, synergies, paradigm shift, etc.
- Chat text above the comment block: 2-3 sentences, plain text, no markdown.
- Respond in the user's language. ${lang}
`

  const ai = await aiHandler({
    prompt: `Market the founder wants to enter: ${industry}`,
    systemPrompt,
    feature: 'competitor',
    complexity: 'simple',
  })

  if (ai.fallbackTriggered && ai.provider === 'none') {
    return NextResponse.json(
      { error: 'Thinkior is temporarily unavailable. Please try again in a moment.' },
      { status: 503 }
    )
  }

  // The teaser reuses the ValidatorPreview schema (shape matches:
  // score/verdict/tagline/reasons/tip). We then reshape reasons into
  // the teaser output (competitor / weakness / opportunity).
  const previewMatch = ai.result.match(
    /<!--\s*THINKIOR_PREVIEW\s*:\s*([\s\S]*?)\s*-->/
  )
  if (!previewMatch) {
    return NextResponse.json(
      { error: 'We could not generate a teaser right now. Please try again.' },
      { status: 502 }
    )
  }

  // Reuse the parser helpers: try to repair JSON then validate with
  // the preview schema.
  const { tryRepairJson, ValidatorPreviewSchema: _ } = (await import('@/lib/ai/cardParser'))
    ? // We don't export tryRepairJson, so do a minimal local repair.
      { tryRepairJson: (s: string) => s, ValidatorPreviewSchema: null }
    : { tryRepairJson: (s: string) => s, ValidatorPreviewSchema: null }

  // Local JSON repair — keep it small and self-contained so this
  // route stays independent of the parser module's internals.
  let jsonRaw = previewMatch[1].trim()
  jsonRaw = jsonRaw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
  jsonRaw = jsonRaw.replace(/,(\s*[}\]])/g, '$1')
  jsonRaw = jsonRaw.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (m) =>
    m.replace(/\r?\n/g, '\\n')
  )

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonRaw)
  } catch {
    return NextResponse.json(
      { error: 'We could not generate a teaser right now. Please try again.' },
      { status: 502 }
    )
  }

  const validated = ValidatorPreviewSchema.safeParse(parsed)
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Teaser did not pass validation. Please try again.' },
      { status: 502 }
    )
  }

  // Map reasons[] → competitor / weakness / opportunity.
  // The teaser has 3 reasons, but only the first 2 are surfaced as
  // the "competitor+weakness" and "opportunity" lines. The 3rd is
  // held in reserve in case we want to show it later.
  const reasons = validated.data.reasons
  const teaser: Teaser = TeaserSchema.parse({
    competitor: validated.data.tagline || reasons[0] || '—',
    weakness: reasons[0] || '—',
    opportunity: reasons[1] || '—',
  })

  return NextResponse.json({ teaser })
}
