'use client'

/**
 * THINKIOR — KPI STRIP
 * ─────────────────────────────────────────────────────────────────
 * Four founder-meaningful metrics:
 *   1. Startup Score   → latest validator /100, with tone
 *   2. Current Verdict → latest GO / KILL / PIVOT + when
 *   3. Next Action     → contextual recommended next step
 *   4. Founder Progress→ phase + % + days as founder
 *
 * Each card has a zero state that's motivating, not empty.
 * ─────────────────────────────────────────────────────────────────
 */

import Link from 'next/link'
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Target,
  Sparkles,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { toneBgClass, toneClass, timeAgoShort } from '@/lib/dashboard/summary'
import type { DashboardSummary } from '@/lib/dashboard/summary'

export default function KpiStrip({
  kpis,
  founderProgress,
}: {
  kpis: DashboardSummary['kpis']
  founderProgress: DashboardSummary['founderProgress']
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StartupScoreCard score={kpis.startupScore.value} tone={kpis.startupScore.tone} />
      <VerdictCard
        verdict={kpis.currentVerdict.verdict}
        createdAt={kpis.currentVerdict.createdAt}
      />
      <NextActionCard
        label={kpis.nextAction.label}
        helper={kpis.nextAction.helper}
        href={kpis.nextAction.href}
      />
      <ProgressCard
        pct={founderProgress.pct}
        label={founderProgress.label}
        days={kpis.founderProgress.days}
        stepsDone={founderProgress.stepsDone}
        stepsTotal={founderProgress.stepsTotal}
      />
    </div>
  )
}

function CardWrap({
  label,
  icon: Icon,
  children,
  className,
  href,
}: {
  label: string
  icon: React.ElementType
  children: React.ReactNode
  className?: string
  href?: string
}) {
  const inner = (
    <div
      className={cn(
        'card-premium rounded-xl p-4 sm:p-5 h-full transition-colors group',
        href && 'hover:bg-bg-elevated cursor-pointer',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-fg-muted" strokeWidth={1.75} />
          <p className="eyebrow text-fg-muted">{label}</p>
        </div>
        {href && (
          <ArrowRight className="w-3.5 h-3.5 text-fg-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
      {children}
    </div>
  )
  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  )
}

function StartupScoreCard({
  score,
  tone,
}: {
  score: number | null
  tone: 'go' | 'pivot' | 'kill' | 'none'
}) {
  if (score == null) {
    return (
      <CardWrap label="Startup score" icon={TrendingUp}>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-[28px] text-fg-muted leading-none">—</span>
          <span className="text-[12px] text-fg-faint font-mono">/100</span>
        </div>
        <p className="text-[12px] text-fg-faint mt-2 leading-relaxed">
          Run the Validator to get your score.
        </p>
      </CardWrap>
    )
  }
  return (
    <CardWrap label="Startup score" icon={TrendingUp}>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-display font-bold text-[32px] tabular leading-none tracking-tighter',
            toneClass(tone)
          )}
        >
          {score}
        </span>
        <span className="text-[13px] text-fg-muted font-mono">/100</span>
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            tone === 'go'
              ? 'bg-signal-go'
              : tone === 'kill'
                ? 'bg-signal-rose'
                : 'bg-signal-pivot'
          )}
          style={{ width: `${Math.max(2, score)}%` }}
        />
      </div>
    </CardWrap>
  )
}

function VerdictCard({
  verdict,
  createdAt,
}: {
  verdict: string | null
  createdAt: string | null
}) {
  if (!verdict) {
    return (
      <CardWrap label="Current verdict" icon={CheckCircle2}>
        <p className="font-display font-semibold text-[18px] text-fg-muted leading-tight">
          Awaiting first run
        </p>
        <p className="text-[12px] text-fg-faint mt-2 leading-relaxed">
          Run the Validator to get your GO / KILL / PIVOT.
        </p>
      </CardWrap>
    )
  }
  const tone = (
    verdict.toUpperCase() === 'GO'
      ? 'go'
      : verdict.toUpperCase() === 'KILL'
        ? 'kill'
        : 'pivot'
  ) as 'go' | 'pivot' | 'kill'
  return (
    <CardWrap label="Current verdict" icon={CheckCircle2}>
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[12px] font-mono uppercase tracking-caps font-semibold',
            toneBgClass(tone)
          )}
        >
          {verdict}
        </span>
      </div>
      <p className="text-[12px] text-fg-faint leading-relaxed">
        From latest Validator · {createdAt ? timeAgoShort(createdAt) : '—'}
      </p>
    </CardWrap>
  )
}

function NextActionCard({
  label,
  helper,
  href,
}: {
  label: string
  helper: string
  href: string
}) {
  return (
    <CardWrap label="Next action" icon={Target} href={href}>
      <p className="font-display font-semibold text-[14.5px] text-fg leading-snug">
        {label}
      </p>
      <p className="text-[12px] text-fg-dim mt-1.5 leading-relaxed">{helper}</p>
    </CardWrap>
  )
}

function ProgressCard({
  pct,
  label,
  days,
  stepsDone,
  stepsTotal,
}: {
  pct: number
  label: string
  days: number
  stepsDone: number
  stepsTotal: number
}) {
  return (
    <CardWrap label="Founder progress" icon={Sparkles}>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display font-bold text-[32px] tabular text-fg leading-none tracking-tighter">
          {pct}
        </span>
        <span className="text-[13px] text-fg-muted font-mono">%</span>
      </div>
      <p className="text-[12px] text-fg-dim mt-1.5 leading-relaxed">{label}</p>
      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: stepsTotal }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full',
              i < stepsDone ? 'bg-accent' : 'bg-bg-elevated'
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-fg-faint mt-2 leading-relaxed flex items-center gap-1.5">
        <Calendar className="w-3 h-3" />
        Day {days} as a founder
      </p>
    </CardWrap>
  )
}
