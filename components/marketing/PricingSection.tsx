'use client'

import { Check } from 'lucide-react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'For founders sketching the first idea',
    features: [
      '2 Business Validations / day',
      '1 Competitor Research / day',
      '3 Ideas sessions / day',
      '1 Pitch Evaluation / day',
      '10 AI Chat messages / day',
      'English & Hindi support',
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
      '10 Business Validations / day',
      '5 Competitor Research / day',
      '15 Ideas sessions / day',
      '5 Pitch Evaluations / day',
      '30 AI Chat messages / day',
      'All Indian languages',
      'Saved reports — unlimited',
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
      '30 Business Validations / day',
      '20 Competitor Research / day',
      '50 Ideas sessions / day',
      '20 Pitch Evaluations / day',
      '100 AI Chat messages / day',
      'Priority AI — fastest responses',
      'Export reports as PDF',
      'Early access to new features',
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
            Start free. Upgrade when you need more queries. No annual lock-in.
            Cancel any time, any plan.
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
                  <li key={f} className="flex items-start gap-3 text-[14px] text-fg leading-snug">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-accent' : 'text-fg-dim'
                      }`}
                      strokeWidth={2.5}
                    />
                    {f}
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
            All payments via Razorpay · Cancel any time · All sales final
          </p>
        </div>
      </div>
    </section>
  )
}
