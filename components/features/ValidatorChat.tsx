'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUsage } from '@/hooks/useUsage'
import AIChatInterface from './AIChatInterface'
import ValidatorFastPreview from './validator/FastPreview'

const STARTERS = [
  'Validate my idea: a B2B SaaS for managing GST compliance for Indian MSMEs',
  'I want to build a D2C protein supplement brand for Tier-2 city gym-goers',
  'Should I build a hyperlocal services marketplace for domestic workers in Bangalore?',
  'My idea: an AI tutor for vernacular-medium students in Class 9-12. Is there a market?',
]

/**
 * Business Validator chat.
 *
 * Freemium model:
 *   - Free plan users get 1 full Validator run. After that, the
 *     full chat is replaced by the FastPreview teaser which lets
 *     them keep getting value from the brand but converts them
 *     toward the paid plan for the real engine.
 *   - Paid plans get the full chat with no preview gate.
 *   - Unauthenticated visitors (no Supabase session) see the
 *     FastPreview directly — fastest path to a taste.
 */
export default function ValidatorChat() {
  const { usage, loading } = useUsage('validator')
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

  // Loading / pre-session: render the chat shell so the layout
  // doesn't pop. The `usage` query will resolve quickly.
  if (!sessionReady || loading) {
    return (
      <AIChatInterface
        feature="validator"
        title="Business Validator"
        description="A brutal GO / KILL / PIVOT verdict on your startup idea."
        icon={<CheckCircle2 className="w-5 h-5" strokeWidth={1.75} />}
        starters={STARTERS}
        accentColor="accent"
      />
    )
  }

  // Unauthed visitor OR free user who has used their 1 run
  // → show FastPreview (a strong upsell to the full Validator)
  const showPreview = !isAuthed || (usage?.exceeded ?? false)

  if (showPreview) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] animate-fade-in">
        <header className="pb-5 mb-5 border-b border-line flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-accent/[0.12] border-accent/30 text-accent">
              <CheckCircle2 className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-fg leading-tight tracking-tight">
                Business Validator
              </h1>
              <p className="text-sm text-fg-dim mt-0.5 max-w-2xl">
                A brutal GO / KILL / PIVOT verdict on your startup idea. India-specific.
                Investor-grade.
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-1">
          <ValidatorFastPreview />

          <div className="mt-6 px-1">
            <p className="eyebrow text-fg-muted mb-3">What the full Validator does</p>
            <ul className="space-y-2.5 text-[13.5px] text-fg-dim leading-relaxed">
              <li className="flex gap-2.5">
                <span className="text-accent mt-0.5">→</span>
                Startup score out of 100, broken into market, competition, execution,
                monetization, and risk.
              </li>
              <li className="flex gap-2.5">
                <span className="text-accent mt-0.5">→</span>
                India-specific TAM / SAM / SOM with realistic unit economics at Indian
                price points.
              </li>
              <li className="flex gap-2.5">
                <span className="text-accent mt-0.5">→</span>
                Regulatory watch (RBI, FSSAI, CDSCO, DPDP) only when relevant.
              </li>
              <li className="flex gap-2.5">
                <span className="text-accent mt-0.5">→</span>
                KILL → PIVOT → GO escalation ladder, so the verdict is always actionable.
              </li>
              <li className="flex gap-2.5">
                <span className="text-accent mt-0.5">→</span>
                7-day action plan, first customer, and first revenue path.
              </li>
              <li className="flex gap-2.5">
                <span className="text-accent mt-0.5">→</span>
                Downloadable scorecard image and a shareable link.
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Authed + under quota → full chat
  return (
    <AIChatInterface
      feature="validator"
      title="Business Validator"
      description="A brutal GO / KILL / PIVOT verdict on your startup idea."
      icon={<CheckCircle2 className="w-5 h-5" strokeWidth={1.75} />}
      starters={STARTERS}
      accentColor="accent"
    />
  )
}
