import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  FileText,
  Plus,
  ArrowUpRight,
  Sparkles,
  Search,
  Map,
  Rocket,
  Presentation,
  type LucideIcon,
} from 'lucide-react'
import type { Plan } from '@/types'
import PlanRequired from '@/components/shared/PlanRequired'
import ReportsBrowser from '@/components/features/reports/ReportsBrowser'

export const metadata = {
  title: 'Business Reports — Thinkior AI',
}

interface ReportRow {
  id: string
  business_name: string | null
  report_type: string
  industry: string
  stage: string | null
  created_at: string
  share_enabled: boolean
  share_slug: string | null
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Plan check (server-side, no flash of paywalled content)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user!.id)
    .single()
  const plan = (profile?.plan ?? 'free') as Plan

  if (plan !== 'founder_pro') {
    return (
      <PlanRequired
        featureName="Business Reports"
        requiredPlan="founder_pro"
        currentPlan={plan}
        description="Investor-grade, India-first business reports backed by live market research. Founder Pro only."
      />
    )
  }

  // ── Fetch reports list ──────────────────────────────────────────
  // Try with share columns first; if the migration hasn't been applied,
  // fall back to core columns so the page still works.
  let rows: ReportRow[] = []

  const { data, error } = await supabase
    .from('business_reports')
    .select(
      'id, business_name, report_type, industry, stage, created_at, share_enabled, share_slug'
    )
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    // share columns likely missing — retry without them
    console.warn('[reports] full query failed, retrying core columns:', error.message)
    const { data: fallback } = await supabase
      .from('business_reports')
      .select('id, business_name, report_type, industry, stage, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(200)
    rows = ((fallback ?? []) as unknown as ReportRow[]).map((r) => ({
      ...r,
      share_enabled: false,
      share_slug: null,
    }))
  } else {
    rows = (data ?? []) as ReportRow[]
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="eyebrow text-accent">Reports</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tighter leading-tight">
            Business reports.{' '}
            <span className="font-serif-italic font-normal text-accent">Investor-grade.</span>
          </h1>
          <p className="text-[14px] text-fg-dim mt-2 max-w-xl">
            Deep, structured reports for your business — backed by live market
            research. Pick a template, answer 5 questions, get a 30-page strategy
            memo in 30 seconds.
          </p>
        </div>
        <Link
          href="/reports/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-bg text-[13px] font-semibold hover:bg-accent-hover transition-colors btn-shine"
        >
          <Plus className="w-4 h-4" strokeWidth={2.25} />
          New report
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card-premium rounded-xl p-10 text-center">
          <div className="w-12 h-12 rounded-md bg-accent/[0.08] border border-accent/30 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-5 h-5 text-accent" strokeWidth={1.75} />
          </div>
          <h2 className="font-display font-semibold text-lg text-fg tracking-tight mb-1">
            No reports yet
          </h2>
          <p className="text-[13px] text-fg-muted mb-6 max-w-sm mx-auto">
            Generate your first investor-grade business report — takes about 30
            seconds.
          </p>
          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-bg text-[13px] font-semibold hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2.25} />
            Create your first report
          </Link>
        </div>
      ) : (
        <ReportsBrowser reports={rows} />
      )}
    </div>
  )
}
