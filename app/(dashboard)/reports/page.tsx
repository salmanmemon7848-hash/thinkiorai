import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Plus, ArrowUpRight, Sparkles } from 'lucide-react'

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
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: reports } = await supabase
    .from('business_reports')
    .select('id, business_name, report_type, industry, stage, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const rows = (reports ?? []) as ReportRow[]

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
          <p className="text-[14px] text-fg-dim mt-2">
            Deep, structured reports for your business — backed by live market research.
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
            Generate your first investor-grade business report — takes about 30 seconds.
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
        <div className="space-y-2">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/reports/${r.id}`}
              className="card-premium rounded-lg p-4 flex items-center gap-4 hover:bg-bg-elevated transition-colors group"
            >
              <div className="w-9 h-9 rounded-md bg-bg-elevated border border-line flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-fg-dim group-hover:text-accent transition-colors" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold text-[14px] text-fg tracking-tight truncate">
                    {r.business_name || 'Untitled'}
                  </h3>
                  <span className="text-[11px] text-fg-muted font-mono">
                    · {r.report_type}
                  </span>
                </div>
                <p className="text-[12px] text-fg-muted mt-0.5">
                  {r.industry} · {r.stage ?? 'Unspecified stage'} ·{' '}
                  {new Date(r.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-fg-muted group-hover:text-fg group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
