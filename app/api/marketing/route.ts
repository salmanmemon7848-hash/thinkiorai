import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [profile, roadmaps, packs, reviews] = await Promise.all([
    supabase.from('founder_marketing_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('founder_marketing_roadmaps').select('*').eq('user_id', user.id).order('week_start', { ascending: false }).order('revision', { ascending: false }).limit(8),
    supabase.from('founder_marketing_content_packs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(60),
    supabase.from('founder_marketing_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(12),
  ])
  return NextResponse.json({ profile: profile.data, roadmaps: roadmaps.data ?? [], packs: packs.data ?? [], reviews: reviews.data ?? [] })
}
