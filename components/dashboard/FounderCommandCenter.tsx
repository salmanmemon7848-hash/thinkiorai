'use client'

/**
 * THINKIOR — FOUNDER COMMAND CENTER
 * ─────────────────────────────────────────────────────────────────
 * The "control panel" card. Sits between the KPI strip and the
 * tools grid. Surfaces:
 *   - Where you are (state)
 *   - Your latest result (or motivating zero state)
 *   - The single best next action
 *   - The next tool to use
 *
 * The visually-strongest card on the page. Larger, more breathing
 * room, layered backgrounds.
 * ─────────────────────────────────────────────────────────────────
 */

import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RotateCw,
  AlertTriangle,
  Lightbulb,
  Target,
  Compass,
  Rocket,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { toneClass, timeAgoShort } from '@/lib/dashboard/summary'
import type { DashboardSummary } from '@/lib/dashboard/summary'

export default function FounderCommandCenter({
  center,
}: {
  center: DashboardSummary['commandCenter']
}) {
  const { state, latestResult, nextAction, nextTool } = center
  return (
    <section className="card-premium rounded-2xl relative overflow-hidden border-accent/20">
      <div className="mesh-bg" aria-hidden="true" />
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-accent/30 bg-accent/[0.08] text-accent text-[10.5px] font-mono uppercase tracking-caps font-semibold">
            <Compass className="w-3 h-3" strokeWidth={2.25} />
            Founder command center
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* State */}
          <div className="lg:col-span-1">
            <p className="eyebrow text-fg-muted mb-2">Where you are</p>
            <h2 className="font-display font-semibold text-[20px] text-fg leading-tight tracking-tight">
              {state.label}
            </h2>
            <p
              className="text-[13.5px] text-fg-dim leading-relaxed mt-2.5"
              dangerouslySetInnerHTML={{ __html: state.helper.replace(/&apos;/g, '’') }}
            />
          </div>

          {/* Latest result */}
          <div className="lg:col-span-1 lg:border-l lg:border-line lg:pl-5">
            <p className="eyebrow text-fg-muted mb-2">Latest result</p>
            {latestResult ? (
              <LatestResult latest={latestResult} />
            ) : (
              <EmptyLatest />
            )}
          </div>

          {/* Next action + tool */}
          <div className="lg:col-span-1 lg:border-l lg:border-line lg:pl-5">
            <p className="eyebrow text-fg-muted mb-2">Next best move</p>
            <p className="font-display font-semibold text-[15px] text-fg leading-snug">
              {nextAction.label}
            </p>
            <p className="text-[12.5px] text-fg-dim leading-relaxed mt-1.5">
              {nextAction.helper}
            </p>
            <div className="mt-4 p-3 rounded-md bg-bg/60 border border-line">
              <p className="text-[10.5px] font-mono uppercase tracking-caps text-fg-muted mb-1.5">
                Use next
              </p>
              <Link
                href={nextTool.href}
                className="text-[13.5px] font-medium text-accent hover:underline inline-flex items-center gap-1.5"
              >
                {nextTool.label}
                <ArrowRight className="w-3 h-3" />
              </Link>
              <p
                className="text-[11.5px] text-fg-faint mt-1 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: nextTool.reason.replace(/&apos;/g, '’'),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LatestResult({
  latest,
}: {
  latest: NonNullable<DashboardSummary['commandCenter']['latestResult']>
}) {
  const tone: 'go' | 'pivot' | 'kill' | 'none' = (() => {
    const v = (latest.verdict || '').toUpperCase()
    if (v === 'GO' || v === 'SEED' || v === 'ANGEL' || v === 'BUILD') return 'go'
    if (v === 'KILL' || v === 'NOT_READY' || v === 'DONT_START_YET') return 'kill'
    if (v === 'PIVOT' || v === 'PRE_SEED') return 'pivot'
    return 'none'
  })()

  const moduleLabel: Record<string, string> = {
    validator: 'Validator',
    competitor: 'Competitor',
    leads: 'Leads Finder',
    ideas: 'Ideas',
    report: 'Report',
  }
  const Icon = (() => {
    if (latest.module === 'validator') return tone === 'kill' ? AlertTriangle : tone === 'pivot' ? RotateCw : CheckCircle2
    if (latest.module === 'leads') return Target
    if (latest.module === 'competitor') return Target
    if (latest.module === 'ideas') return Lightbulb
    return Sparkles
  })()
  const iconTone =
    tone === 'go'
      ? 'text-signal-go'
      : tone === 'kill'
        ? 'text-signal-rose'
        : tone === 'pivot'
          ? 'text-signal-pivot'
          : 'text-signal-insight'

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className={cn('w-4 h-4', iconTone)} strokeWidth={1.75} />
        <p className="text-[10.5px] font-mono uppercase tracking-caps text-fg-muted">
          {moduleLabel[latest.module] || latest.module}
        </p>
        {latest.verdict && (
          <span
            className={cn(
              'text-[10.5px] font-mono uppercase tracking-caps px-1.5 py-0.5 rounded border',
              tone === 'go'
                ? 'bg-signal-go/15 text-signal-go border-signal-go/30'
                : tone === 'kill'
                  ? 'bg-signal-rose/15 text-signal-rose border-signal-rose/30'
                  : tone === 'pivot'
                    ? 'bg-signal-pivot/15 text-signal-pivot border-signal-pivot/30'
                    : 'bg-bg-card text-fg-muted border-line'
            )}
          >
            {latest.verdict.replace('_', ' ')}
          </span>
        )}
        {latest.score_100 != null && (
          <span
            className={cn(
              'text-[11px] font-mono tabular',
              toneClass(tone)
            )}
          >
            {latest.score_100}/100
          </span>
        )}
      </div>
      <p className="text-[13.5px] text-fg leading-snug line-clamp-3">{latest.label}</p>
      <p className="text-[11.5px] text-fg-faint mt-2 flex items-center gap-1.5">
        <Calendar className="w-3 h-3" />
        {timeAgoShort(latest.createdAt)}
      </p>
    </div>
  )
}

function EmptyLatest() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Rocket className="w-4 h-4 text-accent" strokeWidth={1.75} />
        <p className="text-[10.5px] font-mono uppercase tracking-caps text-fg-muted">
          No runs yet
        </p>
      </div>
      <p className="text-[13.5px] text-fg leading-snug">
        You haven&apos;t run any tool yet. Start with the Business Validator — 30
        seconds to your first verdict.
      </p>
    </div>
  )
}
