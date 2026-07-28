'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'

const WIRE_FEED = [
  { delay: 900, kind: 'thinking', text: 'Reviewing your market and assumptions...' },
  { delay: 2200, kind: 'verdict', text: 'PIVOT', sub: 'Decision guidance' },
  { delay: 2900, kind: 'metric', label: 'Riskiest assumption', value: 'Demand', trend: 'down', note: 'Verify the customer problem before building' },
  { delay: 3500, kind: 'metric', label: 'Evidence needed', value: '5 calls', trend: 'up', note: 'Talk to people with this problem this week' },
  { delay: 4200, kind: 'action', text: 'Run five customer interviews before committing to the build' },
]

export default function Hero() {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    WIRE_FEED.forEach((line, i) => {
      setTimeout(() => setShown(i + 1), line.delay)
    })
  }, [])

  return (
    <section className="relative pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="mesh-bg" />
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-bg/0 via-bg/40 to-bg pointer-events-none" />

      <div className="relative max-w-[1240px] mx-auto px-5 sm:px-6">
        {/* Announcement pill */}
        <div className="flex justify-center mb-9 opacity-0 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2.5 bg-bg-card/80 hover:bg-bg-elevated border border-line hover:border-line-strong rounded-full px-3.5 py-1.5 transition-all duration-300"
          >
            <span className="inline-flex items-center gap-1 bg-accent/10 text-accent border border-accent/30 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold">
              New
            </span>
            <span className="text-[13px] text-fg-dim group-hover:text-fg transition-colors">
              A clearer path from idea to first revenue
            </span>
            <ArrowRight className="w-3 h-3 text-fg-muted group-hover:text-fg group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Headline */}
        <h1
          className="font-display text-center font-bold text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.98] tracking-tighter text-fg max-w-5xl mx-auto mb-6 opacity-0 animate-reveal-up"
          style={{ animationDelay: '150ms' }}
        >
          The guide for founders who want{' '}
          <span className="relative inline-block">
            <span className="font-serif-italic font-normal text-accent">better decisions</span>
            <svg
              className="absolute -bottom-1 left-0 w-full h-3"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              fill="none"
              width="200"
              height="12"
            >
              <path
                d="M2 8 Q 50 2, 100 6 T 198 5"
                stroke="rgb(63 224 176 / 0.5)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
          .
        </h1>

        {/* Subhead */}
        <p
          className="text-center text-lg md:text-xl text-fg-dim max-w-2xl mx-auto leading-relaxed mb-10 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '350ms' }}
        >
          Validate what matters, understand your market, and follow a practical route to first revenue.
          Thinkior shows its sources and gives you the next test — you make the decisions and do the work.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 opacity-0 animate-fade-in-up"
          style={{ animationDelay: '500ms' }}
        >
          <Link
            href="/signup"
            className="btn-shine group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-fg text-bg hover:bg-fg/90 font-semibold text-[15px] px-6 py-3.5 rounded-lg transition-all duration-300 shadow-glow-accent"
          >
            Start free — find your next move
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#features"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 text-fg-dim hover:text-fg border border-line hover:border-line-strong font-medium text-[15px] px-6 py-3.5 rounded-lg transition-all duration-300"
          >
            See how it works
          </a>
        </div>

        {/* Trust line */}
        <div
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-16 opacity-0 animate-fade-in"
          style={{ animationDelay: '700ms' }}
        >
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
            <span className="font-mono uppercase tracking-wider">Country-aware guidance</span>
          </div>
          <span className="text-fg-faint hidden sm:inline">·</span>
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <span className="font-mono uppercase tracking-wider">Visible research sources</span>
          </div>
          <span className="text-fg-faint hidden sm:inline">·</span>
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <span className="font-mono uppercase tracking-wider">No credit card</span>
          </div>
        </div>

        {/* Product preview */}
        <div
          className="relative max-w-5xl mx-auto opacity-0 animate-fade-in-up"
          style={{ animationDelay: '800ms' }}
        >
          {/* Glow behind */}
          <div className="absolute -inset-x-10 -inset-y-6 bg-accent/10 blur-[100px] opacity-50 pointer-events-none" />

          <div className="relative card-premium rounded-2xl overflow-hidden">
            {/* App chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-bg-sub">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-signal-rose/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-signal-pivot/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-signal-go/70" />
                <div className="ml-4 font-mono text-[11px] text-fg-muted">
                  thinkior.ai / validator
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-fg-muted font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
                Research-aware guidance
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr_320px]">
              {/* Main wire feed */}
              <div className="p-6 md:p-8 min-h-[380px] border-r border-line">
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-7 h-7 rounded-md bg-fg/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[11px] font-mono font-semibold text-fg">You</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] text-fg leading-relaxed">
                      Help me decide whether this problem is worth solving.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="flex-1 space-y-4">
                    {WIRE_FEED.slice(0, shown).map((line, i) => {
                      if (line.kind === 'thinking') {
                        return (
                          <div key={i} className="animate-fade-in-up flex items-center gap-2 text-[13px] text-fg-muted">
                            <span className="loading-dot w-1 h-1 rounded-full bg-fg-muted" />
                            <span className="loading-dot w-1 h-1 rounded-full bg-fg-muted" />
                            <span className="loading-dot w-1 h-1 rounded-full bg-fg-muted" />
                            <span className="ml-2">{line.text}</span>
                          </div>
                        )
                      }
                      if (line.kind === 'verdict') {
                        return (
                          <div key={i} className="animate-fade-in-up flex items-baseline gap-3">
                            <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">Verdict</span>
                            <span className="font-display font-bold text-3xl text-signal-pivot">{line.text}</span>
                            <span className="font-mono text-[11px] text-fg-muted">{line.sub}</span>
                          </div>
                        )
                      }
                      if (line.kind === 'metric') {
                        return (
                          <div
                            key={i}
                            className="animate-fade-in-up flex items-center justify-between gap-4 bg-bg-elevated/60 border border-line rounded-lg px-4 py-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted mb-1">
                                {line.label}
                              </p>
                              <p className="text-xs text-fg-dim truncate">{line.note}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {line.trend === 'down' ? (
                                <TrendingDown className="w-4 h-4 text-signal-rose" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-signal-go" />
                              )}
                              <span className="font-mono font-semibold text-base text-fg tabular">{line.value}</span>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div
                          key={i}
                          className="animate-fade-in-up flex items-start gap-2.5 bg-accent/[0.05] border border-accent/20 rounded-lg px-4 py-3"
                        >
                          <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <p className="text-[13px] text-fg leading-relaxed">
                            <span className="font-mono text-[10px] uppercase tracking-caps text-accent mr-2">This week</span>
                            {line.text}
                          </p>
                        </div>
                      )
                    })}
                    {shown > 0 && shown < WIRE_FEED.length && <span className="cursor-bar" />}
                  </div>
                </div>
              </div>

              {/* Guidance panel — illustrative, never presented as live data. */}
              <div className="bg-bg-sub p-5 hidden md:block">
                <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted mb-4">
                  What to verify
                </p>
                <div className="space-y-4">
                  {[
                    { label: 'Customer problem', action: 'Interview people who feel it', color: 'signal-pivot' },
                    { label: 'Current alternatives', action: 'Map what they use today', color: 'signal-rose' },
                    { label: 'Willingness to pay', action: 'Test a specific offer', color: 'signal-go' },
                    { label: 'First channel', action: 'Choose one reachable audience', color: 'accent' },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex items-baseline justify-between gap-2 mb-1.5">
                        <span className="text-[12px] text-fg-dim">{m.label}</span>
                        <CheckCircle2 className={`w-3.5 h-3.5 text-${m.color} flex-shrink-0`} />
                      </div>
                      <p className="text-[11px] text-fg-muted">{m.action}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 pt-5 border-t border-line">
                  <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted mb-3">
                    Founder rule
                  </p>
                  <p className="text-xs leading-relaxed text-fg-dim">A score is only useful when the evidence, uncertainty, and next test are visible.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-xs text-fg-muted mt-5 font-mono uppercase tracking-wider">
            Example founder workflow
          </p>
        </div>
      </div>
    </section>
  )
}
