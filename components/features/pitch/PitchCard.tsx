'use client'

/**
 * THINKIOR — PITCH CARD
 * ─────────────────────────────────────────────────────────────────
 * Investor-grade scorecard rendered below a Pitch Evaluator reply.
 *
 * Sections:
 *   1. Tier pill + overall score
 *   2. 7 sub-scores (problem, solution, market, traction, business
 *      model, team, ask) with the lowest one highlighted
 *   3. Strongest point + biggest red flag (side-by-side)
 *   4. Weakest slide: topic, issue, slide-ready rewrite
 *   5. "What an investor will think" pull-quote
 *   6. The kill-your-raise line + the fix-in-10-min line
 *   7. What this specific investor wants next
 *   8. Share + downloadable image
 * ─────────────────────────────────────────────────────────────────
 */

import { useRef, useState } from 'react'
import {
  Presentation,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Target,
  Sparkles,
  PenLine,
  Clock,
  ArrowRight,
  Download,
  Share2,
  Loader2,
  Copy,
  Check,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { PitchCard, PitchScores } from '@/lib/ai/cardSchemas'

// ── Tier pill ──────────────────────────────────────────────────

function TierPill({ tier }: { tier: PitchCard['tier'] }) {
  const map: Record<PitchCard['tier'], { label: string; cls: string; icon: any }> = {
    seed: {
      label: 'Seed ready',
      cls: 'bg-signal-go/15 text-signal-go border-signal-go/40',
      icon: CheckCircle2,
    },
    angel: {
      label: 'Angel ready',
      cls: 'bg-accent/15 text-accent border-accent/40',
      icon: TrendingUp,
    },
    pre_seed: {
      label: 'Pre-seed ready',
      cls: 'bg-signal-pivot/15 text-signal-pivot border-signal-pivot/40',
      icon: Target,
    },
    not_ready: {
      label: 'Not ready',
      cls: 'bg-signal-rose/15 text-signal-rose border-signal-rose/40',
      icon: AlertCircle,
    },
  }
  const t = map[tier]
  const Icon = t.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[11.5px] font-mono uppercase tracking-caps font-semibold',
        t.cls
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
      {t.label}
    </span>
  )
}

// ── Sub-score bar (highlights the lowest) ──────────────────────

function SubScore({
  label,
  value,
  isLowest,
}: {
  label: string
  value: number
  isLowest: boolean
}) {
  const tone =
    value >= 75 ? 'go' : value >= 55 ? 'pivot' : value >= 35 ? 'pivot' : 'kill'
  const barClass =
    tone === 'go'
      ? 'bg-signal-go'
      : tone === 'kill'
        ? 'bg-signal-kill'
        : 'bg-signal-pivot'
  const textClass =
    tone === 'go'
      ? 'text-signal-go'
      : tone === 'kill'
        ? 'text-signal-kill'
        : 'text-signal-pivot'

  return (
    <div
      className={cn(
        'card-premium rounded-md p-3',
        isLowest && 'border-signal-rose/40 bg-signal-rose/[0.04]'
      )}
    >
      <div className="flex items-baseline justify-between mb-1.5">
        <span
          className={cn(
            'text-[11px] font-mono uppercase tracking-caps',
            isLowest ? 'text-signal-rose font-semibold' : 'text-fg-muted'
          )}
        >
          {label}
        </span>
        <span className={cn('text-[14px] font-display font-semibold tabular', textClass)}>
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barClass)}
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
      {isLowest && (
        <p className="text-[10px] font-mono uppercase tracking-caps text-signal-rose mt-1.5">
          Weakest link
        </p>
      )}
    </div>
  )
}

// ── Main card ──────────────────────────────────────────────────

export default function PitchCardView({ card }: { card: PitchCard }) {
  const ref = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Find the lowest-scoring section
  const scores = card.scores
  const lowest = (Object.entries(scores) as Array<[keyof PitchScores, number]>).reduce(
    (min, [k, v]) => (v < min[1] ? [k, v] : min),
    ['problem', 100] as [keyof PitchScores, number]
  )
  const lowestKey = lowest[0]

  const scoreTone =
    card.tier === 'seed'
      ? 'text-signal-go'
      : card.tier === 'angel'
        ? 'text-accent'
        : card.tier === 'pre_seed'
          ? 'text-signal-pivot'
          : 'text-signal-rose'
  const ring =
    card.tier === 'seed'
      ? 'stroke-signal-go'
      : card.tier === 'angel'
        ? 'stroke-accent'
        : card.tier === 'pre_seed'
          ? 'stroke-signal-pivot'
          : 'stroke-signal-rose'

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (card.score / 100) * circumference

  async function downloadImage() {
    if (!ref.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#0A0A0B',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `thinkior-pitch-${card.tier}-${card.score}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to download pitch card image:', err)
    } finally {
      setDownloading(false)
    }
  }

  async function shareLink() {
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({
          title: `Pitch score: ${card.score}/100 — ${card.tier.replace('_', ' ')}`,
          text: card.headline,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      // user cancelled
    }
  }

  return (
    <div className="animate-fade-in my-2">
      <div ref={ref} className="card-premium rounded-2xl overflow-hidden border border-signal-violet/30">
        {/* Header */}
        <div className="px-6 sm:px-8 py-7 border-b border-line relative">
          <div className="mesh-bg" aria-hidden="true" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  className="stroke-bg-elevated"
                  strokeWidth="6"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  className={ring}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="text-center">
                <div className={cn('font-display font-bold text-4xl tabular leading-none', scoreTone)}>
                  {card.score}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mt-1">
                  / 100
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-signal-violet/30 bg-signal-violet/[0.08] text-signal-violet text-[11px] font-mono uppercase tracking-caps font-semibold">
                  <Presentation className="w-3.5 h-3.5" strokeWidth={2.25} />
                  Pitch Scorecard
                </span>
                <TierPill tier={card.tier} />
              </div>
              <h3 className="font-display font-semibold text-[17px] text-fg leading-snug tracking-tight">
                {card.headline}
              </h3>
            </div>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="px-6 sm:px-8 py-6 border-b border-line">
          <p className="eyebrow text-fg-muted mb-4">7-section scorecard</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(Object.keys(scores) as Array<keyof PitchScores>).map((k) => (
              <SubScore
                key={k}
                label={k.replace(/_/g, ' ')}
                value={scores[k]}
                isLowest={k === lowestKey}
              />
            ))}
          </div>
        </div>

        {/* Strongest + Red flag */}
        <div className="px-6 sm:px-8 py-6 border-b border-line grid sm:grid-cols-2 gap-3">
          {card.strongest && (
            <div className="card-premium rounded-md p-4 border-signal-go/30 bg-signal-go/[0.04]">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-signal-go" />
                <p className="text-[10px] font-mono uppercase tracking-caps text-signal-go font-semibold">
                  Strongest point
                </p>
              </div>
              <p className="text-[13.5px] text-fg leading-relaxed">{card.strongest}</p>
            </div>
          )}
          {card.red_flag && (
            <div className="card-premium rounded-md p-4 border-signal-rose/30 bg-signal-rose/[0.04]">
              <div className="flex items-center gap-1.5 mb-2">
                <X className="w-3.5 h-3.5 text-signal-rose" strokeWidth={2.5} />
                <p className="text-[10px] font-mono uppercase tracking-caps text-signal-rose font-semibold">
                  Biggest red flag
                </p>
              </div>
              <p className="text-[13.5px] text-fg leading-relaxed">{card.red_flag}</p>
            </div>
          )}
        </div>

        {/* Weakest slide rewrite */}
        <div className="px-6 sm:px-8 py-6 border-b border-line">
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="w-3.5 h-3.5 text-accent" />
            <p className="eyebrow text-accent">Weakest slide — rewritten</p>
          </div>
          <div className="card-premium rounded-md p-4 mb-3">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-display font-semibold text-[14px] text-fg">
                {card.weakest_slide.topic || 'The slide you need to fix'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded border border-signal-violet/30 bg-signal-violet/10 text-signal-violet text-[10px] font-mono uppercase tracking-caps">
                Weakest
              </span>
            </div>
            {card.weakest_slide.issue && (
              <p className="text-[13px] text-fg-dim leading-relaxed">
                <span className="text-signal-rose font-mono text-[10px] uppercase tracking-caps mr-1.5">
                  Issue
                </span>
                {card.weakest_slide.issue}
              </p>
            )}
          </div>
          {card.weakest_slide.rewrite && (
            <div className="card-premium rounded-md p-4 border-accent/30 bg-accent/[0.04]">
              <p className="text-[10px] font-mono uppercase tracking-caps text-accent font-semibold mb-2">
                Drop-in rewrite
              </p>
              <pre className="text-[13px] text-fg leading-relaxed whitespace-pre-wrap font-sans">
                {card.weakest_slide.rewrite}
              </pre>
            </div>
          )}
        </div>

        {/* What an investor thinks */}
        {card.investor_think && (
          <div className="px-6 sm:px-8 py-6 border-b border-line">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-signal-violet" />
              <p className="eyebrow text-signal-violet">What the investor is thinking</p>
            </div>
            <p className="font-serif-italic text-[15.5px] text-fg leading-relaxed">
              &ldquo;{card.investor_think}&rdquo;
            </p>
          </div>
        )}

        {/* Kill your raise + Fix in 10 min */}
        <div className="px-6 sm:px-8 py-6 border-b border-line grid sm:grid-cols-2 gap-3">
          {card.kill_your_raise && (
            <div className="card-premium rounded-md p-4 border-signal-rose/30 bg-signal-rose/[0.04]">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-3.5 h-3.5 text-signal-rose" />
                <p className="text-[10px] font-mono uppercase tracking-caps text-signal-rose font-semibold">
                  What kills your raise
                </p>
              </div>
              <p className="text-[13.5px] text-fg leading-relaxed">{card.kill_your_raise}</p>
            </div>
          )}
          {card.fix_in_10_min && (
            <div className="card-premium rounded-md p-4 border-signal-go/30 bg-signal-go/[0.04]">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-signal-go" />
                <p className="text-[10px] font-mono uppercase tracking-caps text-signal-go font-semibold">
                  Fix in 10 minutes
                </p>
              </div>
              <p className="text-[13.5px] text-fg leading-relaxed">{card.fix_in_10_min}</p>
            </div>
          )}
        </div>

        {/* What investor wants next */}
        {card.what_investor_wants && (
          <div className="px-6 sm:px-8 py-6 bg-bg-sub">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="w-3.5 h-3.5 text-accent" />
              <p className="eyebrow text-accent">What this investor wants next</p>
            </div>
            <p className="text-[14px] text-fg leading-relaxed">{card.what_investor_wants}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-bg-sub border-t border-line flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] font-mono uppercase tracking-caps text-fg-faint">
            Thinkior · Pitch Scorecard
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={shareLink}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-fg-dim hover:text-fg px-3 py-1.5 rounded-md hover:bg-bg-elevated transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-signal-go" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </>
              )}
            </button>
            <button
              onClick={downloadImage}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold bg-accent text-bg hover:bg-accent-hover px-3 py-1.5 rounded-md transition-colors btn-shine"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" strokeWidth={2.25} />
                  Scorecard image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
