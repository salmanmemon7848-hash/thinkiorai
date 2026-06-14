'use client'

/**
 * THINKIOR — VALIDATOR FAST PREVIEW
 * ─────────────────────────────────────────────────────────────────
 * A free, unauthenticated-or-low-quota fast read on any idea. One
 * input, one click, one sharp verdict. Designed to convert: a taste
 * of what the full Validator does, behind a "run full validation"
 * CTA.
 *
 * This is the page users see when:
 *   - They're on the Free plan and have already burned their 1 free
 *     full Validator run.
 *   - Or they're a brand-new visitor previewing the tool from the
 *     marketing site (future use).
 *
 * The model returns a tighter THINKIOR_PREVIEW block (smaller, no
 * sub-scores, no 7-day plan). We render it as a compact card with a
 * strong upsell to the full Validator.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import { Loader2, Sparkles, Zap, ArrowRight, Lock, Check } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { ValidatorPreview } from '@/lib/ai/cardSchemas'

const STARTERS = [
  'A B2B SaaS for managing GST compliance for Indian MSMEs',
  'A D2C protein supplement brand for Tier-2 city gym-goers',
  'A hyperlocal services marketplace for domestic workers in Bangalore',
  'An AI tutor for vernacular-medium students in Class 9-12',
]

function VerdictChip({ v }: { v: ValidatorPreview['verdict'] }) {
  const map = {
    GO: { tone: 'text-signal-go', bg: 'bg-signal-go/15', border: 'border-signal-go/40' },
    PIVOT: { tone: 'text-signal-pivot', bg: 'bg-signal-pivot/15', border: 'border-signal-pivot/40' },
    KILL: { tone: 'text-signal-kill', bg: 'bg-signal-kill/15', border: 'border-signal-kill/40' },
  }
  const m = map[v]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-[12px] font-mono uppercase tracking-caps font-semibold',
        m.bg,
        m.tone,
        m.border
      )}
    >
      {v}
    </span>
  )
}

export default function ValidatorFastPreview() {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValidatorPreview | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(e?: React.FormEvent) {
    e?.preventDefault()
    if (!idea.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/validator/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Could not run preview. Please try again.')
      }
      const data = await res.json()
      setResult(data.preview)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setIdea('')
    setError(null)
  }

  if (result) {
    return (
      <div className="animate-fade-in my-2">
        <div className="card-premium rounded-2xl overflow-hidden border border-accent/20">
          <div className="px-6 sm:px-8 py-7 border-b border-line relative">
            <div className="mesh-bg" aria-hidden="true" />
            <div className="relative z-10 flex items-start gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    className="stroke-bg-elevated"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    className={
                      result.verdict === 'GO'
                        ? 'stroke-signal-go'
                        : result.verdict === 'KILL'
                          ? 'stroke-signal-kill'
                          : 'stroke-signal-pivot'
                    }
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={
                      2 * Math.PI * 44 - (result.score / 100) * 2 * Math.PI * 44
                    }
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="text-center">
                  <div
                    className={cn(
                      'font-display font-bold text-3xl tabular leading-none',
                      result.verdict === 'GO'
                        ? 'text-signal-go'
                        : result.verdict === 'KILL'
                          ? 'text-signal-kill'
                          : 'text-signal-pivot'
                    )}
                  >
                    {result.score}
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-caps text-fg-muted mt-1">
                    / 100
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <VerdictChip v={result.verdict} />
                <h3 className="font-display font-semibold text-[15px] text-fg leading-snug mt-2.5 tracking-tight">
                  {result.tagline}
                </h3>
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 border-b border-line">
            <p className="eyebrow text-fg-muted mb-3">3 reasons why</p>
            <ol className="space-y-2.5">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[12px] font-semibold text-accent w-6 mt-0.5 flex-shrink-0 tabular">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[13.5px] text-fg-dim leading-relaxed flex-1">{r}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="px-6 sm:px-8 py-5 border-b border-line">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-signal-pivot" />
              <p className="eyebrow text-signal-pivot">One tip to make it sharper</p>
            </div>
            <p className="text-[14px] text-fg leading-relaxed">{result.tip}</p>
          </div>

          <div className="px-6 sm:px-8 py-6 bg-bg-sub">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-3.5 h-3.5 text-accent" />
              <p className="eyebrow text-accent">Unlock the full Validator</p>
            </div>
            <p className="text-[13.5px] text-fg-dim leading-relaxed mb-4">
              You&apos;ve seen the headline. The full Validator gives you India market sizing, 5
              sub-scores, regulatory watch, a 7-day action plan, a shareable scorecard, and
              specific first-customer + first-revenue recommendations.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 bg-accent text-bg hover:bg-accent-hover font-semibold text-[13px] px-4 py-2.5 rounded-md transition-colors btn-shine"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Run full Validator
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 border border-line hover:border-line-strong text-fg-dim hover:text-fg text-[13px] font-medium px-4 py-2.5 rounded-md transition-colors"
              >
                Try another idea
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-2">
      <div className="card-premium rounded-2xl overflow-hidden border border-accent/20 relative">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="relative z-10 px-6 sm:px-8 py-8">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-accent" />
            <p className="eyebrow text-accent">Fast preview · free · no signup</p>
          </div>
          <h2 className="font-display font-bold text-2xl text-fg tracking-tightest leading-tight mb-2">
            Get a 30-second read on any startup idea.
          </h2>
          <p className="text-[13.5px] text-fg-dim leading-relaxed mb-6 max-w-xl">
            One sentence. Honest verdict. 3 reasons. 1 sharp tip. No fluff.
          </p>

          <form onSubmit={run} className="mb-4">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. An AI tutor for vernacular-medium students in Class 9-12"
              rows={3}
              maxLength={400}
              className="w-full bg-bg border border-line rounded-lg px-4 py-3 text-[14px] text-fg placeholder:text-fg-muted outline-none focus:border-accent/40 transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-fg-faint font-mono">
                {idea.length}/400 · best with 1-2 sentences
              </p>
              <button
                type="submit"
                disabled={!idea.trim() || loading}
                className={cn(
                  'inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-md transition-colors',
                  idea.trim() && !loading
                    ? 'bg-accent text-bg hover:bg-accent-hover btn-shine'
                    : 'bg-bg-elevated text-fg-muted cursor-not-allowed'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Reading your idea…
                  </>
                ) : (
                  <>
                    Get verdict
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div>
            <p className="text-[11px] font-mono uppercase tracking-caps text-fg-faint mb-2">
              or try one of these
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setIdea(s)}
                  className="text-[12px] text-fg-dim hover:text-fg border border-line hover:border-line-strong bg-bg/50 px-3 py-1.5 rounded-md transition-colors"
                >
                  {s.length > 60 ? s.slice(0, 58) + '…' : s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-signal-rose/10 border border-signal-rose/30 rounded-md px-4 py-3">
              <p className="font-mono text-[10px] tracking-caps uppercase text-signal-rose font-semibold mb-1">
                Error
              </p>
              <p className="text-[13px] text-fg">{error}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[11px] text-fg-faint mt-3 font-mono uppercase tracking-caps">
        <Check className="w-3 h-3 inline-block -mt-0.5 mr-1" />
        1 free preview per session · no signup required
      </p>
    </div>
  )
}
