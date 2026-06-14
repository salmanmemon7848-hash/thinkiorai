'use client'

/**
 * THINKIOR — IDEAS CARD
 * ─────────────────────────────────────────────────────────────────
 * Renders the structured THINKIOR_CARD for Ideas Desk.
 *
 * Two modes (decided by the LLM):
 *   - vague: 5-question intake flow. Founder answers them, then
 *            Ideas Desk turns the answers into a specific plan.
 *   - specific: full plan — first customer, first product, first
 *               offer, first pricing, first revenue path, launch
 *               channel, plus a build/pivot/don't-start decision.
 * ─────────────────────────────────────────────────────────────────
 */

import { useRef, useState } from 'react'
import {
  Lightbulb,
  Rocket,
  Repeat,
  PauseCircle,
  User,
  Package,
  Megaphone,
  Tag,
  Wallet,
  Target,
  HelpCircle,
  Download,
  Share2,
  Loader2,
  Check,
  Copy,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { IdeasCard, IdeasQuestion } from '@/lib/ai/cardSchemas'

// ── Decision pill ──────────────────────────────────────────────

function DecisionPill({ decision }: { decision: IdeasCard['decision'] }) {
  const map: Record<IdeasCard['decision'], { label: string; cls: string; icon: any }> = {
    build: {
      label: 'Build this',
      cls: 'bg-signal-go/15 text-signal-go border-signal-go/40',
      icon: Rocket,
    },
    pivot: {
      label: 'Pivot this',
      cls: 'bg-signal-pivot/15 text-signal-pivot border-signal-pivot/40',
      icon: Repeat,
    },
    dont_start_yet: {
      label: "Don't start yet",
      cls: 'bg-signal-rose/15 text-signal-rose border-signal-rose/40',
      icon: PauseCircle,
    },
  }
  const d = map[decision]
  const Icon = d.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[12px] font-mono uppercase tracking-caps font-semibold',
        d.cls
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
      {d.label}
    </span>
  )
}

// ── Vague mode: 5-question flow ────────────────────────────────

function QuestionRow({ q, idx }: { q: IdeasQuestion; idx: number }) {
  return (
    <div className="card-premium rounded-md p-4 flex gap-3">
      <div className="w-7 h-7 rounded-md bg-accent/[0.08] border border-accent/30 flex items-center justify-center text-accent font-mono font-semibold text-[12px] flex-shrink-0">
        {String(idx + 1).padStart(2, '0')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] text-fg leading-relaxed font-display font-medium">
          {q.q}
        </p>
        {q.why && (
          <p className="text-[12px] text-fg-faint leading-relaxed mt-1.5">
            <span className="text-accent font-mono text-[10px] uppercase tracking-caps mr-1.5">
              Why
            </span>
            {q.why}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Specific mode: full plan row ───────────────────────────────

function PlanRow({
  icon: Icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ElementType
  label: string
  value: string
  tone?: 'default' | 'go' | 'pivot' | 'insight' | 'violet'
}) {
  const toneCls: Record<NonNullable<typeof tone>, { icon: string; text: string }> = {
    default: { icon: 'text-fg-dim', text: 'text-fg' },
    go: { icon: 'text-signal-go', text: 'text-signal-go' },
    pivot: { icon: 'text-signal-pivot', text: 'text-signal-pivot' },
    insight: { icon: 'text-signal-insight', text: 'text-signal-insight' },
    violet: { icon: 'text-signal-violet', text: 'text-signal-violet' },
  }
  const t = toneCls[tone ?? 'default']
  return (
    <div className="card-premium rounded-md p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={cn('w-3.5 h-3.5', t.icon)} strokeWidth={2} />
        <p className="text-[10px] font-mono uppercase tracking-caps text-fg-muted">{label}</p>
      </div>
      <p className={cn('text-[13.5px] leading-relaxed', t.text)}>{value}</p>
    </div>
  )
}

// ── Main card ──────────────────────────────────────────────────

export default function IdeasCardView({ card }: { card: IdeasCard }) {
  const ref = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

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
      link.download = `thinkior-ideas-${card.mode}-${card.decision}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to download ideas card image:', err)
    } finally {
      setDownloading(false)
    }
  }

  async function shareLink() {
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({
          title: `Ideas Desk · ${card.decision.replace('_', ' ')}`,
          text: card.decision_reason,
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

  const isVague = card.mode === 'vague'

  return (
    <div className="animate-fade-in my-2">
      <div
        ref={ref}
        className="card-premium rounded-2xl overflow-hidden border border-signal-pivot/30"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-7 border-b border-line relative">
          <div className="mesh-bg" aria-hidden="true" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-signal-pivot/30 bg-signal-pivot/[0.08] text-signal-pivot text-[11px] font-mono uppercase tracking-caps font-semibold">
                <Lightbulb className="w-3.5 h-3.5" strokeWidth={2.25} />
                Ideas Desk
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-line text-[11px] font-mono uppercase tracking-caps text-fg-muted">
                {isVague ? 'Vague → 5 questions' : 'Specific → full plan'}
              </span>
            </div>
            <DecisionPill decision={card.decision} />
            {card.decision_reason && (
              <p className="font-display font-semibold text-[16px] text-fg leading-snug tracking-tight mt-3 max-w-2xl">
                {card.decision_reason}
              </p>
            )}
          </div>
        </div>

        {/* Vague mode: 5 questions */}
        {isVague && card.questions && card.questions.length === 5 && (
          <div className="px-6 sm:px-8 py-6">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-accent" />
              <p className="eyebrow text-accent">5 questions to unlock your first idea</p>
            </div>
            <p className="text-[13.5px] text-fg-dim leading-relaxed mb-4">
              Answer these in order. The more honest you are, the sharper the plan
              you&apos;ll get on the next turn.
            </p>
            <div className="space-y-2.5">
              {card.questions.map((q, i) => (
                <QuestionRow key={i} q={q} idx={i} />
              ))}
            </div>
            <div className="mt-4 card-premium rounded-md p-4 border-accent/30 bg-accent/[0.04]">
              <p className="text-[10px] font-mono uppercase tracking-caps text-accent font-semibold mb-1.5">
                How to use this
              </p>
              <p className="text-[13px] text-fg-dim leading-relaxed">
                Send your answers back in one message. Ideas Desk will turn them into
                a specific plan with first customer, first offer, first pricing, and
                a launch channel.
              </p>
            </div>
          </div>
        )}

        {/* Specific mode: full plan */}
        {!isVague && (
          <div className="px-6 sm:px-8 py-6 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-accent" />
              <p className="eyebrow text-accent">Your first-revenue path</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {card.first_customer && (
                <PlanRow
                  icon={User}
                  label="First customer"
                  value={card.first_customer}
                  tone="insight"
                />
              )}
              {card.first_product && (
                <PlanRow
                  icon={Package}
                  label="First product"
                  value={card.first_product}
                  tone="default"
                />
              )}
              {card.first_offer && (
                <PlanRow
                  icon={Megaphone}
                  label="First offer"
                  value={card.first_offer}
                  tone="violet"
                />
              )}
              {card.first_pricing && (
                <PlanRow
                  icon={Tag}
                  label="First pricing"
                  value={card.first_pricing}
                  tone="pivot"
                />
              )}
            </div>

            {card.first_revenue && (
              <PlanRow
                icon={Wallet}
                label="First revenue path"
                value={card.first_revenue}
                tone="go"
              />
            )}
            {card.launch_channel && (
              <PlanRow
                icon={Target}
                label="Launch channel"
                value={card.launch_channel}
                tone="default"
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-bg-sub border-t border-line flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] font-mono uppercase tracking-caps text-fg-faint">
            Thinkior · Ideas Desk
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
                  Card image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
