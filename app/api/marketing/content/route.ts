import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiHandler } from '@/lib/ai/handler'
import { getMarketingContentPrompt } from '@/lib/ai/prompts/marketing'
import { safeParseJson } from '@/lib/ai/jsonRepair'
import { contentPackModelSchema, contentRequestSchema, packUpdateSchema } from '@/lib/marketing/schema'
import { dayKey, releaseMarketingSlot, reserveMarketingSlot } from '@/lib/marketing/server'
import { effectivePlan } from '@/lib/plan'
import { PLAN_LIMITS } from '@/lib/constants'

export async function POST(req: NextRequest) {
  let reservation: { periodStart: string; slot: number | null } | null = null
  try {
    const parsed = contentRequestSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'invalid_content_request', message: 'Choose a platform, content type, and objective.' }, { status: 400 })
    const input = parsed.data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const [{ data: profile }, { data: marketingProfile }, { data: requestedRoadmap }] = await Promise.all([
      supabase.from('profiles').select('plan, plan_expires_at').eq('id', user.id).single(),
      supabase.from('founder_marketing_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      input.roadmapId ? supabase.from('founder_marketing_roadmaps').select('*').eq('id', input.roadmapId).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
    ])
    if (!marketingProfile) return NextResponse.json({ error: 'setup_required', message: 'Create your Marketing Engine strategy before generating content.' }, { status: 400 })
    if (!marketingProfile.platforms.includes(input.platform)) return NextResponse.json({ error: 'platform_not_selected', message: 'Add this platform to your Marketing Engine setup first.' }, { status: 400 })
    const plan = effectivePlan(profile)
    const periodStart = plan === 'free' ? '1970-01-01' : dayKey()
    const limit = plan === 'free' ? 3 : PLAN_LIMITS[plan].marketing
    const slot = await reserveMarketingSlot({ supabase, userId: user.id, kind: 'content', periodStart, limit })
    if (!slot) return NextResponse.json({ error: plan === 'free' ? 'starter_used' : 'daily_limit', message: plan === 'free' ? 'Your three free Marketing Engine content packs have been used. Upgrade for daily packs.' : 'Your Marketing Engine content-pack limit resets tomorrow.' }, { status: 429 })
    reservation = { periodStart, slot }
    const roadmap = requestedRoadmap ?? (await supabase.from('founder_marketing_roadmaps').select('*').eq('user_id', user.id).order('week_start', { ascending: false }).order('revision', { ascending: false }).limit(1).maybeSingle()).data
    const model = await aiHandler({
      feature: 'marketing', complexity: 'complex', prompt: `${input.platform} ${input.contentType} ${input.objective}`,
      systemPrompt: getMarketingContentPrompt({ brief: marketingProfile, roadmap: roadmap?.strategy ?? null, platform: input.platform, contentType: input.contentType, objective: input.objective }),
    })
    const json = safeParseJson(model.result)
    const result = json.ok ? contentPackModelSchema.safeParse(json.value) : null
    if (!result?.success) throw new Error('Marketing Engine could not safely structure this content pack.')
    const content = result.data
    const { data: pack, error } = await supabase.from('founder_marketing_content_packs').insert({
      user_id: user.id, roadmap_id: roadmap?.id ?? null, platform: input.platform, content_type: input.contentType, title: content.title,
      objective: input.objective, content, status: 'planned',
    }).select('*').single()
    if (error || !pack) throw new Error('Could not save this content pack.')
    await Promise.all([
      supabase.from('activity_log').insert({ user_id: user.id, feature: 'marketing', title: `${input.platform} ${input.contentType} created`, summary: content.hook.slice(0, 200) }),
      supabase.from('founder_sessions').insert({ user_id: user.id, module: 'marketing', session_title: content.title.slice(0, 80), summary: content.rationale.slice(0, 180), full_output: { content_pack_id: pack.id } }),
    ])
    return NextResponse.json({ pack, provider: model.provider })
  } catch (error) {
    if (reservation) {
      const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
      if (user) await releaseMarketingSlot({ supabase, userId: user.id, kind: 'content', ...reservation })
    }
    console.error('[api/marketing/content]', error)
    return NextResponse.json({ error: 'Marketing Engine is temporarily unavailable. Please try again.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const parsed = packUpdateSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'invalid_pack_update' }, { status: 400 })
    const input = parsed.data
    const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const patch: Record<string, unknown> = {}
    if (input.status) patch.status = input.status
    if (input.scheduledFor !== undefined) patch.scheduled_for = input.scheduledFor
    if (input.content) patch.content = input.content
    const { data, error } = await supabase.from('founder_marketing_content_packs').update(patch).eq('id', input.id).eq('user_id', user.id).select('*').single()
    if (error || !data) return NextResponse.json({ error: 'Could not update the content pack.' }, { status: 400 })
    return NextResponse.json({ pack: data })
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
}
