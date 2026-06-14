'use client'

/**
 * THINKIOR — DASHBOARD HERO
 * ─────────────────────────────────────────────────────────────────
 * The greeting block. Contextual by tone:
 *   - fresh:    brand-new founder, show the best first move
 *   - returning: 1-2 things run, show what they have and what is next
 *   - active:   3-4 things run, acknowledge momentum
 *   - veteran:  everything run, position reports as the next move
 *
 * Premium, balanced, not too tall. Renders a primary + secondary CTA.
 * ─────────────────────────────────────────────────────────────────
 */

import Link from 'next/link'
import { Sparkles, ArrowRight, Calendar, Zap, Award, Compass } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { GreetingTone } from '@/lib/dashboard/summary'
import PlanBadge from '@/components/shared/PlanBadge'
import type { Plan } from '@/types'

const TONE_META: Record<
  GreetingTone,
  { badge: string; icon: typeof Sparkles; eyebrow: string }
> = {
  fresh: { badge: 'Day 1', icon: Sparkles, eyebrow: 'Welcome to Thinkior' },
  returning: { badge: 'Pick up', icon: Compass, eyebrow: 'Welcome back' },
  active: { badge: 'In motion', icon: Zap, eyebrow: 'You&apos;re building' },
  veteran: { badge: 'Top tier', icon: Award, eyebrow: 'Founder OS' },
}

export interface DashboardHeroProps {
  firstName: string
  greeting: string
  tone: GreetingTone
  headline: string
  sub: string
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
  plan: Plan
}

export default function DashboardHero({
  firstName,
  greeting,
  tone,
  headline,
  sub,
  primary,
  secondary,
  plan,
}: DashboardHeroProps) {
  const meta = TONE_META[tone]
  const Icon = meta.icon

  return (
    <section className="card-premium rounded-2xl relative overflow-hidden">
      <div className="mesh-bg" aria-hidden="true" />
      <div className="relative z-10 px-6 sm:px-8 lg:px-10 py-8 sm:py-9">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-accent/30 bg-accent/[0.08] text-accent text-[10.5px] font-mono uppercase tracking-caps font-semibold">
              <Icon className="w-3 h-3" strokeWidth={2.25} />
              {meta.badge}
            </span>
            <span className="eyebrow text-fg-muted">{meta.eyebrow}</span>
          </div>
          <PlanBadge plan={plan} />
        </div>

        <div className="mt-5 max-w-3xl">
          <p className="text-[13px] text-fg-muted mb-2">
            {greeting},{' '}
            <span className="text-fg font-medium">{firstName}</span>
          </p>
          <h1
            className="font-display font-bold text-fg tracking-tighterest leading-[1.05] text-[clamp(1.75rem,3.6vw,2.5rem)]"
            dangerouslySetInnerHTML={{
              __html: headline.replace(/&apos;/g, '’'),
            }}
          />
          <p
            className="text-[14.5px] text-fg-dim leading-relaxed mt-3 max-w-2xl"
            dangerouslySetInnerHTML={{ __html: sub.replace(/&apos;/g, '’') }}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <Link
            href={primary.href}
            className="inline-flex items-center gap-1.5 bg-accent text-bg hover:bg-accent-hover font-semibold text-[13.5px] px-4 py-2.5 rounded-md transition-colors btn-shine"
          >
            {primary.label}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
          </Link>
          <Link
            href={secondary.href}
            className="inline-flex items-center gap-1.5 border border-line hover:border-line-strong text-fg-dim hover:text-fg text-[13px] font-medium px-3.5 py-2.5 rounded-md transition-colors"
          >
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  )
}
