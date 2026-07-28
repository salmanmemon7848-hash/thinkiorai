import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiHandler } from '@/lib/ai/handler'
import {
  getReportSystemPrompt,
  buildReportSearchQueries,
  buildReportUserPrompt,
  type ReportInput,
} from '@/lib/ai/prompts/report'
import { tavilySearch } from '@/lib/research/tavily'
import { PLAN_LIMITS, PLAN_GATED_FEATURES } from '@/lib/constants'
import { checkRateLimit, acquireSlot, releaseSlot, incrementGlobalDaily } from '@/lib/rateLimit'
import { sanitizeString } from '@/lib/utils/sanitize'
import { safeParseJson } from '@/lib/ai/jsonRepair'
import type { Plan } from '@/types'
import { effectivePlan } from '@/lib/plan'

export const maxDuration = 60

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
    goals: sanitizeString(r.goals, 2000),
    teamSize: sanitizeString(r.teamSize, 100),
    location: sanitizeString(r.location, 200),
    fundingStatus: sanitizeString(r.fundingStatus, 200),
    uniqueAdvantage: sanitizeString(r.uniqueAdvantage, 500),
  }
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
      .select('plan, plan_expires_at')
      .eq('id', user.id)
      .single()

    const plan = effectivePlan(profile)

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

    // ── Global rate limit ────────────────────────────────────────
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

    // ── Quick web research (same as chat/validator — light & fast) ─
    // Use tavilySearch (proven to work in other features) with basic
    // depth for speed. Skip heavy deepResearch entirely.
    let searchContext = ''
    try {
      const queries = buildReportSearchQueries(input)
      const searchResults = await Promise.all(
        queries.map((q) => tavilySearch(q, { maxResults: 5, depth: 'basic' }))
      )
      const allResults = searchResults.flat()
      if (allResults.length > 0) {
        searchContext = allResults
          .map((r) => `- ${r.title}: ${r.snippet}`)
          .join('\n')
      }
    } catch (err) {
      // Research is optional — continue without it
      console.warn('[reports/generate] search failed, continuing:', err)
    }

    // ── AI generation — use the EXACT same aiHandler as all other ─
    // features. This is the same code path that powers validator,
    // competitor, ideas, leads, and chat. If those work, this works.
    const systemPrompt = getReportSystemPrompt(input)
    const userPrompt = buildReportUserPrompt(input, searchContext)

    acquireSlot(user.id)
    let response: Awaited<ReturnType<typeof aiHandler>>
    try {
      response = await aiHandler({
        prompt: userPrompt,
        systemPrompt,
        feature: 'report',
        complexity: 'complex',
      })
    } finally {
      releaseSlot(user.id)
    }

    // aiHandler never throws — check if we got a real result
    const rawContent = response.result
    if (
      !rawContent ||
      rawContent.includes('temporarily unavailable') ||
      rawContent.length < 50
    ) {
      return NextResponse.json(
        {
          error: 'The AI is temporarily busy. Please try again in a moment.',
          details: `Provider: ${response.provider}, length: ${rawContent.length}`,
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
        '| raw[0..300]:',
        rawContent.slice(0, 300)
      )
      return NextResponse.json(
        {
          error: 'The AI returned text instead of structured data. Please try again.',
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

    // ── Save to database ─────────────────────────────────────────
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
      console.error('[reports/generate] DB insert failed:', dbError)
      return NextResponse.json(
        { error: 'Report generated but could not be saved. Try again.' },
        { status: 500 }
      )
    }

    // ── Post-save telemetry (best-effort) ────────────────────────
    await Promise.allSettled([
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
    console.error('[reports/generate] unhandled error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Could not generate report. Please try again.',
        details: message.length > 300 ? message.slice(0, 300) + '…' : message,
      },
      { status: 500 }
    )
  }
}
