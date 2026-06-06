export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import ConsentWrapper from '@/components/shared/ConsentWrapper'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, plan')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar
        userName={profile?.name ?? user.email?.split('@')[0] ?? 'Founder'}
        userEmail={user.email ?? ''}
        plan={profile?.plan ?? 'free'}
      />
      <main className="flex-1 lg:ml-[260px] min-h-screen overflow-x-hidden">
        <div className="px-5 sm:px-8 lg:px-10 pt-16 lg:pt-10 pb-12 max-w-6xl mx-auto">
          <ConsentWrapper>
            {children}
          </ConsentWrapper>
        </div>
      </main>
    </div>
  )
}
