import type { SupabaseClient } from '@supabase/supabase-js'
import type { Plan } from '@/types'

export const dayKey = () => new Date().toISOString().slice(0, 10)

export function weekKey(date = new Date()) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const offset = (utc.getUTCDay() + 6) % 7
  utc.setUTCDate(utc.getUTCDate() - offset)
  return utc.toISOString().slice(0, 10)
}

export function roadmapLimit(plan: Plan) {
  if (plan === 'founder_pro') return 2
  return 1
}

export async function reserveMarketingSlot(args: {
  supabase: SupabaseClient
  userId: string
  kind: 'starter' | 'roadmap' | 'content'
  periodStart: string
  limit: number
}) {
  for (let slot = 1; slot <= args.limit; slot += 1) {
    const { error } = await args.supabase.from('founder_marketing_usage').insert({
      user_id: args.userId,
      kind: args.kind,
      period_start: args.periodStart,
      slot,
    })
    if (!error) return slot
    // 23505 is a unique conflict. Any other error is a real storage failure.
    if (error.code !== '23505') throw new Error(error.message)
  }
  return null
}

export async function releaseMarketingSlot(args: {
  supabase: SupabaseClient
  userId: string
  kind: 'starter' | 'roadmap' | 'content'
  periodStart: string
  slot: number | null
}) {
  if (!args.slot) return
  await args.supabase.from('founder_marketing_usage').delete()
    .eq('user_id', args.userId).eq('kind', args.kind).eq('period_start', args.periodStart).eq('slot', args.slot)
}
