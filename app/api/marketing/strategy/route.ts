import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiHandler } from '@/lib/ai/handler'
import { getFounderContextBlock } from '@/lib/ai/prompts/masterPrompts'
import { getMarketingRoadmapPrompt } from '@/lib/ai/prompts/marketing'
import { safeParseJson } from '@/lib/ai/jsonRepair'
import { marketingBriefSchema, roadmapModelSchema } from '@/lib/marketing/schema'
import { effectivePlan } from '@/lib/plan'
import { reserveMarketingSlot, releaseMarketingSlot, roadmapLimit, weekKey } from '@/lib/marketing/server'

export async function POST(req: NextRequest) {
  let reservation: { kind: 'starter' | 'roadmap'; periodStart: string; slot: number | null } | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const parsed = marketingBriefSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'invalid_brief', message: 'Complete the required setup choices first.' }, { status: 400 })
    const brief = parsed.data
    const [{ data: profile }, { data: existingMarketing }, { data: founderProfile }, { data: sessions }] = await Promise.all([
      supabase.from('profiles').select('plan, plan_expires_at').eq('id', user.id).single(),
      supabase.from('founder_marketing_profiles').select('id, starter_used_at').eq('user_id', user.id).maybeSingle(),
      supabase.from('founder_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('founder_sessions').select('module, session_title, verdict, score, summary, card_data, card_kind, score_100').eq('user_id', user.id).in('module', ['validator', 'ideas', 'leads']).order('created_at', { ascending: false }).limit(5),
    ])
    const plan = effectivePlan(profile)
    if (plan === 'free') {
      if (existingMarketing?.starter_used_at) return NextResponse.json({ error: 'starter_used', message: 'Your free Marketing Engine Starter Pack has been used. Upgrade for another roadmap.' }, { status: 429 })
      const slot = await reserveMarketingSlot({ supabase, userId: user.id, kind: 'starter', periodStart: '1970-01-01', limit: 1 })
      if (!slot) return NextResponse.json({ error: 'starter_used', message: 'Your free Marketing Engine Starter Pack has been used. Upgrade for another roadmap.' }, { status: 429 })
      reservation = { kind: 'starter', periodStart: '1970-01-01', slot }
    } else {
      const periodStart = weekKey()
      const slot = await reserveMarketingSlot({ supabase, userId: user.id, kind: 'roadmap', periodStart, limit: roadmapLimit(plan) })
      if (!slot) return NextResponse.json({ error: 'weekly_limit', message: 'Your Marketing Engine roadmap update limit resets next week.' }, { status: 429 })
      reservation = { kind: 'roadmap', periodStart, slot }
    }
    const context = getFounderContextBlock(founderProfile, sessions ?? [])
    const model = await aiHandler({ feature: 'marketing', complexity: 'complex', prompt: JSON.stringify(brief), systemPrompt: getMarketingRoadmapPrompt(brief, context) })
    const json = safeParseJson(model.result)
    const roadmapResult = json.ok ? roadmapModelSchema.safeParse(json.value) : null
    if (!roadmapResult?.success) throw new Error('Marketing Engine could not safely structure a roadmap.')
    const weekStart = weekKey()
    const revision = plan === 'founder_pro' ? (reservation.slot ?? 1) : 1
    const strategy = roadmapResult.data
    const { data: marketingProfile, error: profileError } = await supabase.from('founder_marketing_profiles').upsert({
      user_id: user.id, business_name: brief.businessName, offer: brief.offer, audience: brief.audience, country: brief.country, goal: brief.goal,
      capacity: brief.capacity, stage: brief.stage, current_channels: brief.currentChannels || null, platforms: brief.platforms, strategy,
      starter_used_at: plan === 'free' ? new Date().toISOString() : existingMarketing?.starter_used_at ?? null,
    }, { onConflict: 'user_id' }).select('*').single()
    if (profileError || !marketingProfile) throw new Error('Could not save the marketing profile.')
    const { data: roadmap, error: roadmapError } = await supabase.from('founder_marketing_roadmaps').upsert({
      user_id: user.id, week_start: weekStart, revision, objective: strategy.objective, strategy,
    }, { onConflict: 'user_id,week_start,revision' }).select('*').single()
    if (roadmapError || !roadmap) throw new Error('Could not save the weekly roadmap.')
    await Promise.all([
      supabase.from('activity_log').insert({ user_id: user.id, feature: 'marketing', title: 'Marketing strategy created', summary: strategy.weeklyFocus }),
      supabase.from('founder_sessions').insert({ user_id: user.id, module: 'marketing', session_title: 'Marketing strategy', summary: strategy.weeklyFocus, full_output: { roadmap_id: roadmap.id } }),
    ])
    return NextResponse.json({ profile: marketingProfile, roadmap, provider: model.provider })
  } catch (error) {
    if (reservation) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await releaseMarketingSlot({ supabase, userId: user.id, ...reservation })
    }
    console.error('[api/marketing/strategy]', error)
    return NextResponse.json({ error: 'Marketing Engine is temporarily unavailable. Please try again.' }, { status: 500 })
  }
}
