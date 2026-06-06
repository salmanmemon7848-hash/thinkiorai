'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const FAQS = [
  {
    q: 'How is Thinkior different from ChatGPT?',
    a: "ChatGPT doesn't know GST, doesn't know which Indian startups are your real competitors, and doesn't know why your ₹299/month price breaks at unit economics. Thinkior is built specifically for the Indian market — with deep context on Indian regulation, competitors, pricing, and investors. It tells you the truth even when it hurts.",
  },
  {
    q: 'What does GO / KILL / PIVOT actually mean?',
    a: "GO means the idea has real signal — pursue it with the specific actions Thinkior gives you. KILL means the market or economics make it unviable in its current form — stop before you waste more time. PIVOT means the core pain is real but your approach needs to change — and Thinkior tells you exactly how.",
  },
  {
    q: 'Does Thinkior work for non-tech startups?',
    a: "Yes. Thinkior covers all Indian startup types: D2C, food, services, manufacturing, AgriTech, HealthTech, retail, and more. You don't need a tech background. If you're building any kind of business in India, Thinkior is for you.",
  },
  {
    q: 'Can I use Thinkior in Hindi or regional languages?',
    a: 'Yes. Thinkior auto-detects your language and responds in Hindi, Hinglish, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, or Punjabi. Write in whatever feels natural.',
  },
  {
    q: 'Is my startup idea data safe?',
    a: 'Your conversations are private and tied to your account. We do not use your startup ideas to train AI models or share them with third parties. Full details in our Privacy Policy.',
  },
  {
    q: 'What if I hit my daily limit?',
    a: 'Usage resets every day at midnight IST. If you need more, upgrading from Free to Builder (₹299/mo) or Founder Pro (₹599/mo) gives you significantly higher limits. Upgrade or cancel any time.',
  },
  {
    q: 'Do you offer refunds?',
    a: "If you're not satisfied within the first 7 days of a paid plan, email hello@thinkior.com and we'll refund you — no questions asked.",
  },
  {
    q: 'Is this only for first-time founders?',
    a: 'No. Thinkior is useful at every stage from "I have an idea" to "I\'m raising a Series A." First-time founders use it to validate before building. Experienced founders use it for competitor intelligence and pitch prep.',
  },
]

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="relative py-24 md:py-32 border-t border-line" id="faq">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left header */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow mb-4">FAQ</p>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-fg tracking-tighter leading-[1.02]">
              Frequently{' '}
              <span className="font-serif-italic font-normal text-accent">asked</span>.
            </h2>
            <p className="text-base text-fg-dim mt-6 leading-relaxed max-w-md">
              Don&apos;t see your question?{' '}
              <a
                href="mailto:hello@thinkior.com"
                className="text-accent border-b border-accent/30 hover:border-accent transition-colors"
              >
                Email us
              </a>
              .
            </p>
          </div>

          {/* Accordion */}
          <div className="lg:col-span-7">
            <div className="border-t border-line">
              {FAQS.map((faq, i) => (
                <div key={i} className="border-b border-line">
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between gap-6 py-5 text-left group"
                  >
                    <span className="font-display font-medium text-base md:text-lg text-fg leading-snug group-hover:text-accent transition-colors">
                      {faq.q}
                    </span>
                    <span className="flex-shrink-0 w-8 h-8 rounded-md border border-line group-hover:border-accent group-hover:bg-accent/10 flex items-center justify-center text-fg-dim group-hover:text-accent transition-colors">
                      {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  <div
                    className={cn(
                      'grid transition-all duration-500 ease-out',
                      open === i ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]'
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[15px] text-fg-dim leading-relaxed max-w-2xl">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
