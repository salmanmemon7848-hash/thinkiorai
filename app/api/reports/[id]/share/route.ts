/**
 * THINKIOR — REPORT SHARE API
 * ─────────────────────────────────────────────────────────────────
 * POST: enable sharing, mint a slug
 * DELETE: disable sharing, keep the slug (so re-enabling gives
 *         back the same URL — friendlier UX than minting a new one)
 *
 * Auth required. Owner-only.
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toggleReportShare } from '@/lib/reports/share'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await toggleReportShare(params.id, user.id, /* enabled */ true)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    shareSlug: result.shareSlug,
    shareEnabled: result.shareEnabled,
    shareUrl: result.shareSlug
      ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/report/${result.shareSlug}`
      : null,
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await toggleReportShare(params.id, user.id, /* enabled */ false)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({
    shareSlug: result.shareSlug,
    shareEnabled: result.shareEnabled,
  })
}
