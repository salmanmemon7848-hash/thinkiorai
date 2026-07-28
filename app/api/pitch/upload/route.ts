/**
 * THINKIOR — PITCH DECK UPLOAD API
 * ─────────────────────────────────────────────────────────────────
 * Accepts a PDF pitch deck, extracts the text via pdf-parse, and
 * runs the Pitch Evaluator against the deck content.
 *
 * Auth + plan + daily quota checks mirror /api/ai. The extracted
 * text is appended to the founder context, the model is told this
 * is a deck (not a chat paste), and we return the parsed
 * THINKIOR_CARD JSON plus a short text preview for transparency.
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiHandler } from '@/lib/ai/handler'
import { getPitchPrompt } from '@/lib/ai/prompts/pitch'
import { getFounderContextBlock } from '@/lib/ai/prompts/masterPrompts'
import { PLAN_LIMITS } from '@/lib/constants'
import { checkRateLimit, acquireSlot, releaseSlot } from '@/lib/rateLimit'
import { parseThinkiorCard } from '@/lib/ai/cardParser'
import { PitchCardSchema } from '@/lib/ai/cardSchemas'
import type { Plan, Feature } from '@/types'
import { effectivePlan } from '@/lib/plan'

// pdf-parse is a CJS module — dynamic import keeps the Edge bundle
// (if any) clean and lets us handle the import failure gracefully.
async function loadPdfParse() {
  try {
    const mod = await import('pdf-parse')
    return (mod as { default: (buf: Buffer) => Promise<{ text: string; numpages: number }> })
      .default
  } catch (e) {
    throw new Error(
      'PDF parser not available. Run `npm install pdf-parse @types/pdf-parse` and restart the dev server.'
    )
  }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_TEXT_CHARS = 30_000 // sent to the LLM

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Plan + quota ──────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_expires_at')
      .eq('id', user.id)
      .single()
    const plan = effectivePlan(profile)

    const rateCheck = await checkRateLimit(user.id, plan, supabase)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', code: rateCheck.code, message: rateCheck.message },
        { status: 429 }
      )
    }

    const feature: Feature = 'pitch'
    const limit = PLAN_LIMITS[plan][feature]
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('feature', feature)
      .eq('date', today)
      .single()
    const currentCount = usage?.count ?? 0
    if (currentCount >= limit) {
      return NextResponse.json(
        {
          error: 'daily_limit',
          message: `You've reached your daily limit for pitch. Upgrade for more.`,
          limit,
          used: currentCount,
        },
        { status: 429 }
      )
    }

    // ── Multipart parse ──────────────────────────────────────
    const form = await req.formData().catch(() => null)
    if (!form) {
      return NextResponse.json({ error: 'Could not read the upload.' }, { status: 400 })
    }
    const file = form.get('deck')
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Please attach a PDF file under the "deck" field.' },
        { status: 400 }
      )
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported.' },
        { status: 400 }
      )
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'PDF is too large (max 10 MB).' },
        { status: 400 }
      )
    }

    // ── Extract text ──────────────────────────────────────────
    const pdfParse = await loadPdfParse()
    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = await pdfParse(buffer)
    const fullText = (parsed.text || '').replace(/\s+/g, ' ').trim()

    if (fullText.length < 50) {
      return NextResponse.json(
        {
          error:
            'We could not extract enough text from this PDF. It may be image-only (scanned) or password-protected. Try a text-based PDF or paste your slides as text.',
        },
        { status: 400 }
      )
    }

    const truncated =
      fullText.length > MAX_TEXT_CHARS
        ? fullText.slice(0, MAX_TEXT_CHARS) + '\n\n[…truncated for length…]'
        : fullText

    // ── Founder context ───────────────────────────────────────
    const { data: founderProfile } = await supabase
      .from('founder_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    const founderContext = founderProfile
      ? getFounderContextBlock(founderProfile, [])
      : ''

    const systemPrompt = [
      founderContext,
      getPitchPrompt(truncated, /* isDeck */ true),
    ]
      .filter(Boolean)
      .join('\n\n')

    // ── Run LLM ───────────────────────────────────────────────
    acquireSlot(user.id)
    let response: Awaited<ReturnType<typeof aiHandler>>
    try {
      response = await aiHandler({
        prompt: `Uploaded deck (${file.name}, ${parsed.numpages} pages):\n\n${truncated}`,
        systemPrompt,
        feature: 'pitch',
        complexity: 'complex',
      })
    } finally {
      releaseSlot(user.id)
    }

    if (response.fallbackTriggered && response.provider === 'none') {
      return NextResponse.json(
        { error: 'Thinkior is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }

    // ── Parse the structured card ─────────────────────────────
    const cardParsed = parseThinkiorCard(response.result, 'pitch')
    if (!cardParsed.card) {
      // Persist the raw text for the founder to read even if the
      // card parse failed — better than nothing.
      return NextResponse.json(
        {
          error:
            'The model did not return a valid pitch scorecard. Please try again or paste your slides as text.',
          details: cardParsed.parseError,
          raw: response.result.slice(0, 4000),
        },
        { status: 502 }
      )
    }

    const validated = PitchCardSchema.safeParse(cardParsed.card)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Pitch card did not pass validation.' },
        { status: 502 }
      )
    }

    // ── Record usage + activity ───────────────────────────────
    await Promise.all([
      supabase.from('daily_usage').upsert(
        { user_id: user.id, feature, date: today, count: currentCount + 1 },
        { onConflict: 'user_id,feature,date' }
      ),
      supabase.from('activity_log').insert({
        user_id: user.id,
        feature,
        title: file.name.slice(0, 100),
        summary: cardParsed.text.slice(0, 200),
        metadata: { kind: 'deck_upload', pages: parsed.numpages, score: validated.data.score, tier: validated.data.tier },
      }),
    ])

    return NextResponse.json({
      card: validated.data,
      preview: truncated.slice(0, 1200),
      provider: response.provider,
    })
  } catch (err) {
    console.error('[API/pitch/upload]', err)
    return NextResponse.json(
      { error: (err as Error).message || 'Could not process the deck.' },
      { status: 500 }
    )
  }
}
