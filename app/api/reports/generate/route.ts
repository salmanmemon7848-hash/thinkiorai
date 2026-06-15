import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deepResearch } from '@/lib/research/deepResearch'
import {
  getReportSystemPrompt,
  buildReportSearchQueries,
  buildReportUserPrompt,
  type ReportInput,
} from '@/lib/ai/prompts/report'
import { PLAN_LIMITS, PLAN_GATED_FEATURES } from '@/lib/constants'
import { checkRateLimit, acquireSlot, releaseSlot, incrementGlobalDaily } from '@/lib/rateLimit'
import { sanitizeString } from '@/lib/utils/sanitize'
import { safeParseJson } from '@/lib/ai/jsonRepair'
import type { Plan } from '@/types'

export const maxDuration = 60

// ── Provider endpoints (same as lib/ai/handler.ts) ──────────────────────────
const PROVIDER_ENDPOINTS = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  cerebras: 'https://api.cerebras.ai/v1/chat/completions',
} as const

type Provider = keyof typeof PROVIDER_ENDPOINTS

// Best models per provider for long-form JSON generation
const PROVIDER_MODELS: Record<Provider, string[]> = {
  groq: [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
  ],
  cerebras: ['llama-3.3-70b'],
}

interface KeyCandidate {
  provider: Provider
  key: string
  model: string
}

/**
 * Build an ordered list of (provider, key, model) candidates.
 * Mirrors getKeyCandidates() in lib/ai/handler.ts so reports get
 * the same robust key-rotation + Cerebras fallback that chat features use.
 */
function getAllKeyCandidates(): KeyCandidate[] {
  const out: KeyCandidate[] = []
  const env = process.env

  // Groq keys — try every model for each key (rotated per minute to spread load)
  const groqKeys: string[] = []
  for (const name of [
    'GROQ_API_KEY',
    'GROQ_API_KEY_2',
    'GROQ_API_KEY_3',
    'GROQ_FALLBACK_API_KEY_1',
    'GROQ_FALLBACK_API_KEY_2',
    'GROQ_FALLBACK_API_KEY_3',
  ]) {
    if (env[name]) groqKeys.push(env[name]!)
  }
  // Add primary model for each Groq key first (best quality), then fallback models
  for (const model of PROVIDER_MODELS.groq) {
    for (const key of groqKeys) {
      out.push({ provider: 'groq', key, model })
    }
  }

  // Cerebras keys — no response_format support but good as last resort
  for (const name of [
    'CEREBRAS_API_KEY',
    'CEREBRAS_FALLBACK_API_KEY_1',
    'CEREBRAS_FALLBACK_API_KEY_2',
  ]) {
    if (env[name]) {
      out.push({ provider: 'cerebras', key: env[name]!, model: PROVIDER_MODELS.cerebras[0] })
    }
  }

  return out
}

function cleanInput(raw: unknown): ReportInput | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const industry = sanitizeString(r.industry, 200)
  const reportType = sanitizeString(r.reportType, 200)
  const businessStage = sanitizeString(r.businessStage, 200)
  if (!industry || !reportType || !businessStage) return null

  return {
    reportType,
    industry,
    businessStage,
    businessName: sanitizeString(r.businessName, 200),
    businessDescription: sanitizeString(r.businessDescription, 2000),
    productService: sanitizeString(r.productService, 500),
    targetMarket: sanitizeString(r.targetMarket, 500),
    currentRevenue: sanitizeString(r.currentRevenue, 100),
    mainChallenge: sanitizeString(r.mainChallenge, 2000),
    competitors: sanitizeString(r.competitors, 500),
    goals: sanitizeString(r.goals, 2000),
    teamSize: sanitizeString(r.teamSize, 100),
    location: sanitizeString(r.location, 200),
    fundingStatus: sanitizeString(r.fundingStatus, 200),
    uniqueAdvantage: sanitizeString(r.uniqueAdvantage, 500),
  }
}

/**
 * Call one provider/key/model combo. Returns raw content string.
 * Throws a tagged error on failure so the caller can decide to retry.
 */
async function callProviderForReport(
  candidate: KeyCandidate,
  input: ReportInput,
  searchContext: string
): Promise<string> {
  const body: Record<string, unknown> = {
    model: candidate.model,
    messages: [
      { role: 'system', content: getReportSystemPrompt(input) },
      { role: 'user', content: buildReportUserPrompt(input, searchContext) },
    ],
    temperature: 0.4,
    max_tokens: 6000,
  }
  // Groq supports JSON-object mode; Cerebras does not — rely on prompt instruction
  if (candidate.provider === 'groq') {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(PROVIDER_ENDPOINTS[candidate.provider], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${candidate.key}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(50_000),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    const preview = errText.slice(0, 300)
    const err = new Error(
      `${candidate.provider} ${candidate.model} HTTP ${res.status}: ${preview}`
    ) as Error & { status?: number }
    err.status = res.status
    throw err
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>
  }
  return data.choices?.[0]?.message?.content ?? ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = cleanInput(body?.input)
    if (!input) {
      return NextResponse.json(
        { error: 'Industry, report type, and business stage are required.' },
        { status: 400 }
      )
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

    // ── Plan-gate: Business Reports require Founder Pro ─────────
    const requiredPlan = PLAN_GATED_FEATURES.report
    if (requiredPlan && plan !== requiredPlan) {
      return NextResponse.json(
        {
          error: 'plan_required',
          code: 'plan_required',
          feature: 'report',
          requiredPlan,
          currentPlan: plan,
          message: `Business Reports are a Founder Pro feature. Upgrade to generate investor-grade reports.`,
        },
        { status: 402 }
      )
    }

    // ── Global rate limit (concurrency + cooldown + daily cap) ──
    const rateCheck = await checkRateLimit(user.id, plan, supabase)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', code: rateCheck.code, message: rateCheck.message },
        { status: 429 }
      )
    }

    // ── Per-feature daily limit ──────────────────────────────────
    const limit = PLAN_LIMITS[plan].report
    const today = new Date().toISOString().split('T')[0]
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('feature', 'report')
      .eq('date', today)
      .single()

    const currentCount = usage?.count ?? 0
    if (currentCount >= limit) {
      return NextResponse.json(
        {
          error: 'daily_limit',
          message: `You've reached your daily report limit on the ${plan} plan. Upgrade for more.`,
          limit,
          used: currentCount,
        },
        { status: 429 }
      )
    }

    // ── Web research (best-effort, 8s budget) ────────────────────
    const queries = buildReportSearchQueries(input)
    const RESEARCH_BUDGET_MS = 8_000
    type TopicResult = NonNullable<Awaited<ReturnType<typeof deepResearch>>>
    const emptyTopic: TopicResult = {
      query: '',
      intent_type: '',
      india_relevance: '',
      sub_questions: [],
      key_findings: [],
      market_data: {
        india_market_size: 'unknown',
        growth_rate: 'unknown',
        key_players_india: [],
        market_stage: 'unknown',
      },
      sources_used: [],
      data_points: [],
      contradictions_or_gaps: [],
      synthesis: '',
      india_opportunities: [],
      india_risks: [],
      confidence_score: '',
      data_freshness: '',
      follow_up_queries: [],
      summary: '',
    }

    let research: Record<string, TopicResult> = {}
    try {
      const researchPromise = Promise.all(
        queries.map(async (topic): Promise<[string, TopicResult]> => {
          try {
            const result = await deepResearch(topic, { depth: 'quick' })
            return [topic, result]
          } catch (err) {
            console.warn(
              '[reports/generate] topic research failed (continuing without):',
              topic,
              err instanceof Error ? err.message : err
            )
            return [topic, emptyTopic]
          }
        })
      )
      const researchEntries = (await Promise.race([
        researchPromise,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Research budget exceeded')),
            RESEARCH_BUDGET_MS
          )
        ),
      ])) as Array<[string, TopicResult]>
      research = Object.fromEntries(researchEntries) as Record<string, TopicResult>
    } catch {
      research = Object.fromEntries(queries.map((q) => [q, emptyTopic] as [string, TopicResult]))
    }

    const searchContext = Object.entries(research)
      .filter(([, data]) => data.synthesis || data.key_findings.length > 0)
      .map(
        ([topic, data]) =>
          `\n## Research: ${topic}\n${data.synthesis}\n\nKey Findings:\n${data.key_findings.join('\n')}\n\nData Points:\n${data.data_points.join('\n')}\n\nMarket Data: ${data.market_data.india_market_size} | Growth: ${data.market_data.growth_rate} | Players: ${data.market_data.key_players_india.join(', ')}`
      )
      .join('\n\n')

    // ── AI generation — multi-provider key rotation ───────────────
    const candidates = getAllKeyCandidates()
    if (candidates.length === 0) {
      return NextResponse.json(
        {
          error: 'AI provider not configured. Please set GROQ_API_KEY in your Vercel environment variables.',
        },
        { status: 500 }
      )
    }

    acquireSlot(user.id)
    let rawContent = ''
    const generationErrors: string[] = []
    const tStart = Date.now()

    try {
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i]
        try {
          console.log(
            `[reports/generate] trying ${candidate.provider} key#${Math.floor(i / PROVIDER_MODELS.groq.length) + 1} model=${candidate.model}`
          )
          rawContent = await callProviderForReport(candidate, input, searchContext)
          if (rawContent) {
            console.log(
              `[reports/generate] ${candidate.provider}/${candidate.model} ok in ${Date.now() - tStart}ms`
            )
            break
          }
          throw new Error('Empty response from provider')
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          const status = (err as { status?: number }).status
          generationErrors.push(`${candidate.provider}/${candidate.model}: ${msg}`)
          console.warn(`[reports/generate] candidate failed: ${msg}`)
          // 4xx other than 429 = bad request — no point trying more keys
          if (status && status >= 400 && status < 500 && status !== 429) {
            console.error('[reports/generate] non-retryable error, aborting:', msg)
            break
          }
        }
      }
    } finally {
      releaseSlot(user.id)
    }

    if (!rawContent) {
      const detail = generationErrors.slice(0, 3).join(' | ')
      console.error('[reports/generate] all candidates failed:', generationErrors.join(' | '))
      return NextResponse.json(
        {
          error: 'The AI provider could not generate your report. Please check your GROQ_API_KEY is valid and try again.',
          details: detail,
        },
        { status: 502 }
      )
    }

    // ── Parse AI JSON output ─────────────────────────────────────
    const parsed = safeParseJson(rawContent)
    if (!parsed.ok) {
      console.error(
        '[reports/generate] AI did not return valid JSON:',
        parsed.error,
        '| raw[0..200]:',
        rawContent.slice(0, 200)
      )
      return NextResponse.json(
        {
          error:
            'The AI returned an invalid response. Please try again — if it keeps failing, the model may be rate-limited.',
          details: parsed.error,
        },
        { status: 502 }
      )
    }

    const report = parsed.value as Record<string, unknown>
    let reportObj: Record<string, unknown>
    if (report && typeof report === 'object' && !Array.isArray(report)) {
      reportObj = report
    } else if (Array.isArray(report)) {
      reportObj = { meta: {}, executive_summary: {}, _raw_array: report }
    } else {
      reportObj = { meta: {}, executive_summary: {} }
    }

    const meta = (reportObj.meta ?? {}) as Record<string, unknown>
    reportObj.meta = {
      ...meta,
      business_name: meta.business_name || input.businessName || 'Untitled',
      industry: meta.industry || input.industry,
      stage: meta.stage || input.businessStage,
      report_type: meta.report_type || input.reportType,
      generated_at: meta.generated_at || new Date().toISOString(),
    }

    // ── Save report to database ──────────────────────────────────
    const { data: saved, error: dbError } = await supabase
      .from('business_reports')
      .insert({
        user_id: user.id,
        business_name: input.businessName || 'Untitled',
        report_type: input.reportType,
        industry: input.industry,
        stage: input.businessStage,
        input_data: input,
        report_data: reportObj,
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('[reports/generate] supabase insert failed:', dbError)
      return NextResponse.json(
        { error: 'Report generated but could not be saved. Try again.' },
        { status: 500 }
      )
    }

    // ── Post-save telemetry (best-effort) ────────────────────────
    const sideEffects = await Promise.allSettled([
      supabase.from('daily_usage').upsert(
        { user_id: user.id, feature: 'report', date: today, count: currentCount + 1 },
        { onConflict: 'user_id,feature,date' }
      ),
      incrementGlobalDaily(user.id, supabase),
      supabase.from('activity_log').insert({
        user_id: user.id,
        feature: 'report',
        title: `${input.reportType} — ${input.businessName || input.industry}`,
        summary:
          (reportObj.executive_summary as Record<string, unknown> | undefined)?.verdict
            ?.toString()
            .slice(0, 200) ?? '',
        metadata: { report_id: saved.id },
      }),
    ])
    sideEffects.forEach((res, i) => {
      if (res.status === 'rejected') {
        console.error('[reports/generate] side effect %d failed:', i, res.reason)
      }
    })

    return NextResponse.json({ success: true, reportId: saved.id })
  } catch (err) {
    console.error('[reports/generate] unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    const safeMessage = message.length > 300 ? message.slice(0, 300) + '…' : message
    return NextResponse.json(
      {
        error: 'Could not generate report. Please try again.',
        details: safeMessage,
      },
      { status: 500 }
    )
  }
}
