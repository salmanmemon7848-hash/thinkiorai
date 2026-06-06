const STATS = [
  { value: '2,847', label: 'Ideas validated' },
  { value: '1,832', label: 'Indian founders' },
  { value: '47', label: 'Cities represented' },
  { value: '₹12.4 Cr', label: 'Saved on wrong builds' },
]

const ROTATING = [
  'GO',
  'KILL',
  'PIVOT',
  'TAM ₹4,200 Cr',
  'D2C',
  'B2B SaaS',
  'AgriTech',
  'HealthTech',
  'FinTech',
  'EdTech',
  'Tier-2',
  'Bharat',
  'White space',
  'Unit economics',
  'Burn rate',
  'CAC < ₹500',
]

export default function StatsBar() {
  return (
    <section className="relative border-t border-b border-line">
      {/* Top ticker */}
      <div className="border-b border-line bg-bg-sub overflow-hidden">
        <div className="marquee py-2.5">
          <div className="marquee-inner gap-12 pr-12">
            {[...ROTATING, ...ROTATING].map((t, i) => (
              <span
                key={i}
                className="font-mono text-[11px] tracking-caps uppercase text-fg-muted flex items-center gap-12 whitespace-nowrap"
              >
                <span>{t}</span>
                <span className="text-accent">◆</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`px-4 ${i !== 0 ? 'md:border-l border-line' : ''}`}
            >
              <div className="font-display font-semibold text-[clamp(1.875rem,4vw,2.5rem)] text-fg tabular leading-none tracking-tighter mb-2">
                {s.value}
              </div>
              <div className="text-[13px] text-fg-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
