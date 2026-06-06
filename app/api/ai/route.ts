import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiHandler } from '@/lib/ai/handler'
import { sanitizeMessages, sanitizeFeature } from '@/lib/utils/sanitize'
import { getValidatorPrompt } from '@/lib/ai/prompts/validator'
import { getCompetitorPrompt } from '@/lib/ai/prompts/competitor'
import { getIdeasPrompt } from '@/lib/ai/prompts/ideas'
import { getPitchPrompt } from '@/lib/ai/prompts/pitch'
import { getChatPrompt } from '@/lib/ai/prompts/chat'
import { getFounderContextBlock } from '@/lib/ai/prompts/masterPrompts'
import { PLAN_LIMITS } from '@/lib/constants'
import { checkRateLimit, acquireSlot, releaseSlot, incrementGlobalDaily } from '@/lib/rateLimit'
import { searxSearch, formatSearchContext } from '@/lib/search/searxng'
import { buildSearchQuery } from '@/lib/knowledge/thinkiorKnowledge'
import type { Plan, Feature } from '@/types'

const SEARCH_FEATURES = new Set(['competitor', 'validator', 'ideas'])

const COMPLEXITY: Record<string, 'simple' | 'complex'> = {
  validator: 'complex',
  competitor: 'complex',
  ideas: 'complex',
  pitch: 'complex',
  chat: 'simple',
}

function getSystemPrompt(feature: string, lastUserMessage: string): string {
  switch (feature) {
    case 'validator':
      return getValidatorPrompt(lastUserMessage)
    case 'competitor':
      return getCompetitorPrompt(lastUserMessage)
    case 'ideas':
      return getIdeasPrompt(lastUserMessage)
    case 'pitch':
      return getPitchPrompt(lastUserMessage)
    case 'chat':
    default:
      return getChatPrompt(lastUserMessage)
  }
}

/**
 * Extract score and verdict from AI response text using regex.
 * Returns { score, verdict, summary } or nulls if not found.
 */
function extractScoreAndVerdict(text: string): {
  score: number | null
  verdict: string | null
  summary: string | null
} {
  let verdict: string | null = null
  let score: number | null = null

  // Match patterns like "VERDICT: GO · Score: 8.5/10" or "## VERDICT: KILL"
  const verdictMatch = text.match(/VERDICT:\s*(GO|KILL|PIVOT)/i)
  if (verdictMatch) verdict = verdictMatch[1].toUpperCase()

  // Match patterns like "Score: 8.5/10" or "Score: 7.0"
  const scoreMatch = text.match(/Score:\s*(\d+\.?\d*)\/10/i)
  if (scoreMatch) score = parseFloat(scoreMatch[1])

  // Also check "Fundability Score: X.X/10" for pitch evaluator
  if (!score) {
    const fundMatch = text.match(/Fundability Score:\s*(\d+\.?\d*)\/10/i)
    if (fundMatch) score = parseFloat(fundMatch[1])
  }

  // Generate a summary from the first meaningful line after verdict
  let summary: string | null = null
  if (verdict || score) {
    const lines = text.split('\n').filter((l) => l.trim().length > 10)
    const summaryLine = lines.find(
      (l) =>
        !l.startsWith('#') &&
        !l.startsWith('|') &&
        !l.includes('VERDICT') &&
        !l.includes('Score:')
    )
    if (summaryLine) {
      summary = summaryLine.replace(/[*#]/g, '').trim().slice(0, 80)
    }
  }

  return { score, verdict, summary }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const feature = sanitizeFeature(body.feature) as Feature
    const messages = sanitizeMessages(body.messages)

    if (!feature) {
      return NextResponse.json({ error: 'Invalid feature' }, { status: 400 })
    }
    if (messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    const plan = (profile?.plan ?? 'free') as Plan

    // ── Global rate limit (concurrency + cooldown + daily cap) ──
    const rateCheck = await checkRateLimit(user.id, plan, supabase)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', code: rateCheck.code, message: rateCheck.message },
        { status: 429 }
      )
    }

    // ── Per-feature daily limit ──────────────────────────────────
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
          message: `You've reached your daily limit for ${feature}. Upgrade your plan for more.`,
          limit,
          used: currentCount,
        },
        { status: 429 }
      )
    }

    // ── Fetch founder memory for context injection ──────────────
    const [{ data: founderProfile }, { data: founderSessions }] = await Promise.all([
      supabase.from('founder_profiles').select('*').eq('user_id', user.id).single(),
      supabase
        .from('founder_sessions')
        .select('module, session_title, verdict, score, summary')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    const founderContext = getFounderContextBlock(founderProfile, founderSessions ?? [])

    const lastUserMessage =
      messages.filter((m) => m.role === 'user').pop()?.content ?? ''
    const basePrompt = getSystemPrompt(feature, lastUserMessage)

    const systemPrompt = founderContext
      ? `${founderContext}\n\n${basePrompt}`
      : basePrompt

    let searchContext = ''
    if (SEARCH_FEATURES.has(feature)) {
      const query = buildSearchQuery(feature, lastUserMessage)
      const results = await searxSearch(query)
      searchContext = formatSearchContext(results)
    }

    const conversationPrompt =
      messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n') +
      searchContext

    // ── Acquire slot — released in finally regardless of outcome ─
    acquireSlot(user.id)
    let response: Awaited<ReturnType<typeof aiHandler>>
    try {
      response = await aiHandler({
        prompt: conversationPrompt,
        systemPrompt,
        feature,
        complexity: COMPLEXITY[feature] ?? 'simple',
      })
    } finally {
      releaseSlot(user.id)
    }

    await Promise.all([
      supabase.from('daily_usage').upsert(
        { user_id: user.id, feature, date: today, count: currentCount + 1 },
        { onConflict: 'user_id,feature,date' }
      ),
      incrementGlobalDaily(user.id, supabase),
      supabase.from('activity_log').insert({
        user_id: user.id,
        feature,
        title: lastUserMessage.slice(0, 100),
        summary: response.result.slice(0, 200),
      }),
    ])

    // ── Save session to founder_sessions for memory ─────────────
    try {
      const extracted = extractScoreAndVerdict(response.result)
      await supabase.from('founder_sessions').insert({
        user_id: user.id,
        module: feature,
        session_title: founderProfile?.idea_name || lastUserMessage.slice(0, 60),
        verdict: extracted.verdict,
        score: extracted.score,
        summary: extracted.summary || response.result.slice(0, 100),
        full_output: {
          messages,
          result: response.result,
          provider: response.provider,
        },
      })
    } catch {
      // Non-critical — don't fail the request if session save fails
    }

    return NextResponse.json({ reply: response.result, provider: response.provider })
  } catch (err) {
    console.error('[API/AI]', err)
    return NextResponse.json(
      { error: 'AI is temporarily unavailable. Please try again.' },
      { status: 500 }
    )
  }
}

