import { createClient } from '@/lib/supabase/server'
import {
  CheckCircle2,
  Search,
  Lightbulb,
  Presentation,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import PlanBadge from '@/components/shared/PlanBadge'
import type { Plan } from '@/types'

const TOOLS = [
  {
    icon: CheckCircle2,
    label: 'Business Validator',
    sub: 'GO / KILL / PIVOT verdict',
    href: '/validator',
    accent: 'accent',
  },
  {
    icon: Search,
    label: 'Competitor Intel',
    sub: 'Map your battlefield',
    href: '/competitor',
    accent: 'signal-insight',
  },
  {
    icon: Lightbulb,
    label: 'Ideas Desk',
    sub: 'Stress-test your idea',
    href: '/ideas',
    accent: 'signal-pivot',
  },
  {
    icon: Presentation,
    label: 'Pitch Evaluator',
    sub: 'Score your deck',
    href: '/pitch',
    accent: 'signal-violet',
  },
  {
    icon: FileText,
    label: 'Business Reports',
    sub: 'Investor-grade report in 30s',
    href: '/reports',
    accent: 'accent',
  },
  {
    icon: MessageSquare,
    label: 'Co-founder Desk',
    sub: 'Always-on chat',
    href: '/chat',
    accent: 'fg',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, plan')
    .eq('id', user!.id)
    .single()

  const name = profile?.name ?? user?.email?.split('@')[0] ?? 'Founder'
  const plan = (profile?.plan ?? 'free') as Plan
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Top header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-fg-muted mb-2">{greeting},</p>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tighter leading-tight">
            {name.split(' ')[0]}.{' '}
            <span className="font-serif-italic font-normal text-accent">What are we building today?</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <PlanBadge plan={plan} />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Ideas validated" value="0" suffix="" trend="—" />
        <KpiCard label="Competitors mapped" value="0" suffix="" trend="—" />
        <KpiCard label="Pitches scored" value="—" suffix="" trend="—" />
        <KpiCard label="Days as a founder" value="1" suffix="" trend="+1" />
      </div>

      {/* Tools section */}
      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display font-semibold text-lg text-fg tracking-tight">
            Your tools
          </h2>
          <Link
            href="#"
            className="text-xs text-fg-muted hover:text-fg transition-colors flex items-center gap-1"
          >
            Tip — press <span className="kbd">1</span>–<span className="kbd">5</span>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="card-premium rounded-xl p-5 group hover:bg-bg-elevated transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center border"
                    style={{
                      background: `color-mix(in srgb, var(--${tool.accent === 'fg' ? 'fg' : tool.accent === 'accent' ? 'accent' : tool.accent}) 12%, transparent)`,
                      borderColor: `color-mix(in srgb, var(--${tool.accent === 'fg' ? 'fg' : tool.accent === 'accent' ? 'accent' : tool.accent}) 30%, transparent)`,
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      strokeWidth={1.75}
                      style={{
                        color: `var(--${tool.accent === 'fg' ? 'fg' : tool.accent === 'accent' ? 'accent' : tool.accent})`,
                      }}
                    />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-fg-muted group-hover:text-fg group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-display font-semibold text-base text-fg leading-tight mb-1 tracking-tight">
                  {tool.label}
                </h3>
                <p className="text-[13px] text-fg-muted">{tool.sub}</p>
              </Link>
            )
          })}

          {plan === 'free' && (
            <Link
              href="/pricing"
              className="rounded-xl p-5 border border-dashed border-line-strong hover:border-accent hover:bg-accent/[0.03] group transition-all duration-300 flex flex-col items-start justify-center min-h-[150px]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="eyebrow text-accent">Upgrade</span>
              </div>
              <h3 className="font-display font-semibold text-base text-fg leading-tight mb-1 tracking-tight">
                Unlock more queries
              </h3>
              <p className="text-[13px] text-fg-muted">All languages, saved reports →</p>
            </Link>
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <h2 className="font-display font-semibold text-lg text-fg tracking-tight mb-5">
          Recent activity
        </h2>
        <ActivityFeed />
      </section>
    </div>
  )
}

function KpiCard({ label, value, suffix, trend }: { label: string; value: string; suffix: string; trend: string }) {
  return (
    <div className="card-premium rounded-xl p-4">
      <p className="text-[12px] text-fg-muted mb-3">{label}</p>
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-display font-bold text-2xl text-fg tabular tracking-tighter leading-none">
          {value}
          <span className="text-fg-muted text-lg">{suffix}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-fg-muted font-mono">
          {trend !== '—' && <TrendingUp className="w-3 h-3 text-accent" />}
          {trend}
        </div>
      </div>
    </div>
  )
}
