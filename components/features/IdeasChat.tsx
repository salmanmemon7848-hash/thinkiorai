'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUsage } from '@/hooks/useUsage'
import AIChatInterface from './AIChatInterface'

const STARTERS = [
  'I have an idea for a WhatsApp-based accounting tool for kirana stores — help me develop it',
  "I want to build in the AgriTech space but don't have a specific idea yet",
  "My idea is struggling — I think I need to pivot. Here's what I've built so far...",
  'Help me find startup ideas in the ₹299–499/month B2B SaaS space for Indian SMEs',
]

/**
 * Ideas Desk chat.
 *
 * Freemium model:
 *   - Free plan users get 1 lifetime Ideas run. After that, the
 *     chat is replaced by a "vague / specific" entry point with
 *     a strong upsell.
 *   - Paid plans get the full chat with no gate.
 *   - Unauthed visitors see the entry point + upsell.
 */
export default function IdeasChat() {
  const { usage, loading } = useUsage('ideas')
  const [sessionReady, setSessionReady] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    let mounted = true
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!mounted) return
        setIsAuthed(!!data.user)
        setSessionReady(true)
      })
      .catch(() => {
        if (!mounted) return
        setSessionReady(true)
      })
    return () => {
      mounted = false
    }
  }, [])

  if (!sessionReady || loading) {
    return (
      <AIChatInterface
        feature="ideas"
        title="Ideas Desk"
        description="Develop, stress-test, and find the shortest path to first revenue."
        icon={<Lightbulb className="w-5 h-5" strokeWidth={1.75} />}
        starters={STARTERS}
        accentColor="pivot"
      />
    )
  }

  const showGate = !isAuthed || (usage?.exceeded ?? false)

  if (showGate) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] animate-fade-in">
        <header className="pb-5 mb-5 border-b border-line flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-signal-pivot/[0.12] border-signal-pivot/30 text-signal-pivot">
              <Lightbulb className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-fg leading-tight tracking-tight">
                Ideas Desk
              </h1>
              <p className="text-sm text-fg-dim mt-0.5 max-w-2xl">
                Turn vague thinking into a real plan — first customer, first offer,
                first revenue path, and a clear build / pivot / wait decision.
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="card-premium rounded-2xl overflow-hidden border border-signal-pivot/30 relative">
            <div className="mesh-bg" aria-hidden="true" />
            <div className="relative z-10 px-6 sm:px-8 py-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-signal-pivot" />
                <p className="eyebrow text-signal-pivot">Free Ideas Desk · no signup</p>
              </div>
              <h2 className="font-display font-bold text-2xl text-fg tracking-tightest leading-tight mb-2">
                Two ways in. Pick whichever matches you.
              </h2>
              <p className="text-[13.5px] text-fg-dim leading-relaxed mb-6 max-w-xl">
                The full Ideas Desk gives you the same in one go: a co-founder
                who pushes back, scores the idea, and ends with build / pivot /
                don&apos;t start yet.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <Link
                  href="/pricing"
                  className="card-premium rounded-lg p-5 hover:bg-bg-elevated transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-signal-pivot" />
                    <p className="font-display font-semibold text-[14.5px] text-fg">
                      I have a vague direction
                    </p>
                  </div>
                  <p className="text-[12.5px] text-fg-dim leading-relaxed">
                    &ldquo;I want to build in AgriTech but no idea yet.&rdquo; Get 5 sharp
                    questions that turn direction into a real plan.
                  </p>
                  <div className="flex items-center gap-1.5 text-[12px] text-accent mt-3 group-hover:gap-2 transition-all">
                    Unlock the full desk
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
                <Link
                  href="/pricing"
                  className="card-premium rounded-lg p-5 hover:bg-bg-elevated transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-accent" />
                    <p className="font-display font-semibold text-[14.5px] text-fg">
                      I have a specific idea
                    </p>
                  </div>
                  <p className="text-[12.5px] text-fg-dim leading-relaxed">
                    &ldquo;I have an idea for X.&rdquo; Get first customer, first offer,
                    first pricing, first revenue path, launch channel.
                  </p>
                  <div className="flex items-center gap-1.5 text-[12px] text-accent mt-3 group-hover:gap-2 transition-all">
                    Unlock the full desk
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 bg-accent text-bg hover:bg-accent-hover font-semibold text-[13px] px-4 py-2.5 rounded-md transition-colors btn-shine"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Run full Ideas Desk
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 px-1">
            <p className="eyebrow text-fg-muted mb-3">What the full Ideas Desk does</p>
            <ul className="space-y-2.5 text-[13.5px] text-fg-dim leading-relaxed">
              <li className="flex gap-2.5">
                <span className="text-signal-pivot mt-0.5">→</span>
                Vague mode: 5 sharp questions (skills, target, problem, budget, speed)
                that move you from &ldquo;thinking about it&rdquo; to a real plan.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-pivot mt-0.5">→</span>
                Specific mode: first customer, first product, first offer, first
                pricing, first revenue path, launch channel.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-pivot mt-0.5">→</span>
                A clear decision output: build this, pivot this, or don&apos;t start
                yet.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-pivot mt-0.5">→</span>
                Co-founder tone: direct, honest, challenging, practical.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-pivot mt-0.5">→</span>
                Downloadable card image and a shareable link.
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AIChatInterface
      feature="ideas"
      title="Ideas Desk"
      description="Develop, stress-test, and find the shortest path to first revenue."
      icon={<Lightbulb className="w-5 h-5" strokeWidth={1.75} />}
      starters={STARTERS}
      accentColor="pivot"
    />
  )
}
