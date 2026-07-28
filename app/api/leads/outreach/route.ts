import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiHandler } from '@/lib/ai/handler'
import { getOutreachPrompt } from '@/lib/ai/prompts/leads'
import { getFounderContextBlock } from '@/lib/ai/prompts/masterPrompts'
import { safeParseJson } from '@/lib/ai/jsonRepair'
import { checkRateLimit, acquireSlot, incrementGlobalDaily, releaseSlot } from '@/lib/rateLimit'
import { effectivePlan } from '@/lib/plan'
import { PLAN_LIMITS } from '@/lib/constants'

export async function POST(req: NextRequest) {
  try {
    const { leadId, channel } = await req.json()
    if (typeof leadId !== 'string' || (channel !== 'email' && channel !== 'linkedin')) return NextResponse.json({ error: 'Invalid outreach request.' }, { status: 400 })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const [{ data: profile }, { data: lead }] = await Promise.all([
      supabase.from('profiles').select('plan, plan_expires_at').eq('id', user.id).single(),
      supabase.from('founder_leads').select('*').eq('id', leadId).eq('user_id', user.id).single(),
    ])
    if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
    const plan = effectivePlan(profile)
    const date = new Date().toISOString().slice(0, 10)
    const { data: usage } = await supabase.from('daily_usage').select('count').eq('user_id', user.id).eq('feature', 'chat').eq('date', date).single()
    if ((usage?.count ?? 0) >= PLAN_LIMITS[plan].chat) return NextResponse.json({ error: 'daily_limit', message: 'Your chat limit has been reached for today.' }, { status: 429 })
    const rate = await checkRateLimit(user.id, plan, supabase)
    if (!rate.allowed) return NextResponse.json({ error: rate.code, message: rate.message }, { status: 429 })
    const { data: founderProfile } = await supabase.from('founder_profiles').select('*').eq('user_id', user.id).maybeSingle()
    const founderContext = getFounderContextBlock(founderProfile, [])
    acquireSlot(user.id)
    let model
    try { model = await aiHandler({ feature: 'chat', complexity: 'simple', prompt: `Draft ${channel} outreach.`, systemPrompt: getOutreachPrompt({ channel, founderContext, lead: JSON.stringify(lead) }) }) } finally { releaseSlot(user.id) }
    const parsed = safeParseJson(model.result)
    const draft = parsed.ok && parsed.value && typeof parsed.value === 'object' ? parsed.value as { subject?: unknown; body?: unknown } : null
    if (!draft || typeof draft.body !== 'string' || draft.body.length < 20) return NextResponse.json({ error: 'Thinkior could not safely draft that message. Please try again.' }, { status: 502 })
    const subject = channel === 'email' && typeof draft.subject === 'string' ? draft.subject.slice(0, 140) : null
    const body = draft.body.slice(0, 1800)
    await Promise.all([
      supabase.from('founder_lead_outreach').insert({ user_id: user.id, lead_id: lead.id, channel, subject, body }),
      supabase.from('daily_usage').upsert({ user_id: user.id, feature: 'chat', date, count: (usage?.count ?? 0) + 1 }, { onConflict: 'user_id,feature,date' }),
      incrementGlobalDaily(user.id, supabase),
      supabase.from('activity_log').insert({ user_id: user.id, feature: 'chat', title: `Draft ${channel} outreach for ${lead.name}`, summary: body.slice(0, 200) }),
    ])
    return NextResponse.json({ channel, subject, body })
  } catch (error) {
    console.error('[API/leads/outreach]', error)
    return NextResponse.json({ error: 'Outreach drafting is temporarily unavailable. Please try again.' }, { status: 500 })
  }
}
