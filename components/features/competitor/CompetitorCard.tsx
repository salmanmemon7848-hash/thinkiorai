'use client'

/**
 * THINKIOR — COMPETITOR CARD
 * ─────────────────────────────────────────────────────────────────
 * Renders the structured THINKIOR_CARD for Competitor Research.
 * Sections:
 *   1. Headline
 *   2. Battlefield map (4 quadrants: leader / niche / weak / unmet)
 *   3. Competitor rows (name, type, what, weakness, funding, why)
 *   4. Pricing strip (range + gap)
 *   5. Customer complaint patterns
 *   6. Positioning guidance (4 fields)
 *   7. White-space callout
 *   8. Share + downloadable image
 * ─────────────────────────────────────────────────────────────────
 */

import { useRef, useState } from 'react'
import {
  Search,
  Trophy,
  Users,
  TrendingDown,
  Target,
  IndianRupee,
  AlertCircle,
  Compass,
  Map,
  Lightbulb,
  Download,
  Share2,
  Loader2,
  Copy,
  Check,
  Crown,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type {
  CompetitorCard,
  CompetitorEntry,
} from '@/lib/ai/cardSchemas'

// ── Battlefield quadrant ───────────────────────────────────────

function Quadrant({
  icon: Icon,
  title,
  tone,
  items,
  empty,
}: {
  icon: React.ElementType
  title: string
  tone: 'go' | 'pivot' | 'rose' | 'violet'
  items: string[]
  empty: string
}) {
  const toneCls: Record<typeof tone, { wrap: string; text: string; icon: string }> = {
    go: { wrap: 'border-signal-go/30 bg-signal-go/[0.04]', text: 'text-signal-go', icon: 'text-signal-go' },
    pivot: { wrap: 'border-signal-pivot/30 bg-signal-pivot/[0.04]', text: 'text-signal-pivot', icon: 'text-signal-pivot' },
    rose: { wrap: 'border-signal-rose/30 bg-signal-rose/[0.04]', text: 'text-signal-rose', icon: 'text-signal-rose' },
    violet: { wrap: 'border-signal-violet/30 bg-signal-violet/[0.04]', text: 'text-signal-violet', icon: 'text-signal-violet' },
  }
  const t = toneCls[tone]
  return (
    <div className={cn('card-premium rounded-lg p-3.5 border', t.wrap)}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={cn('w-3.5 h-3.5', t.icon)} strokeWidth={2} />
        <p className={cn('text-[10px] font-mono uppercase tracking-caps font-semibold', t.text)}>
          {title}
        </p>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i} className="text-[12.5px] text-fg leading-snug">
              {it}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-fg-faint italic">{empty}</p>
      )}
    </div>
  )
}

// ── Competitor row ─────────────────────────────────────────────

function CompetitorRow({ c, idx }: { c: CompetitorEntry; idx: number }) {
  const typeTone =
    c.type === 'Direct'
      ? 'bg-signal-rose/10 text-signal-rose border-signal-rose/30'
      : c.type === 'Indirect'
        ? 'bg-signal-pivot/10 text-signal-pivot border-signal-pivot/30'
        : 'bg-signal-violet/10 text-signal-violet border-signal-violet/30'

  return (
    <div className="card-premium rounded-md p-4">
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <span className="font-mono text-[11px] font-semibold text-fg-faint tabular w-5 flex-shrink-0">
          {String(idx + 1).padStart(2, '0')}
        </span>
        <span className="font-display font-semibold text-[14.5px] text-fg leading-tight">
          {c.name}
        </span>
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-caps',
            typeTone
          )}
        >
          {c.type}
        </span>
      </div>
      {c.one_liner && (
        <p className="text-[13px] text-fg-dim leading-relaxed mb-2 sm:pl-7">
          {c.one_liner}
        </p>
      )}
      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2 sm:pl-7">
        {c.weakness && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-caps text-signal-rose mb-0.5">
              Weakness
            </p>
            <p className="text-[12.5px] text-fg-dim leading-relaxed">{c.weakness}</p>
          </div>
        )}
        {c.funding && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-caps text-accent mb-0.5">
              Funding
            </p>
            <p className="text-[12.5px] text-fg-dim leading-relaxed">{c.funding}</p>
          </div>
        )}
      </div>
      {c.why_matters && (
        <div className="mt-2 sm:pl-7 pt-2 border-t border-line-soft">
          <p className="text-[10px] font-mono uppercase tracking-caps text-signal-insight mb-0.5">
            Why this matters to you
          </p>
          <p className="text-[12.5px] text-fg leading-relaxed">{c.why_matters}</p>
        </div>
      )}
    </div>
  )
}

// ── Main card ──────────────────────────────────────────────────

export default function CompetitorCardView({ card }: { card: CompetitorCard }) {
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
      link.download = 'thinkior-competitor-battlefield.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to download competitor image:', err)
    } finally {
      setDownloading(false)
    }
  }

  async function shareLink() {
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({
          title: 'Competitor Battlefield — Thinkior',
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
      <div
        ref={ref}
        className="card-premium rounded-2xl overflow-hidden border border-signal-insight/30"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-7 border-b border-line relative">
          <div className="mesh-bg" aria-hidden="true" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-signal-insight/30 bg-signal-insight/[0.08] text-signal-insight text-[11px] font-mono uppercase tracking-caps font-semibold">
                <Search className="w-3.5 h-3.5" strokeWidth={2.25} />
                Competitor Intel
              </span>
            </div>
            <h3 className="font-display font-semibold text-[18px] text-fg leading-snug tracking-tight max-w-2xl">
              {card.headline}
            </h3>
          </div>
        </div>

        {/* Battlefield map */}
        <div className="px-6 sm:px-8 py-6 border-b border-line">
          <div className="flex items-center gap-2 mb-3">
            <Map className="w-3.5 h-3.5 text-signal-insight" />
            <p className="eyebrow text-signal-insight">Battlefield map</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Quadrant
              icon={Crown}
              title="Leader"
              tone="go"
              items={card.battlefield.leader ? [card.battlefield.leader] : []}
              empty="No clear leader"
            />
            <Quadrant
              icon={Users}
              title="Niche players"
              tone="violet"
              items={card.battlefield.niche}
              empty="No strong niche yet"
            />
            <Quadrant
              icon={TrendingDown}
              title="Weak incumbents"
              tone="rose"
              items={card.battlefield.weak}
              empty="None visibly weak"
            />
            <Quadrant
              icon={Lightbulb}
              title="Unmet demand"
              tone="pivot"
              items={card.battlefield.unmet ? [card.battlefield.unmet] : []}
              empty="No clear gap"
            />
          </div>
        </div>

        {/* Competitor rows */}
        {card.competitors.length > 0 && (
          <div className="px-6 sm:px-8 py-6 border-b border-line">
            <p className="eyebrow text-fg-muted mb-3">Competitors on the field</p>
            <div className="space-y-2.5">
              {card.competitors.map((c, i) => (
                <CompetitorRow key={i} c={c} idx={i} />
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        {(card.pricing.range || card.pricing.gap) && (
          <div className="px-6 sm:px-8 py-6 border-b border-line">
            <div className="flex items-center gap-2 mb-3">
              <IndianRupee className="w-3.5 h-3.5 text-accent" />
              <p className="eyebrow text-accent">Pricing landscape</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {card.pricing.range && (
                <div className="card-premium rounded-md p-3.5">
                  <p className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mb-1">
                    Current range
                  </p>
                  <p className="text-[13.5px] text-fg font-display font-semibold leading-snug">
                    {card.pricing.range}
                  </p>
                </div>
              )}
              {card.pricing.gap && (
                <div className="card-premium rounded-md p-3.5 border-signal-pivot/30 bg-signal-pivot/[0.04]">
                  <p className="text-[10px] font-mono uppercase tracking-caps text-signal-pivot mb-1">
                    Open price band
                  </p>
                  <p className="text-[13.5px] text-fg leading-snug">{card.pricing.gap}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complaints */}
        {card.complaints.length > 0 && (
          <div className="px-6 sm:px-8 py-6 border-b border-line">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-3.5 h-3.5 text-signal-rose" />
              <p className="eyebrow text-signal-rose">What real users complain about</p>
            </div>
            <ul className="space-y-2">
              {card.complaints.map((c, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[13.5px] text-fg-dim leading-relaxed"
                >
                  <X className="w-3.5 h-3.5 text-signal-rose mt-1 flex-shrink-0" strokeWidth={2.5} />
                  <span className="flex-1">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Positioning */}
        <div className="px-6 sm:px-8 py-6 border-b border-line">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-3.5 h-3.5 text-signal-violet" />
            <p className="eyebrow text-signal-violet">Your positioning</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {card.positioning.compete_where && (
              <div className="card-premium rounded-md p-3.5 border-signal-go/30 bg-signal-go/[0.04]">
                <p className="text-[10px] font-mono uppercase tracking-caps text-signal-go mb-1.5">
                  Where to compete
                </p>
                <p className="text-[13.5px] text-fg leading-relaxed">
                  {card.positioning.compete_where}
                </p>
              </div>
            )}
            {card.positioning.dont_compete_where && (
              <div className="card-premium rounded-md p-3.5 border-signal-rose/30 bg-signal-rose/[0.04]">
                <p className="text-[10px] font-mono uppercase tracking-caps text-signal-rose mb-1.5">
                  Where not to play
                </p>
                <p className="text-[13.5px] text-fg leading-relaxed">
                  {card.positioning.dont_compete_where}
                </p>
              </div>
            )}
            {card.positioning.angle_to_own && (
              <div className="card-premium rounded-md p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3 h-3 text-accent" />
                  <p className="text-[10px] font-mono uppercase tracking-caps text-accent">
                    Angle to own
                  </p>
                </div>
                <p className="text-[13.5px] text-fg leading-relaxed">
                  {card.positioning.angle_to_own}
                </p>
              </div>
            )}
            {card.positioning.first_audience && (
              <div className="card-premium rounded-md p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Users className="w-3 h-3 text-signal-insight" />
                  <p className="text-[10px] font-mono uppercase tracking-caps text-signal-insight">
                    First audience
                  </p>
                </div>
                <p className="text-[13.5px] text-fg leading-relaxed">
                  {card.positioning.first_audience}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* White space */}
        {card.white_space && (
          <div className="px-6 sm:px-8 py-6 bg-bg-sub">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-3.5 h-3.5 text-accent" />
              <p className="eyebrow text-accent">The white space</p>
            </div>
            <p className="font-serif-italic text-[15.5px] text-fg leading-relaxed">
              &ldquo;{card.white_space}&rdquo;
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-bg-sub border-t border-line flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] font-mono uppercase tracking-caps text-fg-faint">
            Thinkior · Competitor Battlefield
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
                  Battlefield image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
