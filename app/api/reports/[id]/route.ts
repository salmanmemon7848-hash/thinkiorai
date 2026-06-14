/**
 * THINKIOR — REPORT DELETE API
 * ─────────────────────────────────────────────────────────────────
 * Owner-only. Soft behaviour: hard delete the row. Past report
 * cards are big and cheap to regenerate, so we don't bother with
 * soft-delete / trash.
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  // RLS will block any update/delete where user_id != auth.uid(),
  // but we want a clean 404 instead of a 500 if the row doesn't
  // belong to this user.
  const { data: existing, error: fetchErr } = await supabase
    .from('business_reports')
    .select('id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  const { error: deleteErr } = await supabase
    .from('business_reports')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
