'use client'

import { useRef, useState } from 'react'
import {
  Download,
  Loader2,
  Zap,
  Building2,
  BarChart3,
  Search,
  Scale,
  Megaphone,
  TrendingUp,
  Wallet,
  Target,
  CheckSquare,
  Map,
  AlertTriangle,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type AnyObj = Record<string, unknown>

function arr<T = string>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}
function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}
function obj(v: unknown): AnyObj {
  return v && typeof v === 'object' ? (v as AnyObj) : {}
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <section className="px-6 sm:px-10 py-10 border-b border-line">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-md bg-accent/[0.08] border border-accent/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-accent" strokeWidth={1.75} />
        </div>
        <h2 className="font-display font-semibold text-xl text-fg tracking-tighter">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Bullets({ items, dotColor = 'accent' }: { items: string[]; dotColor?: string }) {
  if (!items.length) return null
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[14px] text-fg-dim leading-relaxed">
          <span
            className="w-1 h-1 rounded-full flex-shrink-0 mt-2.5"
            style={{ background: `var(--${dotColor})` }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card-premium rounded-lg p-4">
      <p className="eyebrow text-fg-muted mb-2">{label}</p>
      <p
        className="font-display font-semibold text-[15px] text-fg leading-tight tracking-tight"
        style={accent ? { color: `var(--${accent})` } : undefined}
      >
        {value || '—'}
      </p>
    </div>
  )
}

function Pill({ children, tone = 'default' }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    default: 'bg-bg-card text-fg-dim border-line',
    accent: 'bg-accent/[0.08] text-accent border-accent/30',
    rose: 'bg-signal-rose/[0.08] text-signal-rose border-signal-rose/30',
    pivot: 'bg-signal-pivot/[0.08] text-signal-pivot border-signal-pivot/30',
    insight: 'bg-signal-insight/[0.08] text-signal-insight border-signal-insight/30',
    violet: 'bg-signal-violet/[0.08] text-signal-violet border-signal-violet/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-caps border',
        tones[tone] || tones.default
      )}
    >
      {children}
    </span>
  )
}

function priorityTone(p?: string) {
  const x = (p || '').toLowerCase()
  if (x.includes('high')) return 'rose'
  if (x.includes('medium')) return 'pivot'
  return 'default'
}

function verdictTone(v?: string) {
  const x = (v || '').toLowerCase()
  if (x.includes('strong')) return 'accent'
  if (x.includes('risk')) return 'rose'
  return 'pivot'
}

export default function ReportViewer({ report }: { report: AnyObj }) {
  const ref = useRef<HTMLDivElement>(null)
  const [dl, setDl] = useState(false)

  const meta = obj(report.meta)
  const es = obj(report.executive_summary)
  const bo = obj(report.business_overview)
  const ma = obj(report.market_analysis)
  const ca = obj(report.competitor_analysis)
  const sw = obj(report.swot_analysis)
  const ms = obj(report.marketing_strategy)
  const gs = obj(report.growth_strategy)
  const fa = obj(report.financial_analysis)
  const km = obj(report.kpis_and_metrics)
  const ap = obj(report.action_plan)
  const rm = obj(report.roadmap)
  const ri = arr<AnyObj>(report.risks_and_mitigation)
  const rc = obj(report.recommendations)

  async function downloadPDF() {
    if (!ref.current) return
    setDl(true)
    try {
      const mod = await import('html2pdf.js')
      const html2pdf = mod.default ?? mod
      const opts: Record<string, unknown> = {
        margin: [8, 8, 8, 8],
        filename: `${str(meta.business_name) || 'Business'}_Report_Thinkior.pdf`,
        image: { type: 'jpeg', quality: 0.97 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#0A0A0B' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }
      await html2pdf().set(opts).from(ref.current).save()
    } catch {
      // PDF generation failed silently — user can retry
    } finally {
      setDl(false)
    }
  }

  const ma_size = obj(ma.market_size)
  const tc = obj(ma.target_customer)
  const ue = obj(fa.unit_economics)

  return (
    <div className="animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="font-display font-bold text-2xl text-fg tracking-tighter truncate">
            {str(meta.business_name) || 'Business Report'}
          </h1>
          <p className="text-[13px] text-fg-muted mt-1">
            {str(meta.report_type)} · Thinkior AI
          </p>
        </div>
        <button
          onClick={downloadPDF}
          disabled={dl}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent text-bg text-[13px] font-semibold hover:bg-accent-hover disabled:opacity-60 transition-colors btn-shine"
        >
          {dl ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" strokeWidth={2.25} /> Download PDF
            </>
          )}
        </button>
      </div>

      <div ref={ref} className="card-premium rounded-2xl overflow-hidden">
        {/* Cover */}
        <div className="relative px-6 sm:px-10 py-14 border-b border-line overflow-hidden">
          <div className="mesh-bg" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <Pill tone="accent">Thinkior AI</Pill>
              <Pill>{str(meta.report_type) || 'Business Report'}</Pill>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-fg tracking-tightest leading-[1.05] mb-3">
              {str(meta.business_name) || 'Your Business'}
            </h1>
            {str(meta.executive_tagline) && (
              <p className="font-serif-italic text-xl text-fg-dim max-w-2xl leading-snug">
                {str(meta.executive_tagline)}
              </p>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-8 text-[12px] text-fg-muted font-mono">
              <span>INDUSTRY · {str(meta.industry)}</span>
              <span>STAGE · {str(meta.stage)}</span>
              <span>
                DATE ·{' '}
                {new Date(str(meta.generated_at) || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <Section title="Executive Summary" icon={Zap}>
          <p className="text-[14px] text-fg-dim leading-relaxed mb-6 whitespace-pre-line">
            {str(es.overview)}
          </p>
          {arr<string>(es.key_highlights).length > 0 && (
            <div className="card-premium rounded-lg p-5 mb-5">
              <p className="eyebrow text-accent mb-3">Key highlights</p>
              <Bullets items={arr<string>(es.key_highlights)} dotColor="accent" />
            </div>
          )}
          {str(es.verdict) && (
            <div
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border',
                verdictTone(str(es.verdict)) === 'accent' && 'bg-accent/[0.06] border-accent/30',
                verdictTone(str(es.verdict)) === 'rose' && 'bg-signal-rose/[0.06] border-signal-rose/30',
                verdictTone(str(es.verdict)) === 'pivot' && 'bg-signal-pivot/[0.06] border-signal-pivot/30'
              )}
            >
              <Pill tone={verdictTone(str(es.verdict))}>Verdict</Pill>
              <p className="text-[14px] text-fg leading-relaxed flex-1">{str(es.verdict)}</p>
            </div>
          )}
        </Section>

        {/* Business Overview */}
        <Section title="Business Overview" icon={Building2}>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <Stat label="Mission" value={str(bo.mission)} />
            <Stat label="Vision" value={str(bo.vision)} />
            <Stat label="Business model" value={str(bo.business_model)} />
            <Stat label="Value proposition" value={str(bo.value_proposition)} />
          </div>
          {str(bo.description) && (
            <p className="text-[14px] text-fg-dim leading-relaxed mb-5">{str(bo.description)}</p>
          )}
          {arr<string>(bo.revenue_streams).length > 0 && (
            <div>
              <p className="eyebrow text-fg-muted mb-2">Revenue streams</p>
              <div className="flex flex-wrap gap-2">
                {arr<string>(bo.revenue_streams).map((r, i) => (
                  <Pill key={i} tone="insight">
                    {r}
                  </Pill>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Market Analysis */}
        <Section title="Market Analysis" icon={BarChart3}>
          <p className="text-[14px] text-fg-dim leading-relaxed mb-6">{str(ma.market_overview)}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <Stat label="TAM" value={str(ma_size.tam)} accent="accent" />
            <Stat label="SAM" value={str(ma_size.sam)} accent="signal-insight" />
            <Stat label="SOM" value={str(ma_size.som)} accent="signal-violet" />
            <Stat label="Growth rate" value={str(ma_size.growth_rate)} accent="signal-pivot" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-accent mb-3">Trends</p>
              <Bullets items={arr<string>(ma.market_trends)} dotColor="accent" />
            </div>
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-signal-insight mb-3">Drivers</p>
              <Bullets items={arr<string>(ma.market_drivers)} dotColor="signal-insight" />
            </div>
          </div>
          <div className="card-premium rounded-lg p-5 mb-4">
            <p className="eyebrow text-signal-rose mb-3">Headwinds</p>
            <Bullets items={arr<string>(ma.market_challenges)} dotColor="signal-rose" />
          </div>
          <div className="card-premium rounded-lg p-5">
            <p className="eyebrow text-signal-violet mb-4">Target customer</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[11px] text-fg-muted font-mono mb-1">PRIMARY</p>
                <p className="text-[13px] text-fg leading-relaxed">{str(tc.primary_segment)}</p>
              </div>
              <div>
                <p className="text-[11px] text-fg-muted font-mono mb-1">SECONDARY</p>
                <p className="text-[13px] text-fg leading-relaxed">{str(tc.secondary_segment)}</p>
              </div>
            </div>
            {arr<string>(tc.customer_pain_points).length > 0 && (
              <>
                <p className="text-[11px] text-fg-muted font-mono mb-2 mt-2">PAIN POINTS</p>
                <Bullets items={arr<string>(tc.customer_pain_points)} dotColor="signal-violet" />
              </>
            )}
            {str(tc.buying_behavior) && (
              <p className="text-[13px] text-fg-dim leading-relaxed mt-3">{str(tc.buying_behavior)}</p>
            )}
          </div>
        </Section>

        {/* Competitor Analysis */}
        <Section title="Competitor Analysis" icon={Search}>
          <p className="text-[14px] text-fg-dim leading-relaxed mb-5">{str(ca.landscape_overview)}</p>
          <div className="space-y-3 mb-5">
            {arr<AnyObj>(ca.competitors).map((c, i) => (
              <div key={i} className="card-premium rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-display font-semibold text-[14px] text-fg">
                    {str(c.name)}
                  </span>
                  <Pill tone={str(c.type) === 'Direct' ? 'rose' : 'insight'}>{str(c.type)}</Pill>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-accent font-mono mb-1.5">STRENGTHS</p>
                    <Bullets items={arr<string>(c.strengths)} dotColor="accent" />
                  </div>
                  <div>
                    <p className="text-[11px] text-signal-rose font-mono mb-1.5">WEAKNESSES</p>
                    <Bullets items={arr<string>(c.weaknesses)} dotColor="signal-rose" />
                  </div>
                </div>
                {str(c.market_position) && (
                  <p className="text-[13px] text-fg-muted mt-3 italic">{str(c.market_position)}</p>
                )}
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-accent mb-3">Our advantages</p>
              <Bullets items={arr<string>(ca.competitive_advantages)} dotColor="accent" />
            </div>
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-signal-pivot mb-3">Competitive risks</p>
              <Bullets items={arr<string>(ca.competitive_risks)} dotColor="signal-pivot" />
            </div>
          </div>
          {str(ca.market_gap) && (
            <div className="card-premium rounded-lg p-5 border-accent/30 bg-accent/[0.04]">
              <p className="eyebrow text-accent mb-2">Market gap we fill</p>
              <p className="text-[14px] text-fg leading-relaxed">{str(ca.market_gap)}</p>
            </div>
          )}
        </Section>

        {/* SWOT */}
        <Section title="SWOT Analysis" icon={Scale}>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Strengths', items: arr<string>(sw.strengths), tone: 'accent' },
              { title: 'Weaknesses', items: arr<string>(sw.weaknesses), tone: 'rose' },
              { title: 'Opportunities', items: arr<string>(sw.opportunities), tone: 'insight' },
              { title: 'Threats', items: arr<string>(sw.threats), tone: 'pivot' },
            ].map((s) => (
              <div key={s.title} className="card-premium rounded-lg p-5">
                <div className="mb-3">
                  <Pill tone={s.tone}>{s.title}</Pill>
                </div>
                <Bullets
                  items={s.items}
                  dotColor={
                    s.tone === 'accent'
                      ? 'accent'
                      : s.tone === 'rose'
                      ? 'signal-rose'
                      : s.tone === 'insight'
                      ? 'signal-insight'
                      : 'signal-pivot'
                  }
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Marketing Strategy */}
        <Section title="Marketing Strategy" icon={Megaphone}>
          {str(ms.positioning_statement) && (
            <div className="card-premium rounded-lg p-5 mb-5 border-accent/30 bg-accent/[0.04]">
              <p className="eyebrow text-accent mb-2">Positioning</p>
              <p className="font-serif-italic text-lg text-fg leading-snug">
                &ldquo;{str(ms.positioning_statement)}&rdquo;
              </p>
            </div>
          )}
          {str(ms.go_to_market) && (
            <p className="text-[14px] text-fg-dim leading-relaxed mb-5">{str(ms.go_to_market)}</p>
          )}
          <div className="space-y-3 mb-5">
            {arr<AnyObj>(ms.channels).map((ch, i) => (
              <div key={i} className="card-premium rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-semibold text-[14px] text-fg">
                    {str(ch.channel)}
                  </span>
                  <Pill tone={priorityTone(str(ch.priority))}>{str(ch.priority)} priority</Pill>
                </div>
                {str(ch.rationale) && (
                  <p className="text-[13px] text-fg-muted mb-2">{str(ch.rationale)}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {arr<string>(ch.tactics).map((t, j) => (
                    <Pill key={j}>{t}</Pill>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-signal-insight mb-3">Growth loops</p>
              <Bullets items={arr<string>(ms.growth_loops)} dotColor="signal-insight" />
            </div>
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-signal-violet mb-2">Customer acquisition</p>
              <p className="text-[13px] text-fg-dim leading-relaxed">{str(ms.customer_acquisition)}</p>
            </div>
          </div>
          {str(ms.retention_strategy) && (
            <div className="card-premium rounded-lg p-5 mt-4">
              <p className="eyebrow text-accent mb-2">Retention</p>
              <p className="text-[13px] text-fg-dim leading-relaxed">{str(ms.retention_strategy)}</p>
            </div>
          )}
        </Section>

        {/* Growth Strategy */}
        <Section title="Growth Strategy" icon={TrendingUp}>
          <div className="grid sm:grid-cols-3 gap-3 mb-5">
            {[
              { title: 'Next 90 days', items: arr<string>(gs.short_term_wins), tone: 'accent' },
              { title: 'Months 4–12', items: arr<string>(gs.medium_term_goals), tone: 'insight' },
              { title: 'Year 1–3', items: arr<string>(gs.long_term_vision), tone: 'violet' },
            ].map((t) => (
              <div key={t.title} className="card-premium rounded-lg p-5">
                <div className="mb-3">
                  <Pill tone={t.tone}>{t.title}</Pill>
                </div>
                <Bullets
                  items={t.items}
                  dotColor={
                    t.tone === 'accent'
                      ? 'accent'
                      : t.tone === 'insight'
                      ? 'signal-insight'
                      : 'signal-violet'
                  }
                />
              </div>
            ))}
          </div>
          <div className="card-premium rounded-lg p-5">
            <p className="eyebrow text-accent mb-3">Top growth levers</p>
            <Bullets items={arr<string>(gs.growth_levers)} dotColor="accent" />
          </div>
        </Section>

        {/* Financial Analysis */}
        <Section title="Financial Analysis" icon={Wallet}>
          {str(fa.revenue_model_assessment) && (
            <p className="text-[14px] text-fg-dim leading-relaxed mb-5">
              {str(fa.revenue_model_assessment)}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Stat label="CAC" value={str(ue.cac_estimate)} accent="signal-insight" />
            <Stat label="LTV" value={str(ue.ltv_estimate)} accent="accent" />
            <Stat label="LTV:CAC" value={str(ue.ltv_cac_ratio)} accent="signal-violet" />
            <Stat label="Payback" value={str(ue.payback_period)} accent="signal-pivot" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-signal-insight mb-2">Funding assessment</p>
              <p className="text-[13px] text-fg-dim leading-relaxed">{str(fa.funding_assessment)}</p>
            </div>
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-signal-rose mb-3">Financial risks</p>
              <Bullets items={arr<string>(fa.key_financial_risks)} dotColor="signal-rose" />
            </div>
          </div>
          {str(fa.financial_projections_narrative) && (
            <div className="card-premium rounded-lg p-5 mt-4">
              <p className="eyebrow text-accent mb-2">Projections</p>
              <p className="text-[13px] text-fg-dim leading-relaxed">
                {str(fa.financial_projections_narrative)}
              </p>
            </div>
          )}
        </Section>

        {/* KPIs */}
        <Section title="KPIs & Metrics" icon={Target}>
          {str(km.north_star_metric) && (
            <div className="card-premium rounded-lg p-5 mb-5 border-accent/40 bg-accent/[0.05]">
              <p className="eyebrow text-accent mb-2">North star metric</p>
              <p className="font-display font-bold text-2xl text-fg tracking-tight">
                {str(km.north_star_metric)}
              </p>
            </div>
          )}
          <div className="space-y-3 mb-5">
            {arr<AnyObj>(km.primary_kpis).map((k, i) => (
              <div key={i} className="card-premium rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-display font-semibold text-[14px] text-fg">{str(k.metric)}</span>
                  <Pill>{str(k.frequency)}</Pill>
                </div>
                <p className="text-[12px] text-accent font-mono mb-2">TARGET · {str(k.target)}</p>
                <p className="text-[13px] text-fg-muted leading-relaxed">{str(k.why_it_matters)}</p>
              </div>
            ))}
          </div>
          {arr<string>(km.vanity_metrics_to_avoid).length > 0 && (
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-signal-rose mb-3">Vanity metrics to avoid</p>
              <Bullets items={arr<string>(km.vanity_metrics_to_avoid)} dotColor="signal-rose" />
            </div>
          )}
        </Section>

        {/* Action Plan */}
        <Section title="Action Plan" icon={CheckSquare}>
          <div className="space-y-3 mb-5">
            {arr<AnyObj>(ap.immediate_actions).map((a, i) => (
              <div key={i} className="card-premium rounded-lg p-4 flex gap-4">
                <div className="w-8 h-8 rounded-md bg-accent/[0.08] border border-accent/30 flex items-center justify-center text-accent font-mono font-semibold text-[12px] flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-display font-semibold text-[14px] text-fg">
                      {str(a.action)}
                    </span>
                    <Pill tone={priorityTone(str(a.impact))}>{str(a.impact)} impact</Pill>
                  </div>
                  <p className="text-[12px] text-fg-muted font-mono">
                    OWNER · {str(a.owner)} &nbsp; · &nbsp; WHEN · {str(a.timeline)} &nbsp; · &nbsp; EFFORT · {str(a.effort)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {arr<string>(ap.strategic_priorities).length > 0 && (
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-accent mb-3">Strategic priorities</p>
              <ol className="space-y-2">
                {arr<string>(ap.strategic_priorities).map((p, i) => (
                  <li key={i} className="flex gap-3 text-[14px] text-fg-dim leading-relaxed">
                    <span className="font-mono text-accent font-semibold w-6 flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Section>

        {/* Roadmap */}
        <Section title="Roadmap" icon={Map}>
          <div className="grid sm:grid-cols-3 gap-3">
            {[obj(rm.phase_1), obj(rm.phase_2), obj(rm.phase_3)].map((phase, i) => {
              const tones = ['accent', 'insight', 'violet'] as const
              return (
                <div key={i} className="card-premium rounded-lg p-5">
                  <div className="mb-3">
                    <Pill tone={tones[i]}>{str(phase.timeline) || `Phase ${i + 1}`}</Pill>
                  </div>
                  <h4 className="font-display font-semibold text-[15px] text-fg mb-3 leading-tight">
                    {str(phase.title)}
                  </h4>
                  <Bullets
                    items={arr<string>(phase.goals)}
                    dotColor={
                      tones[i] === 'accent'
                        ? 'accent'
                        : tones[i] === 'insight'
                        ? 'signal-insight'
                        : 'signal-violet'
                    }
                  />
                </div>
              )
            })}
          </div>
        </Section>

        {/* Risks */}
        <Section title="Risks & Mitigation" icon={AlertTriangle}>
          <div className="space-y-3">
            {ri.map((r, i) => {
              const sev = str(r.severity).toLowerCase()
              const borderTone =
                sev.includes('high') ? 'border-l-signal-rose' :
                sev.includes('medium') ? 'border-l-signal-pivot' :
                'border-l-line-strong'
              return (
                <div
                  key={i}
                  className={cn(
                    'card-premium rounded-lg p-4 border-l-2',
                    borderTone
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-display font-semibold text-[14px] text-fg">
                      {str(r.risk)}
                    </span>
                    <Pill tone={sev.includes('high') ? 'rose' : sev.includes('medium') ? 'pivot' : 'default'}>
                      Severity {str(r.severity)}
                    </Pill>
                    <Pill>Probability {str(r.probability)}</Pill>
                  </div>
                  <p className="text-[13px] text-fg-dim leading-relaxed">
                    <span className="text-accent font-mono text-[11px] mr-2">MITIGATION</span>
                    {str(r.mitigation)}
                  </p>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Recommendations */}
        <Section title="Final Recommendations" icon={Trophy}>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-accent mb-3">Top 3 priorities</p>
              <ol className="space-y-2">
                {arr<string>(rc.top_3_priorities).map((p, i) => (
                  <li key={i} className="text-[13px] text-fg-dim leading-relaxed flex gap-2">
                    <span className="text-accent font-mono font-semibold">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-signal-insight mb-3">Quick wins this week</p>
              <Bullets items={arr<string>(rc.quick_wins)} dotColor="signal-insight" />
            </div>
            <div className="card-premium rounded-lg p-5">
              <p className="eyebrow text-signal-rose mb-3">Avoid</p>
              <Bullets items={arr<string>(rc.avoid)} dotColor="signal-rose" />
            </div>
          </div>
          {str(rc.closing_advice) && (
            <div className="card-premium rounded-lg p-6 border-accent/30 bg-accent/[0.04]">
              <p className="eyebrow text-accent mb-3">Closing advice</p>
              <p className="font-serif-italic text-lg text-fg leading-relaxed">
                &ldquo;{str(rc.closing_advice)}&rdquo;
              </p>
            </div>
          )}
        </Section>

        {/* Footer */}
        <div className="px-6 sm:px-10 py-5 bg-bg-sub text-center">
          <p className="text-[12px] text-fg-faint font-mono">
            Generated by <span className="text-accent">Thinkior AI</span> ·{' '}
            {new Date().toLocaleDateString()} · Confidential
          </p>
        </div>
      </div>
    </div>
  )
}
