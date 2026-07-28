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
    })
  }

  return NextResponse.json({ plan, limits: PLAN_LIMITS[plan] })
}
