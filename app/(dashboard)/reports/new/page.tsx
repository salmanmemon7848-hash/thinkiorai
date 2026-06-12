import { createClient } from '@/lib/supabase/server'
import type { Plan } from '@/types'
import ReportWizard from '@/components/features/ReportWizard'
import PlanRequired from '@/components/shared/PlanRequired'

export const metadata = {
  title: 'New Business Report — Thinkior AI',
}

export default async function NewReportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user!.id)
    .single()
  const plan = (profile?.plan ?? 'free') as Plan

  if (plan !== 'founder_pro') {
    return (
      <PlanRequired
        featureName="New Business Report"
        requiredPlan="founder_pro"
        currentPlan={plan}
        description="Investor-grade, India-first business reports backed by live market research. Founder Pro only."
      />
    )
  }

  return <ReportWizard />
}
