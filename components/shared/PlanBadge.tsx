'use client'

import { PLAN_NAMES } from '@/lib/constants'
import type { Plan } from '@/types'
import { cn } from '@/lib/utils/cn'

interface PlanBadgeProps {
  plan: Plan
  className?: string
}

const PLAN_STYLES: Record<Plan, string> = {
  free: 'bg-bg-card text-fg-muted border-line',
  builder: 'bg-signal-insight/10 text-signal-insight border-signal-insight/30',
  founder_pro: 'bg-accent/10 text-accent border-accent/30',
}

export default function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-caps uppercase border',
        PLAN_STYLES[plan],
        className
      )}
    >
      {PLAN_NAMES[plan]}
    </span>
  )
}
