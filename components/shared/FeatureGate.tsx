'use client'

import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'
import { useUsage } from '@/hooks/useUsage'
import type { Feature, Plan } from '@/types'
import { FEATURE_NAMES, PLAN_GATED_FEATURES, PLAN_NAMES } from '@/lib/constants'
import { useAuth } from '@/contexts/AuthContext'

interface FeatureGateProps {
  feature: Feature
  children: React.ReactNode
}

const UPGRADE_HINTS: Record<Feature, string> = {
  validator: 'Score every idea you have with India-first market research.',
  marketing: 'Build a practical social-media strategy, content plan, and weekly review loop.',
  ideas: 'Generate India-relevant business ideas in any sector.',
  leads: 'Find source-backed customer and investor leads worth talking to.',
  chat: 'Your always-on co-founder who knows your business.',
  report: 'Investor-grade reports backed by live market research.',
}

export default function FeatureGate({ feature, children }: FeatureGateProps) {
  const { profile } = useAuth()
  const plan = (profile?.plan ?? 'free') as Plan
  const requiredPlan = PLAN_GATED_FEATURES[feature]
  const { usage, loading } = useUsage(feature)

  // Plan-gated first — show the upgrade wall even if usage is fine.
  if (requiredPlan && plan !== requiredPlan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-24 text-center gap-6 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="eyebrow text-accent mb-3">Upgrade required</p>
          <h3 className="font-display font-bold text-2xl md:text-3xl text-fg mb-2 tracking-tight">
            {FEATURE_NAMES[feature]} is a {PLAN_NAMES[requiredPlan]} feature
          </h3>
          <p className="text-sm text-fg-dim leading-relaxed max-w-md mx-auto">
            {UPGRADE_HINTS[feature]} You&apos;re currently on the{' '}
            <span className="text-fg font-medium">{PLAN_NAMES[plan]}</span> plan.
          </p>
        </div>
        <div className="flex gap-3 pt-2 flex-wrap justify-center">
          <Link
            href="/pricing"
            className="bg-accent text-bg hover:bg-accent-hover font-semibold text-sm px-5 py-2.5 rounded-md transition-all flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            Upgrade to {PLAN_NAMES[requiredPlan]}
          </Link>
          <Link
            href="/dashboard"
            className="border border-line hover:border-line-strong text-fg-dim hover:text-fg text-sm font-medium px-5 py-2.5 rounded-md transition-all"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Otherwise check the daily usage cap.
  if (loading) return <>{children}</>

  if (usage?.exceeded) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-6 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
          <Lock className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-display font-bold text-2xl text-fg mb-2 tracking-tight">
            Daily limit reached
          </h3>
          <p className="text-sm text-fg-dim leading-relaxed">
            You&apos;ve used all your {FEATURE_NAMES[feature]} queries for today.
            Upgrade to get more, or come back tomorrow.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link
            href="/pricing"
            className="bg-accent text-bg hover:bg-accent-hover font-semibold text-sm px-5 py-2.5 rounded-md transition-all"
          >
            Upgrade plan
          </Link>
          <Link
            href="/dashboard"
            className="border border-line hover:border-line-strong text-fg-dim hover:text-fg text-sm font-medium px-5 py-2.5 rounded-md transition-all"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
