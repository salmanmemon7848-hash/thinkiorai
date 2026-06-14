'use client'

/**
 * THINKIOR — RECOMMENDED NEXT STEP
 * ─────────────────────────────────────────────────────────────────
 * Personalized, intelligent-feeling next step. Decided by the
 * server-side summary based on which milestones the founder has
 * hit. Tone-coloured by the verdict it refers to (rose for KILL,
 * pivot for PIVOT, accent for GO, insight for the next tool).
 * ─────────────────────────────────────────────────────────────────
 */

import Link from 'next/link'
import { ArrowRight, Sparkles, Lightbulb, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { DashboardSummary } from '@/lib/dashboard/summary'

const TONE: Record<
  DashboardSummary['nextStep']['accent'],
  { wrap: string; iconWrap: string; icon: string; cta: string }
> = {
  accent: {
    wrap: 'border-accent/30 bg-accent/[0.04]',
    iconWrap: 'bg-accent/15 border-accent/30',
    icon: 'text-accent',
    cta: 'text-accent',
  },
  pivot: {
    wrap: 'border-signal-pivot/30 bg-signal-pivot/[0.04]',
    iconWrap: 'bg-signal-pivot/15 border-signal-pivot/30',
    icon: 'text-signal-pivot',
    cta: 'text-signal-pivot',
  },
  rose: {
    wrap: 'border-signal-rose/30 bg-signal-rose/[0.04]',
    iconWrap: 'bg-signal-rose/15 border-signal-rose/30',
    icon: 'text-signal-rose',
    cta: 'text-signal-rose',
  },
  insight: {
    wrap: 'border-signal-insight/30 bg-signal-insight/[0.04]',
    iconWrap: 'bg-signal-insight/15 border-signal-insight/30',
    icon: 'text-signal-insight',
    cta: 'text-signal-insight',
  },
  violet: {
    wrap: 'border-signal-violet/30 bg-signal-violet/[0.04]',
    iconWrap: 'bg-signal-violet/15 border-signal-violet/30',
    icon: 'text-signal-violet',
    cta: 'text-signal-violet',
  },
}

export default function RecommendedNextStep({
  step,
}: {
  step: DashboardSummary['nextStep']
}) {
  const tone = TONE[step.accent]
  const Icon = step.accent === 'rose' ? AlertTriangle : step.accent === 'pivot' ? Sparkles : Lightbulb
  return (
    <section
      className={cn(
        'card-premium rounded-2xl relative overflow-hidden border',
        tone.wrap
      )}
    >
      <div className="px-6 sm:px-8 py-6 sm:py-7 flex flex-col lg:flex-row items-start lg:items-center gap-5 lg:gap-7">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={cn(
              'w-11 h-11 rounded-lg flex items-center justify-center border flex-shrink-0',
              tone.iconWrap
            )}
          >
            <Icon className={cn('w-5 h-5', tone.icon)} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="eyebrow text-fg-muted mb-1.5">Recommended next step</p>
            <h3
              className="font-display font-semibold text-[18px] text-fg leading-snug tracking-tight"
              dangerouslySetInnerHTML={{ __html: step.title.replace(/&apos;/g, '’') }}
            />
            <p
              className="text-[13.5px] text-fg-dim leading-relaxed mt-1.5 max-w-2xl"
              dangerouslySetInnerHTML={{ __html: step.reason.replace(/&apos;/g, '’') }}
            />
          </div>
        </div>
        <Link
          href={step.cta.href}
          className={cn(
            'inline-flex items-center gap-1.5 font-semibold text-[13.5px] px-4 py-2.5 rounded-md transition-colors whitespace-nowrap',
            tone.cta,
            'hover:underline'
          )}
        >
          {step.cta.label}
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
        </Link>
      </div>
    </section>
  )
}
