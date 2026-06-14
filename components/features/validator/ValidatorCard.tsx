'use client'

/**
 * THINKIOR — VALIDATOR CARD
 * ─────────────────────────────────────────────────────────────────
 * The rich card rendered below a Business Validator chat reply.
 * Self-contained, no parent state, no API calls. Share/download
 * work client-side. Scorecard image is generated with html2canvas
 * (already in package.json).
 * ─────────────────────────────────────────────────────────────────
 */

import { useRef, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  CheckCircle2,
  RotateCw,
  Calendar,
  MapPin,
  IndianRupee,
  Users,
  Share2,
  Download,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ValidatorCard, ValidatorScores, ValidatorIndiaBlock } from '@/lib/ai/cardSchemas'

// ── Subscore bar ───────────────────────────────────────────────

function ScoreBar({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint?: string
}) {
  // Pick a tone from the value
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
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px] font-mono uppercase tracking-caps text-fg-muted">
          {label}
        </span>
        <span className={cn('text-[13px] font-display font-semibold tabular', textClass)}>
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barClass)}
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
      {hint && <p className="text-[11px] text-fg-faint mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}

// ── Verdict header pill ────────────────────────────────────────

function VerdictPill({ verdict }: { verdict: ValidatorCard['verdict'] }) {
  const map: Record<ValidatorCard['verdict'], { label: string; tone: string; icon: any }> = {
    GO: { label: 'GO', tone: 'go', icon: CheckCircle2 },
    PIVOT: { label: 'PIVOT', tone: 'pivot', icon: RotateCw },
    KILL: { label: 'KILL', tone: 'kill', icon: AlertTriangle },
  }
  const v = map[verdict]
  const Icon = v.icon
  const cls =
    v.tone === 'go'
      ? 'bg-signal-go/15 text-signal-go border-signal-go/40'
      : v.tone === 'kill'
        ? 'bg-signal-kill/15 text-signal-kill border-signal-kill/40'
        : 'bg-signal-pivot/15 text-signal-pivot border-signal-pivot/40'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[12px] font-mono uppercase tracking-caps font-semibold',
        cls
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
      {v.label}
    </span>
  )
}

// ── Big circular score ─────────────────────────────────────────

function BigScore({ score, verdict }: { score: number; verdict: ValidatorCard['verdict'] }) {
  const tone =
    verdict === 'GO' ? 'text-signal-go' : verdict === 'KILL' ? 'text-signal-kill' : 'text-signal-pivot'
  const ring =
    verdict === 'GO'
      ? 'stroke-signal-go'
      : verdict === 'KILL'
        ? 'stroke-signal-kill'
        : 'stroke-signal-pivot'

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" className="stroke-bg-elevated" strokeWidth="6" />
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
        <div className={cn('font-display font-bold text-4xl tabular leading-none', tone)}>
          {score}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mt-1">
          / 100
        </div>
      </div>
    </div>
  )
}

// ── India block ────────────────────────────────────────────────

function IndiaBlock({ india }: { india: ValidatorIndiaBlock }) {
  const items: { label: string; value: string; icon: any; tone?: string }[] = [
    { label: 'TAM', value: india.tam, icon: IndianRupee, tone: 'text-signal-go' },
    { label: 'SAM', value: india.sam, icon: Target, tone: 'text-signal-insight' },
    { label: 'SOM (Yr 1)', value: india.som_year1, icon: TrendingUp, tone: 'text-signal-violet' },
  ]
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <span className="eyebrow text-accent">India Market Reality</span>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 mb-3">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <div key={it.label} className="card-premium rounded-md p-3">
              <p className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mb-1.5">
                {it.label}
              </p>
              <p className={cn('text-[13px] font-display font-semibold leading-tight', it.tone)}>
                {it.value || '—'}
              </p>
            </div>
          )
        })}
      </div>
      <div className="space-y-2">
        {india.regulatory && (
          <div className="flex items-start gap-2 text-[12.5px] text-fg-dim leading-relaxed">
            <Shield className="w-3.5 h-3.5 text-signal-pivot mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-signal-pivot font-mono text-[10px] uppercase tracking-caps mr-1.5">
                Regulatory
              </span>
              {india.regulatory}
            </div>
          </div>
        )}
        {india.unit_econ && (
          <div className="flex items-start gap-2 text-[12.5px] text-fg-dim leading-relaxed">
            <IndianRupee className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-accent font-mono text-[10px] uppercase tracking-caps mr-1.5">
                Unit econ
              </span>
              {india.unit_econ}
            </div>
          </div>
        )}
        {india.geo_fit && (
          <div className="flex items-start gap-2 text-[12.5px] text-fg-dim leading-relaxed">
            <MapPin className="w-3.5 h-3.5 text-signal-insight mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-signal-insight font-mono text-[10px] uppercase tracking-caps mr-1.5">
                Geo fit
              </span>
              {india.geo_fit}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main card ──────────────────────────────────────────────────

export default function ValidatorCardView({ card }: { card: ValidatorCard }) {
  const scorecardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const verdictTone =
    card.verdict === 'GO'
      ? 'border-signal-go/30'
      : card.verdict === 'KILL'
        ? 'border-signal-kill/30'
        : 'border-signal-pivot/30'

  async function downloadImage() {
    if (!scorecardRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(scorecardRef.current, {
        backgroundColor: '#0A0A0B',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `thinkior-validator-${card.verdict.toLowerCase()}-${card.score}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Failed to download scorecard image:', err)
    } finally {
      setDownloading(false)
    }
  }

  async function shareLink() {
    setSharing(true)
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({
          title: `My Thinkior Validator Score: ${card.score}/100 — ${card.verdict}`,
          text: card.tagline,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }
    } catch {
      // user cancelled or share API unavailable — silent
    } finally {
      setSharing(false)
    }
  }

  const scoreHints: Record<keyof ValidatorScores, string> = {
    market: 'Size & growth potential in India',
    competition: 'Strength of your moat vs incumbents',
    execution: 'Can this team actually ship?',
    monetization: 'Unit economics at Indian price points',
    risk: 'Regulatory, technical, market risk (higher = safer)',
  }

  return (
    <div className="animate-fade-in my-2">
      <div
        ref={scorecardRef}
        className={cn('card-premium rounded-2xl overflow-hidden border', verdictTone)}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-7 border-b border-line relative">
          <div className="mesh-bg" aria-hidden="true" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <BigScore score={card.score} verdict={card.verdict} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <VerdictPill verdict={card.verdict} />
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-line text-[11px] font-mono uppercase tracking-caps text-fg-muted">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  {card.confidence} confidence
                </span>
              </div>
              <h3 className="font-display font-semibold text-[17px] text-fg leading-snug tracking-tight">
                {card.tagline}
              </h3>
            </div>
          </div>
        </div>

        {/* Why this score */}
        {card.why_this_score && (
          <div className="px-6 sm:px-8 py-6 border-b border-line">
            <p className="eyebrow text-fg-muted mb-2">Why this score</p>
            <p className="text-[14px] text-fg-dim leading-relaxed">{card.why_this_score}</p>
          </div>
        )}

        {/* Subscores */}
        <div className="px-6 sm:px-8 py-6 border-b border-line">
          <p className="eyebrow text-fg-muted mb-4">Score breakdown</p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            {(Object.keys(card.scores) as Array<keyof ValidatorScores>).map((k) => (
              <ScoreBar key={k} label={k} value={card.scores[k]} hint={scoreHints[k]} />
            ))}
          </div>
        </div>

        {/* India block */}
        <div className="px-6 sm:px-8 py-6 border-b border-line">
          <IndiaBlock india={card.india} />
        </div>

        {/* Escalation ladder */}
        {(card.kill_to_pivot || card.pivot_to_go) && (
          <div className="px-6 sm:px-8 py-6 border-b border-line">
            <p className="eyebrow text-fg-muted mb-3">What unlocks the next level</p>
            <div className="space-y-3">
              {card.kill_to_pivot && (
                <div className="card-premium rounded-md p-4 border-l-2 border-l-signal-kill">
                  <p className="text-[10px] font-mono uppercase tracking-caps text-signal-kill mb-1.5">
                    KILL → PIVOT
                  </p>
                  <p className="text-[13.5px] text-fg-dim leading-relaxed">{card.kill_to_pivot}</p>
                </div>
              )}
              {card.pivot_to_go && (
                <div className="card-premium rounded-md p-4 border-l-2 border-l-signal-pivot">
                  <p className="text-[10px] font-mono uppercase tracking-caps text-signal-pivot mb-1.5">
                    PIVOT → GO
                  </p>
                  <p className="text-[13.5px] text-fg-dim leading-relaxed">{card.pivot_to_go}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* First customer + first revenue */}
        {(card.first_customer || card.first_revenue) && (
          <div className="px-6 sm:px-8 py-6 border-b border-line grid sm:grid-cols-2 gap-3">
            {card.first_customer && (
              <div className="card-premium rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-3.5 h-3.5 text-signal-insight" />
                  <p className="text-[10px] font-mono uppercase tracking-caps text-signal-insight">
                    First customer
                  </p>
                </div>
                <p className="text-[13.5px] text-fg leading-relaxed">{card.first_customer}</p>
              </div>
            )}
            {card.first_revenue && (
              <div className="card-premium rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="w-3.5 h-3.5 text-signal-go" />
                  <p className="text-[10px] font-mono uppercase tracking-caps text-signal-go">
                    First revenue path
                  </p>
                </div>
                <p className="text-[13.5px] text-fg leading-relaxed">{card.first_revenue}</p>
              </div>
            )}
          </div>
        )}

        {/* 7-day plan */}
        {card.next_7_days?.length > 0 && (
          <div className="px-6 sm:px-8 py-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <p className="eyebrow text-accent">Your next 7 days</p>
            </div>
            <ol className="space-y-2">
              {card.next_7_days.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[12px] font-semibold text-accent w-6 mt-0.5 flex-shrink-0 tabular">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[13.5px] text-fg leading-relaxed flex-1">{action}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Footer with share/download */}
        <div className="px-6 sm:px-8 py-4 bg-bg-sub border-t border-line flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] font-mono uppercase tracking-caps text-fg-faint">
            Thinkior · Validator Scorecard
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={shareLink}
              disabled={sharing}
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
