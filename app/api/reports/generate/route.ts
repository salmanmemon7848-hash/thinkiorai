import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
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
    // Research is best-effort. If SearXNG is unreachable (common on
    // serverless deploys hitting a public instance), the per-topic
    // calls will time out individually. We give research a HARD 8s
    // total budget; if it doesn't come back, we proceed with empty
    // context and let Groq generate the report from the founder's
    // own input plus the model's general knowledge.
    //
    // This was the cause of "Could not generate report" — research
    // was eating the whole 60s window when SearXNG timed out, leaving
    // no time for the Groq completion + DB write.
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
      console.log(
        '[reports/generate] research ok: %d/%d topics returned in <%dms',
        Object.values(research).filter((r) => r.summary || r.synthesis).length,
        queries.length,
        RESEARCH_BUDGET_MS
      )
    } catch (err) {
      // Research is best-effort. Log it and continue with empty context
      // so the founder still gets a report. This is the path that
      // SearXNG-down requests hit.
      console.warn(
        '[reports/generate] research step failed/timed out, continuing with empty context:',
        err instanceof Error ? err.message : err
      )
      research = Object.fromEntries(queries.map((q) => [q, emptyTopic] as [string, TopicResult]))
    }

    const searchContext = Object.entries(research)
      .filter(([, data]) => data.synthesis || data.key_findings.length > 0)
      .map(
        ([topic, data]) =>
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
    const tGroqStart = Date.now()
    try {
      const groq = new Groq({ apiKey })
      completion = await groqCompletionCall(groq, input, searchContext)
      console.log('[reports/generate] groq ok in %dms', Date.now() - tGroqStart)
    } catch (err) {
      console.error(
        '[reports/generate] groq failed after %dms:',
        Date.now() - tGroqStart,
        err instanceof Error ? err.message : err
      )
      throw err
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

    // Post-save telemetry (daily usage + activity log). These are
    // bookkeeping, not part of the deliverable. If any of them fail,
    // we log and continue — the report itself is already saved and
    // that's what matters for the user. (Promise.all would otherwise
    // kill the success response if just one of these hiccupped.)
    const tSideEffects = Date.now()
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
        console.error(
          '[reports/generate] non-critical side effect %d failed:',
          i,
          res.reason instanceof Error ? res.reason.message : res.reason
        )
      }
    })
    console.log(
      '[reports/generate] side effects done in %dms (ok=%d/%d)',
      Date.now() - tSideEffects,
      sideEffects.filter((r) => r.status === 'fulfilled').length,
      sideEffects.length
    )

    return NextResponse.json({ success: true, reportId: saved.id })
  } catch (err) {
    // Log the full error server-side (with stack) AND surface a
    // short reason to the client. The user sees something useful
    // ("AI provider timeout", "Database connection failed", etc.)
    // instead of the generic "Could not generate report".
    console.error('[reports/generate] unhandled error:', err)
    const message =
      err instanceof Error ? err.message : 'Unknown error'
    // Truncate to keep response size sane and avoid leaking internals.
    const safeMessage =
      message.length > 200 ? message.slice(0, 200) + '…' : message
    return NextResponse.json(
      {
        error: 'Could not generate report. Please try again.',
        details: safeMessage,
      },
      { status: 500 }
    )
  }
}
