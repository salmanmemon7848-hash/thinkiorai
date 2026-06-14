/**
 * THINKIOR — VALIDATOR FAST PREVIEW API
 * ─────────────────────────────────────────────────────────────────
 * Public, unauthenticated endpoint that powers the free FastPreview
 * card. Returns ONLY the parsed `<!-- THINKIOR_PREVIEW: {...} -->`
 * JSON. Keeps the marketing top-of-funnel moving.
 *
 * Rate limited per IP to prevent abuse. NOT counted against the
 * user's daily quota (this is the free teaser).
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { aiHandler } from '@/lib/ai/handler'
import { getValidatorPrompt } from '@/lib/ai/prompts/validator'
import { parseThinkiorCard } from '@/lib/ai/cardParser'
import { ValidatorPreviewSchema } from '@/lib/ai/cardSchemas'

// Per-IP rate limit: 5 previews / 10 minutes
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

// In-memory bucket. Good enough for a low-traffic preview endpoint.
// In production this should live in Redis / Upstash, but for a
// free teaser endpoint the cost of an in-memory store is acceptable
// and avoids adding infrastructure.
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

function sanitizeIdea(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, 600)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '') // no nested structured blocks from user
    .replace(/javascript:/gi, '')
}

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

  let body: { idea?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const idea = sanitizeIdea(body?.idea)
  if (idea.length < 8) {
    return NextResponse.json(
      { error: 'Please describe your idea in at least one full sentence.' },
      { status: 400 }
    )
  }

  const systemPrompt = getValidatorPrompt(idea, /* isPreview */ true)

  const ai = await aiHandler({
    prompt: `Founder's idea: ${idea}`,
    systemPrompt,
    feature: 'validator',
    complexity: 'simple', // preview is short
  })

  if (ai.fallbackTriggered && ai.provider === 'none') {
    return NextResponse.json(
      { error: 'Thinkior is temporarily unavailable. Please try again in a moment.' },
      { status: 503 }
    )
  }

  const parsed = parseThinkiorCard(ai.result, 'preview')
  if (!parsed.card) {
    return NextResponse.json(
      {
        error: 'We could not generate a preview right now. Please try again.',
        details: parsed.parseError,
      },
      { status: 502 }
    )
  }

  // Double-validate with the strict schema (defence in depth)
  const validated = ValidatorPreviewSchema.safeParse(parsed.card)
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Preview did not pass validation. Please try again.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ preview: validated.data })
}
