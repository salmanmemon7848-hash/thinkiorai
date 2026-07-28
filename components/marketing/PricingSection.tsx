'use client'

import { Check, X } from 'lucide-react'
import Link from 'next/link'

type PlanFeature = {
  text: string
  locked?: boolean
}

const PLANS: Array<{
  id: string
  name: string
  price: number
  description: string
  features: PlanFeature[]
  cta: string
  href: string
  highlighted: boolean
}> = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'For founders sketching the first idea',
    features: [
      { text: '1 Business Validation (total)' },
      { text: 'Marketing Engine Starter Pack: 3 content packs' },
      { text: '1 Ideas session (total)' },
      { text: '1 Lead Finder preview (total)' },
      { text: '5 AI Chat messages (total)' },
      { text: 'Business Reports — Founder Pro only', locked: true },
      { text: 'English & Hindi support' },
    ],
    cta: 'Start free',
    href: '/signup',
    highlighted: false,
  },
  {
    id: 'builder',
    name: 'Builder',
    price: 299,
    description: 'For founders actively building',
    features: [
      { text: '5 Business Validations / day' },
      { text: 'Marketing Engine: 5 content packs / day' },
      { text: '5 Ideas sessions / day' },
      { text: '5 Lead Finder searches / day' },
      { text: '10 AI Chat messages / day' },
      { text: 'Business Reports — Founder Pro only', locked: true },
      { text: 'All Indian languages' },
      { text: 'Saved reports — unlimited' },
    ],
    cta: 'Start building',
    href: '/signup?plan=builder',
    highlighted: false,
  },
  {
    id: 'founder_pro',
    name: 'Founder Pro',
    price: 599,
    description: 'For founders who move every day',
    features: [
      { text: '10 Business Validations / day' },
      { text: 'Marketing Engine: 10 content packs / day' },
      { text: '10 Ideas sessions / day' },
      { text: '10 Lead Finder searches / day' },
      { text: '15 AI Chat messages / day' },
      { text: '3 Business Reports / day — investor-grade' },
      { text: 'Priority AI — fastest responses' },
      { text: 'Export reports as PDF' },
    ],
    cta: 'Go Founder Pro',
    href: '/signup?plan=founder_pro',
    highlighted: true,
  },
]

export default function PricingSection() {
  return (
    <section className="relative py-24 md:py-32 border-t border-line" id="pricing">
      {/* Subtle accent glow */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-accent/[0.04] to-transparent pointer-events-none" />

      <div className="relative max-w-[1240px] mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="eyebrow mb-4">Pricing</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-fg tracking-tighter leading-[1.02]">
            Simple plans.{' '}
            <span className="font-serif-italic font-normal text-fg-dim">
              No surprises.
            </span>
          </h2>
          <p className="text-lg text-fg-dim mt-6 max-w-2xl leading-relaxed">
            Start free with lifetime taste-tier access. Upgrade when you need
            daily usage or investor-grade reports. No annual lock-in. Cancel
            any time, any plan.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-7 md:p-8 flex flex-col transition-all duration-500 ${
                plan.highlighted
                  ? 'bg-bg-elevated border-2 border-accent shadow-glow-accent'
                  : 'card-premium hover:bg-bg-elevated'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg px-3 py-1 font-mono text-[10px] tracking-caps uppercase font-semibold rounded-full">
                  Most popular
                </div>
              )}

              <div className="mb-7">
                <h3 className="font-display font-semibold text-xl text-fg mb-2 tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-sm text-fg-muted mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-5xl text-fg tabular tracking-tighter">
                    ₹{plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-fg-muted text-sm ml-1">/month</span>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-line mb-7" />

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li
                    key={f.text}
                    className={`flex items-start gap-3 text-[14px] leading-snug ${
                      f.locked ? 'text-fg-muted line-through decoration-fg-muted/40' : 'text-fg'
                    }`}
                  >
                    {f.locked ? (
                      <X
                        className="w-4 h-4 flex-shrink-0 mt-0.5 text-fg-muted/60"
                        strokeWidth={2.25}
                      />
                    ) : (
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? 'text-accent' : 'text-fg-dim'
                        }`}
                        strokeWidth={2.5}
                      />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`btn-shine group w-full text-center font-semibold py-3.5 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? 'bg-accent text-bg hover:bg-accent-hover'
                    : 'bg-bg-elevated border border-line hover:border-line-strong text-fg'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-10">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          <p className="text-sm text-fg-muted">
            Payments via Razorpay · Daily limits reset at midnight IST · Cancel any time
          </p>
        </div>
      </div>
    </section>
  )
}
