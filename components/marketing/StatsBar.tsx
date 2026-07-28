const SIGNALS = [
  'Validate', 'Evidence', 'Customer interviews', 'Positioning', 'Experiments',
  'Competitor research', 'Pricing tests', 'First channel', 'Weekly review', 'Learn faster',
]

const PRINCIPLES = [
  { value: 'Evidence-led', label: 'research with visible sources' },
  { value: 'Country-aware', label: 'guidance for your launch market' },
  { value: 'Founder-led', label: 'you make and execute decisions' },
  { value: 'Weekly', label: 'review learning and choose the next move' },
]

export default function StatsBar() {
  return (
    <section className="relative border-t border-b border-line">
      <div className="border-b border-line bg-bg-sub overflow-hidden">
        <div className="marquee py-2.5">
          <div className="marquee-inner gap-12 pr-12">
            {[...SIGNALS, ...SIGNALS].map((signal, index) => (
              <span key={index} className="font-mono text-[11px] tracking-caps uppercase text-fg-muted flex items-center gap-12 whitespace-nowrap">
                <span>{signal}</span><span className="text-accent">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0">
          {PRINCIPLES.map((item, index) => (
            <div key={item.value} className={`px-4 ${index !== 0 ? 'md:border-l border-line' : ''}`}>
              <div className="font-display font-semibold text-[clamp(1.3rem,3vw,2rem)] text-fg leading-none tracking-tight mb-2">{item.value}</div>
              <div className="text-[13px] text-fg-muted">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
