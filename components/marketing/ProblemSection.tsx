import { Clock, Eye, Bot } from 'lucide-react'

const PROBLEMS = [
  {
    icon: Clock,
    headline: 'Three months. Zero validation.',
    body: 'You built the product first. Then talked to users. Then found out nobody wanted it. ₹2L and 90 days — gone.',
    metric: '₹2L lost',
    metricLabel: 'avg. waste before validation',
  },
  {
    icon: Eye,
    headline: 'You didn\'t know who you were fighting.',
    body: 'You googled it. Found 3 American companies. Missed the 7 Indian startups already in your space — two just raised a Series A.',
    metric: '7 missed',
    metricLabel: 'Indian competitors per idea',
  },
  {
    icon: Bot,
    headline: 'ChatGPT said it was a great idea.',
    body: 'Of course it did. It says everything is great. It doesn\'t know GST, Tier-2 unit economics, or why ₹299/mo will break your first cohort.',
    metric: '0 of 10',
    metricLabel: 'India-specific signals from ChatGPT',
  },
]

export default function ProblemSection() {
  return (
    <section className="relative py-24 md:py-32" id="problem">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="eyebrow mb-4">The problem</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-fg tracking-tighter leading-[1.02]">
            You&apos;re building{' '}
            <span className="font-serif-italic font-normal text-signal-rose">blind</span>.
          </h2>
          <p className="text-lg text-fg-dim mt-6 max-w-2xl leading-relaxed">
            Every Indian founder has lived through at least one of these mistakes.
            Most have lived through all three. The real cost isn&apos;t money —
            it&apos;s the months you can&apos;t get back.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {PROBLEMS.map((p) => {
            const Icon = p.icon
            return (
              <article
                key={p.headline}
                className="card-premium rounded-xl p-7 group transition-all duration-500 hover:bg-bg-elevated"
              >
                <div className="w-10 h-10 rounded-lg bg-signal-rose/10 border border-signal-rose/25 flex items-center justify-center mb-6">
                  <Icon className="w-4.5 h-4.5 text-signal-rose" />
                </div>
                <h3 className="font-display font-semibold text-xl text-fg leading-snug mb-3 tracking-tight">
                  {p.headline}
                </h3>
                <p className="text-[14px] text-fg-dim leading-relaxed mb-7">{p.body}</p>
                <div className="pt-5 border-t border-line flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-caps text-fg-muted font-mono">
                    {p.metricLabel}
                  </span>
                  <span className="font-mono font-semibold text-base text-signal-rose tabular">
                    {p.metric}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
