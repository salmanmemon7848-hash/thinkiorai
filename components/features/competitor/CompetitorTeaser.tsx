'use client'

/**
 * THINKIOR — COMPETITOR TEASER (FREEMIUM)
 * ─────────────────────────────────────────────────────────────────
 * Free, unauthenticated-or-low-quota preview of Competitor Intel.
 * One input, one click, one competitor with one weakness and one
 * opportunity. Drives the upsell to the full battlefield map.
 *
 * Uses the same public `/api/validator/preview` style endpoint.
 * For the Competitor teaser we re-use the LLM but in a tighter
 * mode — emitted as a small JSON card.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import { Loader2, Search, ArrowRight, Lock, Check, Compass } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

const STARTERS = [
  'Mental health app for Indian college students',
  'B2B SaaS for GST compliance for Indian MSMEs',
  'D2C protein supplements for Tier-2 gym-goers',
  'AI tutor for vernacular-medium Class 9-12 students',
]

interface TeaserResponse {
  competitor: string
  weakness: string
  opportunity: string
}

export default function CompetitorTeaser() {
  const [industry, setIndustry] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TeaserResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(e?: React.FormEvent) {
    e?.preventDefault()
    if (!industry.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/competitor/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: industry.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Could not run preview. Please try again.')
      }
      const data = await res.json()
      setResult(data.teaser)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setIndustry('')
    setError(null)
  }

  if (result) {
    return (
      <div className="animate-fade-in my-2">
        <div className="card-premium rounded-2xl overflow-hidden border border-signal-insight/30">
          <div className="px-6 sm:px-8 py-7 border-b border-line relative">
            <div className="mesh-bg" aria-hidden="true" />
            <div className="relative z-10 flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-signal-insight/15 border border-signal-insight/30 flex items-center justify-center flex-shrink-0">
                <Compass className="w-4 h-4 text-signal-insight" />
              </div>
              <div>
                <p className="eyebrow text-signal-insight mb-1.5">Quick competitor read</p>
                <h3 className="font-display font-semibold text-[17px] text-fg leading-snug">
                  {result.competitor}
                </h3>
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 border-b border-line space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-rose" />
                <p className="text-[10px] font-mono uppercase tracking-caps text-signal-rose">
                  Their weakness
                </p>
              </div>
              <p className="text-[14px] text-fg leading-relaxed">{result.weakness}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-go" />
                <p className="text-[10px] font-mono uppercase tracking-caps text-signal-go">
                  Your opportunity
                </p>
              </div>
              <p className="text-[14px] text-fg leading-relaxed">{result.opportunity}</p>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 bg-bg-sub">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-3.5 h-3.5 text-accent" />
              <p className="eyebrow text-accent">Unlock the full battlefield</p>
            </div>
            <p className="text-[13.5px] text-fg-dim leading-relaxed mb-4">
              You&apos;ve seen 1 competitor. The full Competitor Intel gives you the
              complete battlefield map — leader, niche players, weak incumbents, unmet
              demand, pricing gaps, real customer complaints, and your exact positioning
              to win.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 bg-accent text-bg hover:bg-accent-hover font-semibold text-[13px] px-4 py-2.5 rounded-md transition-colors btn-shine"
              >
                <Search className="w-3.5 h-3.5" />
                Run full Competitor Intel
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 border border-line hover:border-line-strong text-fg-dim hover:text-fg text-[13px] font-medium px-4 py-2.5 rounded-md transition-colors"
              >
                Try another market
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-2">
      <div className="card-premium rounded-2xl overflow-hidden border border-signal-insight/30 relative">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="relative z-10 px-6 sm:px-8 py-8">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-signal-insight" />
            <p className="eyebrow text-signal-insight">Free competitor teaser · no signup</p>
          </div>
          <h2 className="font-display font-bold text-2xl text-fg tracking-tightest leading-tight mb-2">
            See the one competitor you should know about.
          </h2>
          <p className="text-[13.5px] text-fg-dim leading-relaxed mb-6 max-w-xl">
            One quick read. 1 direct competitor, 1 weakness, 1 opportunity. See if there&apos;s
            a wedge before you go deeper.
          </p>

          <form onSubmit={run} className="mb-4">
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Mental health app for Indian college students"
              maxLength={200}
              className="w-full bg-bg border border-line rounded-lg px-4 py-3 text-[14px] text-fg placeholder:text-fg-muted outline-none focus:border-signal-insight/40 transition-colors"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-fg-faint font-mono">
                {industry.length}/200 · describe the market, not your full idea
              </p>
              <button
                type="submit"
                disabled={!industry.trim() || loading}
                className={cn(
                  'inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-md transition-colors',
                  industry.trim() && !loading
                    ? 'bg-accent text-bg hover:bg-accent-hover btn-shine'
                    : 'bg-bg-elevated text-fg-muted cursor-not-allowed'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Mapping the field…
                  </>
                ) : (
                  <>
                    Show the gap
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
                  onClick={() => setIndustry(s)}
                  className="text-[12px] text-fg-dim hover:text-fg border border-line hover:border-line-strong bg-bg/50 px-3 py-1.5 rounded-md transition-colors"
                >
                  {s}
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
        1 free teaser per session · no signup required
      </p>
    </div>
  )
}
