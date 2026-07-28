import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiHandler } from '@/lib/ai/handler'
import { getMarketingReviewPrompt } from '@/lib/ai/prompts/marketing'
import { safeParseJson } from '@/lib/ai/jsonRepair'
import { reviewModelSchema, reviewSchema } from '@/lib/marketing/schema'
import { releaseMarketingSlot, reserveMarketingSlot, roadmapLimit, weekKey } from '@/lib/marketing/server'
import { effectivePlan } from '@/lib/plan'

export async function POST(req: NextRequest) {
  let slot: number | null = null
  const periodStart = weekKey()
  try {
    const parsed = reviewSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'invalid_review', message: 'Enter valid non-negative weekly results.' }, { status: 400 })
    const review = parsed.data
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const [{ data: profile }, { data: roadmap }] = await Promise.all([
      supabase.from('profiles').select('plan, plan_expires_at').eq('id', user.id).single(),
      review.roadmapId ? supabase.from('founder_marketing_roadmaps').select('*').eq('id', review.roadmapId).eq('user_id', user.id).maybeSingle() : supabase.from('founder_marketing_roadmaps').select('*').eq('user_id', user.id).order('week_start', { ascending: false }).order('revision', { ascending: false }).limit(1).maybeSingle(),
    ])
    if (!roadmap) return NextResponse.json({ error: 'roadmap_required', message: 'Create a weekly roadmap before submitting a review.' }, { status: 400 })
    const plan = effectivePlan(profile)
    if (plan === 'free') return NextResponse.json({ error: 'starter_used', message: 'Weekly roadmap updates are available on paid plans.' }, { status: 429 })
    slot = await reserveMarketingSlot({ supabase, userId: user.id, kind: 'roadmap', periodStart, limit: roadmapLimit(plan) })
    if (!slot) return NextResponse.json({ error: 'weekly_limit', message: 'Your roadmap update limit resets next week.' }, { status: 429 })
    const model = await aiHandler({ feature: 'marketing', complexity: 'simple', prompt: JSON.stringify(review), systemPrompt: getMarketingReviewPrompt({ review, roadmap: roadmap.strategy }) })
    const json = safeParseJson(model.result); const result = json.ok ? reviewModelSchema.safeParse(json.value) : null
    if (!result?.success) throw new Error('Marketing Engine could not safely review these results.')
    const { data, error } = await supabase.from('founder_marketing_reviews').insert({ user_id: user.id, roadmap_id: roadmap.id, ...review, next_priority: result.data.nextPriority }).select('*').single()
    if (error || !data) throw new Error('Could not save the weekly review.')
    await supabase.from('activity_log').insert({ user_id: user.id, feature: 'marketing', title: 'Weekly marketing review', summary: result.data.nextPriority })
    return NextResponse.json({ review: data, provider: model.provider })
  } catch (error) {
    if (slot) { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (user) await releaseMarketingSlot({ supabase, userId: user.id, kind: 'roadmap', periodStart, slot }) }
    console.error('[api/marketing/review]', error)
    return NextResponse.json({ error: 'Marketing Engine is temporarily unavailable. Please try again.' }, { status: 500 })
  }
}
