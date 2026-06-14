import { createClient } from '@/lib/supabase/server'
import ReportViewer from '@/components/features/ReportViewer'
import ReportNotFound from '@/components/features/reports/ReportNotFound'
import ShareButton from '@/components/features/reports/ShareButton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Business Report — Thinkior AI',
}

// We intentionally do NOT call notFound() for owner-mismatch cases —
// that produces a confusing 404 to the user. Instead we render a
// dedicated "report not found / wrong account" page that explains
// what happened and offers a path forward.
export default async function ReportPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Two distinct error paths:
  //   1. Row is missing entirely (or RLS hid it) — 404.
  //   2. Row exists but belongs to another user — 404-style page
  //      that says "this report is owned by a different account"
  //      so the founder knows what happened.
  const { data: report, error } = await supabase
    .from('business_reports')
    .select('id, user_id, report_data, share_slug, share_enabled')
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    // Real DB error — log it for diagnosis and show a clean 404.
    console.error('[reports/[id]] query error:', error.message)
    return <ReportNotFound reason="query_error" reportId={params.id} />
  }

  if (!report) {
    return <ReportNotFound reason="missing" reportId={params.id} />
  }

  if (!user || report.user_id !== user.id) {
    // Row exists but is owned by another account. Don't expose
    // whose account it is (privacy) — just say it's not yours.
    return <ReportNotFound reason="wrong_owner" reportId={params.id} />
  }

  // Defensive: if report_data is null/missing (rare), pass an empty
  // object — the viewer will render a clear "could not be loaded"
  // state instead of crashing.
  const reportData =
    report.report_data && typeof report.report_data === 'object'
      ? (report.report_data as Record<string, unknown>)
      : {}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All reports
        </Link>
        <ShareButton
          reportId={report.id}
          initialEnabled={!!report.share_enabled}
          initialSlug={report.share_slug}
        />
      </div>
      <ReportViewer report={reportData} />
    </div>
  )
}
