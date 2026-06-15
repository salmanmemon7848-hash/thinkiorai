import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@/lib/supabase/server'
import { researchForReport } from '@/lib/research/deepResearch'
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

function pickGroqKey(): string {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean) as string[]
  if (keys.length === 0) return ''
  return keys[Math.floor(Date.now() / 60000) % keys.length]
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

async function groqCompletionCall(groq: Groq, input: ReportInput, searchContext: string) {
  return Promise.race([
    groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: getReportSystemPrompt(input) },
        { role: 'user', content: buildReportUserPrompt(input, searchContext) },
      ],
      temperature: 0.4,
      max_tokens: 5500,
      response_format: { type: 'json_object' },
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Groq timeout')), 55000)
    ),
  ])
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

    const queries = buildReportSearchQueries(input)
    // Run all research topics in parallel but cap the total wall-clock
    // time so we never blow past Vercel's function timeout. The
    // Vercel function is configured for 60s on Pro; we leave 20s of
    // headroom for the Groq completion + DB write + buffer.
    // On Hobby (10s cap) the route will still finish research, fail
    // at the Groq step, and return a 502 — that path now shows a
    // clean error in the UI instead of the gateway HTML.
    const RESEARCH_BUDGET_MS = 35_000
    const researchPromise = researchForReport(queries)
    const research = await Promise.race([
      researchPromise,
      new Promise<Record<string, unknown>>((_, reject) =>
        setTimeout(
          () => reject(new Error('Research budget exceeded')),
          RESEARCH_BUDGET_MS
        )
      ),
    ]) as Awaited<ReturnType<typeof researchForReport>>
    const searchContext = Object.entries(research)
      .map(([topic, data]) =>
        `\n## Research: ${topic}\n${data.synthesis}\n\nKey Findings:\n${data.key_findings.join('\n')}\n\nData Points:\n${data.data_points.join('\n')}\n\nMarket Data: ${data.market_data.india_market_size} | Growth: ${data.market_data.growth_rate} | Players: ${data.market_data.key_players_india.join(', ')}`
      )
      .join('\n\n')

    const apiKey = pickGroqKey()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI provider not configured.' },
        { status: 500 }
      )
    }

    // ── Acquire slot — released in finally regardless of outcome ─
    acquireSlot(user.id)
    let completion: Awaited<ReturnType<typeof groqCompletionCall>>
    try {
      const groq = new Groq({ apiKey })
      completion = await groqCompletionCall(groq, input, searchContext)
    } finally {
      releaseSlot(user.id)
    }

    const raw = completion.choices[0]?.message?.content ?? ''
    // Parse the model's response. The model is asked for raw JSON
    // but can still emit a stray preamble, code fences, an error
    // string like "An error occurred", or truncated JSON when
    // max_tokens is hit. safeParseJson handles all of those and
    // never throws — we either get a value or a clean 502.
    const parsed = safeParseJson(raw)
    if (!parsed.ok) {
      console.error(
        '[reports/generate] AI did not return valid JSON:',
        parsed.error,
        '| repaired:', parsed.repaired,
        '| extracted:', parsed.extracted,
        '| raw[0..200]:',
        raw.slice(0, 200)
      )
      return NextResponse.json(
        {
          error:
            'The AI did not return a valid report. Please try again — if it keeps failing, the model may be rate-limited.',
          details: parsed.error,
        },
        { status: 502 }
      )
    }
    if (parsed.repaired || parsed.extracted) {
      console.warn(
        '[reports/generate] Had to repair AI JSON: repaired=%s extracted=%s',
        parsed.repaired,
        parsed.extracted
      )
    }
    const report = parsed.value as Record<string, unknown>

    // Defensive: if the model returned a JSON array or a primitive,
    // wrap it into an object so the downstream code (which assumes
    // `report.meta`, `report.executive_summary`, etc.) doesn't throw
    // a confusing error. This is rare but happens.
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

    await Promise.all([
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

    return NextResponse.json({ success: true, reportId: saved.id })
  } catch (err) {
    console.error('[reports/generate]', err)
    return NextResponse.json(
      { error: 'Could not generate report. Please try again.' },
      { status: 500 }
    )
  }
}
