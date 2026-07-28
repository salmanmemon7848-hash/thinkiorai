import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/lib/constants'
import type { Plan, Feature } from '@/types'
import { effectivePlan } from '@/lib/plan'

export async function GET(req: NextRequest) {
  const feature = req.nextUrl.searchParams.get('feature') as Feature | null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, plan_expires_at')
    .eq('id', user.id)
    .single()

  const plan = effectivePlan(profile)

  if (feature) {
    if (feature === 'leads' && plan === 'free') {
      const { count } = await supabase
        .from('founder_lead_searches')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      const used = count ?? 0
      return NextResponse.json({
        count: Math.min(used, 1),
        limit: 1,
        remaining: used > 0 ? 0 : 1,
        exceeded: used > 0,
        period: 'lifetime',
      })
    }
    if (feature === 'marketing') {
      const period = plan === 'free' ? '1970-01-01' : new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('founder_marketing_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('kind', 'content')
        .eq('period_start', period)
      const used = count ?? 0
      const limit = PLAN_LIMITS[plan].marketing
      return NextResponse.json({
        count: Math.min(used, limit), limit, remaining: Math.max(0, limit - used), exceeded: used >= limit,
        period: plan === 'free' ? 'lifetime' : 'daily',
      })
    }
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('daily_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('feature', feature)
      .eq('date', today)
      .single()

    const count = data?.count ?? 0
    const limit = PLAN_LIMITS[plan][feature]
    return NextResponse.json({
      count,
      limit,
      remaining: Math.max(0, limit - count),
      exceeded: count >= limit,
      period: 'daily',
    })
  }

  return NextResponse.json({ plan, limits: PLAN_LIMITS[plan] })
}
