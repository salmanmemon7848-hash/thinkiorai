import { createClient } from '@/lib/supabase/server'
import ReportViewer from '@/components/features/ReportViewer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Business Report — Thinkior AI',
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: report, error } = await supabase
    .from('business_reports')
    .select('id, user_id, report_data')
    .eq('id', params.id)
    .single()

  if (error || !report || report.user_id !== user!.id) return notFound()

  return (
    <div className="space-y-4">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> All reports
      </Link>
      <ReportViewer report={report.report_data as Record<string, unknown>} />
    </div>
  )
}
