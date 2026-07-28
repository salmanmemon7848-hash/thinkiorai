import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { effectivePlan } from '@/lib/plan'
import { PLAN_LIMITS } from '@/lib/constants'
import { checkRateLimit, acquireSlot, incrementGlobalDaily, releaseSlot } from '@/lib/rateLimit'
import { tavilySearch } from '@/lib/research/tavily'
import { aiHandler } from '@/lib/ai/handler'
import { getLeadSearchPrompt } from '@/lib/ai/prompts/leads'
import { getFounderContextBlock } from '@/lib/ai/prompts/masterPrompts'
import { safeParseJson } from '@/lib/ai/jsonRepair'
import { isSafePublicUrl, leadSearchModelSchema, requestedLeadCount } from '@/lib/leads/schema'
import { sanitizeString } from '@/lib/utils/sanitize'
import type { LeadCandidate, LeadType } from '@/types'

const today = () => new Date().toISOString().slice(0, 10)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const query = sanitizeString(body.query, 1200)
    const leadType: LeadType | null = body.leadType === 'customer' || body.leadType === 'investor' ? body.leadType : null
    const requestedCount = requestedLeadCount(query)

    if (!query || !leadType || !requestedCount || requestedCount < 1 || requestedCount > 10) {
      return NextResponse.json({ error: 'Ask for between 1 and 10 leads, for example: “Find 10 B2B customers in Germany…”' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('plan, plan_expires_at').eq('id', user.id).single()
    const plan = effectivePlan(profile)

    if (plan === 'free') {
      const { count } = await supabase
        .from('founder_lead_searches')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if ((count ?? 0) >= 1) {
        return NextResponse.json({ error: 'preview_used', message: 'Your free Lead Finder preview has been used. Upgrade to search again.' }, { status: 429 })
      }
    } else {
      const { data: usage } = await supabase.from('daily_usage').select('count').eq('user_id', user.id).eq('feature', 'leads').eq('date', today()).single()
      if ((usage?.count ?? 0) >= PLAN_LIMITS[plan].leads) {
        return NextResponse.json({ error: 'daily_limit', message: 'Your Lead Finder limit resets tomorrow.' }, { status: 429 })
      }
    }

    const rate = await checkRateLimit(user.id, plan, supabase)
    if (!rate.allowed) return NextResponse.json({ error: rate.code, message: rate.message }, { status: 429 })

    const [{ data: founderProfile }, { data: sessions }, { data: gtm }] = await Promise.all([
      supabase.from('founder_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('founder_sessions').select('module, session_title, verdict, score, summary, card_data, card_kind, score_100').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('founder_gtm_plans').select('icp, positioning, value_proposition, first_channel').eq('user_id', user.id).maybeSingle(),
    ])
    const founderContext = [
      getFounderContextBlock(founderProfile, sessions ?? []),
      gtm ? `GTM context: ICP ${gtm.icp || 'unknown'}; positioning ${gtm.positioning || 'unknown'}; value ${gtm.value_proposition || 'unknown'}; channel ${gtm.first_channel || 'unknown'}.` : '',
    ].filter(Boolean).join('\n')

    const searchSuffix = leadType === 'customer'
      ? 'company customers case studies hiring news official site'
      : 'investor fund portfolio investment thesis official site'
    const researchResults = await tavilySearch(`${query} ${searchSuffix}`, { maxResults: 20, depth: 'advanced' })
    const sourceResults = researchResults.filter((item) => item.url && item.title).slice(0, 20)
    if (!sourceResults.length) {
      return NextResponse.json({ error: 'research_unavailable', message: 'No public research sources were available. Try again later or make the request more specific.' }, { status: 503 })
    }

    const retrievedAt = new Date().toISOString()
    const research = sourceResults.map((item, index) => `[${index + 1}] ${item.title}\nURL: ${item.url}\nCONTENT: ${(item.rawContent || item.snippet).slice(0, 1800)}`).join('\n\n')
    acquireSlot(user.id)
    let model
    try {
      model = await aiHandler({
        feature: 'leads',
        complexity: 'complex',
        prompt: query,
        systemPrompt: getLeadSearchPrompt({ leadType, requestedCount, founderContext, research }),
      })
    } finally {
      releaseSlot(user.id)
    }

    const parsed = safeParseJson(model.result)
    const modelResult = parsed.ok ? leadSearchModelSchema.safeParse(parsed.value) : null
    if (!modelResult?.success) {
      return NextResponse.json({ error: 'invalid_research_result', message: 'Thinkior could not safely structure this research. Please try again.' }, { status: 502 })
    }

    const leads: LeadCandidate[] = modelResult.data.leads.slice(0, requestedCount).flatMap((lead) => {
      const evidence = lead.evidence.flatMap((entry) => {
        const source = sourceResults[entry.sourceIndex - 1]
        if (!source || !isSafePublicUrl(source.url)) return []
        return [{ title: source.title.slice(0, 180), url: source.url, fact: entry.fact, sourceDate: null, retrievedAt }]
      })
      const sourceText = evidence.map((item) => `${item.title} ${item.fact}`).join(' ').toLowerCase()
      if (!evidence.length || !sourceText.includes(lead.name.toLowerCase().slice(0, Math.min(6, lead.name.length)))) return []
      return [{
        name: lead.name,
        website: isSafePublicUrl(lead.website) ? lead.website : null,
        location: lead.location?.slice(0, 140) || null,
        fit: lead.fit,
        confidence: lead.confidence,
        contactPath: lead.contactPath,
        contactUrl: isSafePublicUrl(lead.contactUrl) ? lead.contactUrl : null,
        evidence,
      }]
    })

    const { data: search, error: saveError } = await supabase.from('founder_lead_searches').insert({
      user_id: user.id,
      lead_type: leadType,
      query,
      requested_count: requestedCount,
      returned_count: leads.length,
      summary: modelResult.data.summary,
      sources: sourceResults.map((item) => ({ title: item.title, url: item.url, retrievedAt })),
    }).select('id').single()
    if (saveError || !search) return NextResponse.json({ error: 'Could not save the research session.' }, { status: 500 })

    await Promise.all([
      plan === 'free' ? Promise.resolve() : supabase.from('daily_usage').upsert({ user_id: user.id, feature: 'leads', date: today(), count: ((await supabase.from('daily_usage').select('count').eq('user_id', user.id).eq('feature', 'leads').eq('date', today()).single()).data?.count ?? 0) + 1 }, { onConflict: 'user_id,feature,date' }),
      incrementGlobalDaily(user.id, supabase),
      supabase.from('activity_log').insert({ user_id: user.id, feature: 'leads', title: query.slice(0, 100), summary: `Found ${leads.length} ${leadType} leads.` }),
      supabase.from('founder_sessions').insert({ user_id: user.id, module: 'leads', session_title: query.slice(0, 80), summary: modelResult.data.summary || `Found ${leads.length} leads.`, full_output: { search_id: search.id, lead_type: leadType, returned_count: leads.length } }),
    ])

    return NextResponse.json({ searchId: search.id, requestedCount, leads, summary: modelResult.data.summary, provider: model.provider })
  } catch (error) {
    console.error('[API/leads/search]', error)
    return NextResponse.json({ error: 'Lead Finder is temporarily unavailable. Please try again.' }, { status: 500 })
  }
}
