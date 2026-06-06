'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { useUsage } from '@/hooks/useUsage'
import type { Feature } from '@/types'
import { FEATURE_NAMES } from '@/lib/constants'

interface FeatureGateProps {
  feature: Feature
  children: React.ReactNode
}

export default function FeatureGate({ feature, children }: FeatureGateProps) {
  const { usage, loading } = useUsage(feature)

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
