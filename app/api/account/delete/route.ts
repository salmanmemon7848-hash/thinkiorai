import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/** Deletes the authenticated account and all cascaded founder data. */
export async function POST() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    return NextResponse.json({ error: 'Account deletion is not configured. Contact support.' }, { status: 503 })
  }

  const admin = createAdminClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('[account/delete]', error.message)
    return NextResponse.json({ error: 'Could not delete the account. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
