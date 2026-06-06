import type { SupabaseClient } from '@supabase/supabase-js'

// ── Daily hard caps per plan ─────────────────────────────────────────────────
export const GLOBAL_DAILY_CAPS: Record<string, number> = {
  free: 17,
  builder: 65,
  founder_pro: 220,
}

const MAX_CONCURRENT = 2
const MIN_DELAY_MS = 2000

// ── Module-level state (lives for the lifetime of the Node.js process) ───────
// On a single-instance deployment (VPS / next start) this is shared across all
// requests.  On multi-instance serverless the in-memory state is per-instance,
// which means the concurrent & cooldown checks are best-effort — the daily cap
// enforced via Supabase is always accurate on any deployment model.
const activeRequests = new Map<string, number>()
const lastRequestAt = new Map<string, number>()

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; code: 'concurrent' | 'cooldown' | 'daily_cap'; message: string }

// Returns today's date string in IST (UTC+5:30) as YYYY-MM-DD
// Counters reset at midnight IST automatically because the date changes.
function getTodayIST(): string {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]
}

/**
 * Run all three rate-limit checks in order.  Call this BEFORE acquireSlot.
 */
export async function checkRateLimit(
  userId: string,
  plan: string,
  supabase: SupabaseClient
): Promise<RateLimitResult> {
  // 1. Concurrent-request guard
  if ((activeRequests.get(userId) ?? 0) >= MAX_CONCURRENT) {
    return {
      allowed: false,
      code: 'concurrent',
      message:
        'Our AI is processing your previous request. Please wait a moment before sending another.',
    }
  }

  // 2. Minimum-delay cooldown
  const elapsed = Date.now() - (lastRequestAt.get(userId) ?? 0)
  if (elapsed < MIN_DELAY_MS) {
    return {
      allowed: false,
      code: 'cooldown',
      message:
        'Our AI is processing your previous request. Please wait a moment before sending another.',
    }
  }

  // 3. Daily hard cap (stored in Supabase — accurate across restarts)
  const dailyLimit = GLOBAL_DAILY_CAPS[plan] ?? GLOBAL_DAILY_CAPS.free
  const today = getTodayIST()

  const { data } = await supabase
    .from('daily_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', 'ai_global')
    .eq('date', today)
    .single()

  if ((data?.count ?? 0) >= dailyLimit) {
    return {
      allowed: false,
      code: 'daily_cap',
      message: `You've used all ${dailyLimit} AI requests for today on the ${plan} plan. Your limit resets at midnight IST.`,
    }
  }

  return { allowed: true }
}

/**
 * Mark one slot as in-use for this user.  Must be paired with releaseSlot in a
 * finally block.
 */
export function acquireSlot(userId: string): void {
  activeRequests.set(userId, (activeRequests.get(userId) ?? 0) + 1)
  lastRequestAt.set(userId, Date.now())
}

/**
 * Release the slot acquired by acquireSlot.
 */
export function releaseSlot(userId: string): void {
  const n = (activeRequests.get(userId) ?? 1) - 1
  if (n <= 0) activeRequests.delete(userId)
  else activeRequests.set(userId, n)
}

/**
 * Increment the global daily counter for this user.
 * Uses IST date so it resets at midnight IST regardless of server timezone.
 */
export async function incrementGlobalDaily(
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const today = getTodayIST()

  const { data } = await supabase
    .from('daily_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', 'ai_global')
    .eq('date', today)
    .single()

  await supabase.from('daily_usage').upsert(
    {
      user_id: userId,
      feature: 'ai_global',
      date: today,
      count: (data?.count ?? 0) + 1,
    },
    { onConflict: 'user_id,feature,date' }
  )
}
