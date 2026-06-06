import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if founder has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: fp } = await supabase
          .from('founder_profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single()

        if (!fp?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
