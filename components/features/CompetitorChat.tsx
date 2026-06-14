'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUsage } from '@/hooks/useUsage'
import AIChatInterface from './AIChatInterface'
import CompetitorTeaser from './competitor/CompetitorTeaser'

const STARTERS = [
  'Who are the real competitors for a mental health app for Indian college students?',
  'Research the Indian EdTech market for skill-based short courses',
  'Find competitors for a FinTech app helping unorganised sector workers get credit',
  'Map the D2C beauty market in India — who are the players and what are they missing?',
]

/**
 * Competitor Intel chat.
 *
 * Freemium model:
 *   - Free plan users get 1 full Competitor run. After that, the
 *     full chat is replaced by the CompetitorTeaser.
 *   - Paid plans get the full chat with no teaser gate.
 *   - Unauthed visitors see the teaser directly.
 */
export default function CompetitorChat() {
  const { usage, loading } = useUsage('competitor')
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
        feature="competitor"
        title="Competitor Intel"
        description="Map your battlefield — Indian competitors, weaknesses, and white space."
        icon={<Search className="w-5 h-5" strokeWidth={1.75} />}
        starters={STARTERS}
        accentColor="insight"
      />
    )
  }

  const showTeaser = !isAuthed || (usage?.exceeded ?? false)

  if (showTeaser) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] animate-fade-in">
        <header className="pb-5 mb-5 border-b border-line flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-signal-insight/[0.12] border-signal-insight/30 text-signal-insight">
              <Search className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-fg leading-tight tracking-tight">
                Competitor Intel
              </h1>
              <p className="text-sm text-fg-dim mt-0.5 max-w-2xl">
                Map your battlefield — leader, niche players, weak incumbents, unmet
                demand, pricing gaps, real complaints, and your exact positioning.
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-1">
          <CompetitorTeaser />

          <div className="mt-6 px-1">
            <p className="eyebrow text-fg-muted mb-3">What the full Competitor Intel gives you</p>
            <ul className="space-y-2.5 text-[13.5px] text-fg-dim leading-relaxed">
              <li className="flex gap-2.5">
                <span className="text-signal-insight mt-0.5">→</span>
                Battlefield map: leader, niche players, weak incumbents, unmet demand.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-insight mt-0.5">→</span>
                Real Indian competitors with funding, weaknesses, and why they matter
                to you.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-insight mt-0.5">→</span>
                Pricing landscape and the open price band nobody is serving.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-insight mt-0.5">→</span>
                Real customer complaint patterns (Play Store, Reddit, Twitter, G2).
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-insight mt-0.5">→</span>
                Positioning guidance: where to compete, where not to, what angle to own,
                first audience to chase.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-insight mt-0.5">→</span>
                Downloadable battlefield image and a shareable link.
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AIChatInterface
      feature="competitor"
      title="Competitor Intel"
      description="Map your battlefield — Indian competitors, weaknesses, and white space."
      icon={<Search className="w-5 h-5" strokeWidth={1.75} />}
      starters={STARTERS}
      accentColor="insight"
    />
  )
}
