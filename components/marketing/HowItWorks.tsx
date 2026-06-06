import { ArrowRight, Clock } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'Describe the idea',
    body: 'Type your idea in plain language. No deck, no formatting. Tell Thinkior what you\'re building and who it\'s for.',
    time: '~30 seconds',
  },
  {
    num: '02',
    title: 'Get India-specific intel',
    body: 'Thinkior analyses real Indian market data — competitors, TAM/SAM/SOM in ₹, regulatory risks, unit economics. In under a minute.',
    time: '~60 seconds',
  },
  {
    num: '03',
    title: 'Take one action',
    body: 'A clear verdict plus the single specific action you can take this week to test the riskiest assumption. No vague advice.',
    time: 'This week',
  },
]

export default function HowItWorks() {
  return (
    <section
      className="relative py-24 md:py-32 border-t border-line"
      id="how-it-works"
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="eyebrow mb-4">How it works</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-fg tracking-tighter leading-[1.02]">
            From idea to{' '}
            <span className="font-serif-italic font-normal text-accent">honest counsel</span>,
            in three steps.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[60px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />

          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="card-premium rounded-xl p-7 md:p-8 relative"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-display font-bold text-5xl text-fg tabular leading-none tracking-tighter">
                  {step.num}
                </span>
                <ArrowRight
                  className={`w-5 h-5 text-fg-muted ${i === 2 ? 'opacity-0' : ''}`}
                />
              </div>
              <h3 className="font-display font-semibold text-xl text-fg leading-snug mb-3 tracking-tight">
                {step.title}
              </h3>
              <p className="text-[14px] text-fg-dim leading-relaxed mb-6">{step.body}</p>
              <div className="flex items-center gap-2 pt-5 border-t border-line">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span className="font-mono text-[11px] uppercase tracking-caps text-fg-muted">
                  {step.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
