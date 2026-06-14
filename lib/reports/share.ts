/**
 * THINKIOR — REPORT SHARING
 * ─────────────────────────────────────────────────────────────────
 * share_slug generation + public-by-slug lookup helpers.
 * Used by /api/reports/[id]/share and the public /share/report/[slug]
 * page. Keeps the share logic out of the route handlers so it's
 * easy to test and reuse.
 * ─────────────────────────────────────────────────────────────────
 */

import { createClient } from '@/lib/supabase/server'

const SLUG_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789' // skip l/o/0/1 for readability

/**
 * Cryptographically random URL-safe slug. 12 chars → ~62 bits of
 * entropy, plenty for a non-guessable link. Falls back to
 * Math.random in environments without crypto.
 */
export function makeShareSlug(length = 12): string {
  const out: string[] = []
  const g = globalThis as { crypto?: Crypto }
  const cryptoApi: Crypto | undefined = g && typeof g.crypto !== 'boolean' ? g.crypto : undefined
  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(length)
    cryptoApi.getRandomValues(bytes)
    for (let i = 0; i < bytes.length; i++) {
      out.push(SLUG_ALPHABET[bytes[i]! % SLUG_ALPHABET.length])
    }
  } else {
    for (let i = 0; i < length; i++) {
      out.push(SLUG_ALPHABET[Math.floor(Math.random() * SLUG_ALPHABET.length)])
    }
  }
  return out.join('')
}

export interface ShareToggleResult {
  shareSlug: string | null
  shareEnabled: boolean
  error?: string
}

/**
 * Toggle sharing on a report. Generates a fresh slug if one doesn't
 * exist. Returns the new share state.
 */
export async function toggleReportShare(
  reportId: string,
  userId: string,
  enabled: boolean
): Promise<ShareToggleResult> {
  const supabase = await createClient()

  // Verify the report belongs to the user before touching it
  const { data: existing, error: fetchErr } = await supabase
    .from('business_reports')
    .select('id, share_slug, share_enabled')
    .eq('id', reportId)
    .eq('user_id', userId)
    .single()

  if (fetchErr || !existing) {
    return { shareSlug: null, shareEnabled: false, error: 'Report not found' }
  }

  // If we're enabling but the slug is missing, mint one
  const slug = existing.share_slug || (enabled ? makeShareSlug() : null)

  const { error: updateErr } = await supabase
    .from('business_reports')
    .update({ share_enabled: enabled, share_slug: slug })
    .eq('id', reportId)
    .eq('user_id', userId)

  if (updateErr) {
    return { shareSlug: null, shareEnabled: false, error: updateErr.message }
  }

  return { shareSlug: slug, shareEnabled: enabled }
}

/**
 * Fetch a report by share slug. Only returns reports that have
 * sharing explicitly enabled. Used by the public route.
 */
export async function getPublicReportBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('business_reports')
    .select('id, business_name, report_type, industry, stage, report_data, created_at, user_id')
    .eq('share_slug', slug)
    .eq('share_enabled', true)
    .maybeSingle()

  if (error || !data) return null
  return data
}
