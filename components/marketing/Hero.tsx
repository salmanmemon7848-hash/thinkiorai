'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Sparkles, TrendingDown, TrendingUp, Search } from 'lucide-react'

const WIRE_FEED = [
  { delay: 900, kind: 'thinking', text: 'Analyzing Indian market...' },
  { delay: 2200, kind: 'verdict', text: 'PIVOT', sub: '78% confidence' },
  { delay: 2900, kind: 'metric', label: 'India TAM', value: '₹4,200 Cr', trend: 'down', note: 'Blinkit/Zepto saturating' },
  { delay: 3500, kind: 'metric', label: 'Adjacent SAM', value: '₹1,100 Cr', trend: 'up', note: 'Rural kirana — 0 funded' },
  { delay: 4200, kind: 'action', text: 'Interview 10 kirana owners this week' },
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
              Pitch Evaluator v2 is live for founders
            </span>
            <ArrowRight className="w-3 h-3 text-fg-muted group-hover:text-fg group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Headline */}
        <h1
          className="font-display text-center font-bold text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.98] tracking-tighter text-fg max-w-5xl mx-auto mb-6 opacity-0 animate-reveal-up"
          style={{ animationDelay: '150ms' }}
        >
          The AI co-founder for{' '}
          <span className="relative inline-block">
            <span className="font-serif-italic font-normal text-accent">Indian founders</span>
            <svg
              className="absolute -bottom-1 left-0 w-full h-3"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              fill="none"
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
          Brutal verdicts on your startup idea. Real Indian competitor intelligence.
          Unit economics in <span className="text-fg font-mono">₹</span>. Built for the way
          India actually builds startups — not generic Silicon Valley advice.
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
            Start free — validate an idea
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
            <span className="font-mono uppercase tracking-wider">1,800+ founders</span>
          </div>
          <span className="text-fg-faint hidden sm:inline">·</span>
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <span className="font-mono uppercase tracking-wider">47 cities across India</span>
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
                Live · GPT-4o + Gemini + Groq
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
                      Validate my idea: hyperlocal grocery delivery for Tier-2 Indian cities.
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

              {/* Right metrics panel */}
              <div className="bg-bg-sub p-5 hidden md:block">
                <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted mb-4">
                  Idea scorecard
                </p>
                <div className="space-y-4">
                  {[
                    { label: 'Market signal', score: 78, color: 'signal-pivot' },
                    { label: 'Unit economics', score: 42, color: 'signal-rose' },
                    { label: 'Regulatory risk', score: 12, color: 'signal-go' },
                    { label: 'Founder-market fit', score: 85, color: 'accent' },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-[12px] text-fg-dim">{m.label}</span>
                        <span className="font-mono text-[12px] font-semibold tabular text-fg">{m.score}</span>
                      </div>
                      <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${m.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${m.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 pt-5 border-t border-line">
                  <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted mb-3">
                    Competitors detected
                  </p>
                  <div className="space-y-2">
                    {['Blinkit', 'Zepto', 'Instamart'].map((c) => (
                      <div key={c} className="flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-2">
                          <Search className="w-3 h-3 text-fg-muted" />
                          <span className="text-fg">{c}</span>
                        </div>
                        <span className="font-mono text-fg-muted">Funded</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-xs text-fg-muted mt-5 font-mono uppercase tracking-wider">
            Live output · Not a mock
          </p>
        </div>
      </div>
    </section>
  )
}
