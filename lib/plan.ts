import type { Plan } from '@/types'

/** Enforce paid-plan expiry at every access point without trusting stale profile data. */
export function effectivePlan(profile: { plan?: string | null; plan_expires_at?: string | null } | null | undefined): Plan {
  const plan = profile?.plan === 'builder' || profile?.plan === 'founder_pro' ? profile.plan : 'free'
  if (plan === 'free') return 'free'
  const expiresAt = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : null
  return expiresAt && expiresAt.getTime() > Date.now() ? plan : 'free'
}
