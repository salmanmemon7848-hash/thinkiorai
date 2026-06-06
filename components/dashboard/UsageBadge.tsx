'use client'

import { useUsage } from '@/hooks/useUsage'
import type { Feature } from '@/types'
import { cn } from '@/lib/utils/cn'

interface UsageBadgeProps {
  feature: Feature
}

export default function UsageBadge({ feature }: UsageBadgeProps) {
  const { usage, loading } = useUsage(feature)

  if (loading || !usage) return null

  const pct = usage.limit > 0 ? (usage.count / usage.limit) * 100 : 0
  const isHigh = pct >= 80

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded-md border',
        isHigh
          ? 'bg-signal-rose/10 text-signal-rose border-signal-rose/30'
          : 'bg-bg-card text-fg-muted border-line'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', isHigh ? 'bg-signal-rose' : 'bg-accent')} />
      <span className="tabular">
        {usage.remaining}/{usage.limit}
      </span>
      <span className="uppercase tracking-wider">left</span>
    </div>
  )
}
