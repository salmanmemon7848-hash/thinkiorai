import Link from 'next/link'
import { Sparkles, Lock } from 'lucide-react'
import type { Plan } from '@/types'
import { PLAN_NAMES } from '@/lib/constants'

interface PlanRequiredProps {
  featureName: string
  requiredPlan: Plan
  currentPlan: Plan
  description: string
}

export default function PlanRequired({
  featureName,
  requiredPlan,
  currentPlan,
  description,
}: PlanRequiredProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-3.5 h-3.5 text-accent" />
          <span className="eyebrow text-accent">Locked feature</span>
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tighter leading-tight">
          {featureName}.
        </h1>
        <p className="text-[14px] text-fg-dim mt-2 max-w-xl">
          {description}
        </p>
      </div>

      <div className="card-premium rounded-2xl p-8 md:p-10 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-5">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <h2 className="font-display font-bold text-2xl text-fg mb-2 tracking-tight">
          {featureName} is a {PLAN_NAMES[requiredPlan]} feature
        </h2>
        <p className="text-sm text-fg-dim leading-relaxed mb-6">
          You&apos;re on the{' '}
          <span className="text-fg font-medium">{PLAN_NAMES[currentPlan]}</span> plan. Upgrade
          to {PLAN_NAMES[requiredPlan]} to unlock this and other premium tools.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pricing"
            className="bg-accent text-bg hover:bg-accent-hover font-semibold text-sm px-6 py-3 rounded-md transition-all inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            See plans
          </Link>
          <Link
            href="/dashboard"
            className="border border-line hover:border-line-strong text-fg-dim hover:text-fg text-sm font-medium px-6 py-3 rounded-md transition-all"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
