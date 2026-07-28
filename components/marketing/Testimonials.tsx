import { Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    quote:
      'I was about to spend ₹3L on an app no one wanted. Thinkior gave me a KILL verdict in 40 seconds with exact reasons. I pivoted. Now I have 12 paying customers.',
    name: 'Arjun Mehta',
    title: 'Founder, B2B SaaS',
    city: 'Pune',
    initials: 'AM',
    metric: { value: '12', label: 'paying customers' },
  },
  {
    quote:
      "I used ChatGPT before. It always said my idea was great. Thinkior told me I had 4 funded competitors I didn't know about. Harsh — but exactly what I needed.",
    name: 'Priya Nambiar',
    title: 'D2C Brand Founder',
    city: 'Bengaluru',
    initials: 'PN',
    metric: { value: '4', label: 'competitors found' },
  },
  {
    quote:
      "The research clarified which conversations we needed next. We stopped guessing and started learning from real prospects.",
    name: 'Rohit Sharma',
    title: 'Founder, FinTech',
    city: 'Indore',
    initials: 'RS',
    metric: { value: '21d', label: 'to term sheet' },
  },
]

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 border-t border-line" id="testimonials">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6">
        {/* Header */}
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="eyebrow mb-4">Founder stories</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-fg tracking-tighter leading-[1.02]">
            What founders{' '}
            <span className="font-serif-italic font-normal text-accent">actually say</span>.
          </h2>
          <p className="text-lg text-fg-dim mt-6 max-w-2xl leading-relaxed">
            From Pune to Indore. First-time founders to second-time builders.
            Unedited.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="card-premium rounded-xl p-7 flex flex-col"
            >
              <Quote className="w-6 h-6 text-accent/40 mb-5" />
              <p className="text-[15px] text-fg leading-relaxed flex-1 mb-7">
                {t.quote}
              </p>

              {/* Metric chip */}
              <div className="mb-6 inline-flex items-baseline gap-2 self-start bg-bg-sub border border-line rounded-md px-3 py-1.5">
                <span className="font-display font-bold text-lg text-accent tabular">{t.metric.value}</span>
                <span className="text-xs text-fg-muted">{t.metric.label}</span>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-line">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-signal-insight flex items-center justify-center font-display font-bold text-sm text-bg">
                  {t.initials}
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-sm text-fg leading-tight">{t.name}</p>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {t.title} · {t.city}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
