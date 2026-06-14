import { createClient } from '@/lib/supabase/server'
import type { Plan } from '@/types'
import DashboardHero from '@/components/dashboard/DashboardHero'
import KpiStrip from '@/components/dashboard/KpiStrip'
import FounderCommandCenter from '@/components/dashboard/FounderCommandCenter'
import RecommendedNextStep from '@/components/dashboard/RecommendedNextStep'
import ToolsGrid from '@/components/dashboard/ToolsGrid'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import {
  buildDashboardSummary,
  type DashboardActivity,
  type DashboardFounderProfile,
  type DashboardReport,
  type DashboardSession,
} from '@/lib/dashboard/summary'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard — Thinkior AI',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [profileRes, sessionsRes, reportsRes, activityRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, plan, created_at, updated_at')
      .eq('id', user!.id)
      .maybeSingle(),
    supabase
      .from('founder_sessions')
      .select(
        'id, module, session_title, verdict, score, score_100, card_kind, card_data, created_at'
      )
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('business_reports')
      .select('id, business_name, report_type, industry, stage, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('activity_log')
      .select('id, feature, title, summary, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Pull the founder_profiles row separately — it has idea_name, domain, etc.
  const { data: founderRow } = await supabase
    .from('founder_profiles')
    .select(
      'founder_name, idea_name, idea_description, domain, target_customer, city, stage, onboarding_completed, created_at, updated_at'
    )
    .eq('user_id', user!.id)
    .maybeSingle()

  const plan = (profileRes.data?.plan ?? 'free') as Plan
  const displayName =
    profileRes.data?.name ||
    founderRow?.founder_name ||
    user?.email?.split('@')[0] ||
    'Founder'

  const summary = buildDashboardSummary({
    profile: (founderRow ?? null) as DashboardFounderProfile | null,
    sessions: (sessionsRes.data ?? []) as DashboardSession[],
    reports: (reportsRes.data ?? []) as DashboardReport[],
    activity: (activityRes.data ?? []) as DashboardActivity[],
    userCreatedAt: user?.created_at ?? null,
    displayName,
    plan,
  })

  return (
    <div className="space-y-6 sm:space-y-7 animate-fade-in">
      <DashboardHero
        firstName={summary.firstName}
        greeting={summary.greeting}
        tone={summary.tone}
        headline={summary.heroHeadline}
        sub={summary.heroSub}
        primary={summary.heroPrimary}
        secondary={summary.heroSecondary}
        plan={plan}
      />

      <KpiStrip kpis={summary.kpis} founderProgress={summary.founderProgress} />

      <FounderCommandCenter center={summary.commandCenter} />

      <RecommendedNextStep step={summary.nextStep} />

      <section id="tools">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-[18px] text-fg tracking-tight">
              Your tools
            </h2>
            <p className="text-[12.5px] text-fg-muted mt-0.5">
              Six modules. Pick whichever matches where you are.
            </p>
          </div>
          <p className="text-[10.5px] font-mono uppercase tracking-caps text-fg-faint hidden sm:block">
            Tip — press <span className="kbd">1</span>–<span className="kbd">6</span>
          </p>
        </div>
        <ToolsGrid tools={summary.tools} plan={plan} />
      </section>

      <section id="activity">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display font-semibold text-[18px] text-fg tracking-tight">
            Founder timeline
          </h2>
          <p className="text-[11.5px] text-fg-faint font-mono uppercase tracking-caps">
            last 10
          </p>
        </div>
        <ActivityFeed />
      </section>
    </div>
  )
}
