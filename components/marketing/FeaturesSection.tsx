import {
  CheckCircle2,
  Megaphone,
  Lightbulb,
  MessageSquare,
  UsersRound,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileText,
} from 'lucide-react'
import Link from 'next/link'

export default function FeaturesSection() {
  return (
    <section
      className="relative py-24 md:py-32 border-t border-line"
      id="features"
    >
      {/* Subtle background tint */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-accent/[0.03] to-transparent pointer-events-none" />

      <div className="relative max-w-[1240px] mx-auto px-5 sm:px-6">
        {/* Section header */}
        <div className="max-w-3xl mb-14 md:mb-20">
          <p className="eyebrow mb-4">The product</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-fg tracking-tighter leading-[1.02]">
            A guided journey.{' '}
            <span className="font-serif-italic font-normal text-accent">One clear next move.</span>
          </h2>
          <p className="text-lg text-fg-dim mt-6 max-w-2xl leading-relaxed">
            Start with the question in front of you, then carry the evidence and learning into the next decision.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid md:grid-cols-12 gap-4 md:gap-5">
          {/* Row 1: Validator (7) + Marketing Engine (5) */}
          <FeatureCardLarge />
          <FeatureCardMarketing />

          {/* Row 2: Reports (4) + Ideas (4) + Pitch (4) */}
          <FeatureCardReports />
          <FeatureCardIdeas />
          <FeatureCardLeads />

          {/* Row 3: Chat — full-width */}
          <FeatureCardChat />
        </div>
      </div>
    </section>
  )
}

/* === LARGE: Validator === */
function FeatureCardLarge() {
  return (
    <Link
      href="/signup"
      className="md:col-span-7 group card-premium rounded-2xl p-7 md:p-10 relative overflow-hidden hover:bg-bg-elevated transition-all duration-500"
    >
      <div className="flex items-center gap-3 mb-7">
        <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-accent" />
        </div>
        <span className="eyebrow">Business Validator</span>
      </div>

      <h3 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tight leading-[1.05] mb-4 max-w-lg">
        Get a{' '}
        <span className="text-signal-go">GO</span>
        {' / '}
        <span className="text-signal-rose">KILL</span>
        {' / '}
        <span className="text-signal-pivot">PIVOT</span>
        {' '}verdict in 60 seconds.
      </h3>

      <p className="text-[15px] text-fg-dim leading-relaxed mb-8 max-w-md">
        Not vague feedback. A transparent decision framework with assumptions to test,
        evidence to gather, and one action to take this week.
      </p>

      {/* Mini preview */}
      <div className="mb-8 bg-bg-sub border border-line rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-line flex items-center justify-between bg-bg">
          <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">
            Verdict
          </span>
          <span className="font-mono text-[10px] text-fg-muted">78% confidence</span>
        </div>
        <div className="p-5 grid grid-cols-3 gap-3 text-center">
          <div className="bg-bg p-3 rounded-lg border border-line opacity-40">
            <div className="font-mono text-[10px] uppercase tracking-caps text-signal-go mb-1">Go</div>
            <div className="font-display font-bold text-2xl text-fg/30">—</div>
          </div>
          <div className="bg-signal-pivot/5 p-3 rounded-lg border-2 border-signal-pivot">
            <div className="font-mono text-[10px] uppercase tracking-caps text-signal-pivot mb-1">Pivot</div>
            <div className="font-display font-bold text-2xl text-signal-pivot">✓</div>
          </div>
          <div className="bg-bg p-3 rounded-lg border border-line opacity-40">
            <div className="font-mono text-[10px] uppercase tracking-caps text-signal-rose mb-1">Kill</div>
            <div className="font-display font-bold text-2xl text-fg/30">—</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-accent font-medium text-sm group-hover:gap-3 transition-all">
        Try Business Validator
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

/* === Marketing Engine === */
function FeatureCardMarketing() {
  return (
    <Link
      href="/signup"
      className="md:col-span-5 group card-premium rounded-2xl p-7 md:p-8 hover:bg-bg-elevated transition-all duration-500"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
          <Megaphone className="w-4 h-4 text-accent" />
        </div>
        <span className="eyebrow">Marketing Engine</span>
      </div>
      <h3 className="font-display font-bold text-2xl text-fg tracking-tight leading-[1.1] mb-4">
        Turn your niche into a weekly social roadmap.
      </h3>
      <p className="text-[14px] text-fg-dim leading-relaxed mb-7">
        Build a focused strategy, practical content packs, Reel scripts, captions, and poster prompts. You review and publish manually.
      </p>

      {/* Mini chart preview */}
      <div className="space-y-2 mb-6">
        {[
          { name: 'Blinkit', funding: '$1.2B', status: 'go' },
          { name: 'Zepto', funding: '$1.4B', status: 'go' },
          { name: 'Instamart', funding: '$300M', status: 'go' },
          { name: 'You', funding: '—', status: 'pivot', highlight: true },
        ].map((c) => (
          <div
            key={c.name}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-[12px] ${
              c.highlight
                ? 'bg-accent/10 border border-accent/30'
                : 'bg-bg-sub border border-line'
            }`}
          >
            <span className={c.highlight ? 'text-accent font-semibold' : 'text-fg-dim'}>{c.name}</span>
            <span className="font-mono text-fg-muted">{c.funding}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-accent font-medium text-sm group-hover:gap-3 transition-all">
        Try Marketing Engine
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

/* === Ideas === */
function FeatureCardIdeas() {
  return (
    <Link
      href="/signup"
      className="md:col-span-4 group card-premium rounded-2xl p-7 md:p-8 hover:bg-bg-elevated transition-all duration-500"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-signal-pivot/15 border border-signal-pivot/30 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-signal-pivot" />
        </div>
        <span className="eyebrow">Ideas Desk</span>
      </div>
      <h3 className="font-display font-bold text-2xl text-fg tracking-tight leading-[1.1] mb-4">
        Stress-test before it breaks you.
      </h3>
      <p className="text-[14px] text-fg-dim leading-relaxed mb-7">
        Develop your idea with a co-founder who asks the right questions —
        and pushes back when the answers are weak.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="bg-bg-sub border border-line rounded-md p-3">
          <div className="font-mono text-[10px] uppercase tracking-caps text-fg-muted mb-1">PSF score</div>
          <div className="font-display font-bold text-xl text-fg">4.2<span className="text-fg-muted text-sm">/5</span></div>
        </div>
        <div className="bg-bg-sub border border-line rounded-md p-3">
          <div className="font-mono text-[10px] uppercase tracking-caps text-fg-muted mb-1">First ₹</div>
          <div className="font-display font-bold text-xl text-fg">28d</div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-signal-pivot font-medium text-sm group-hover:gap-3 transition-all">
        Try Ideas Desk
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

/* === Leads Finder === */
function FeatureCardLeads() {
  return (
    <Link
      href="/signup"
      className="md:col-span-4 group card-premium rounded-2xl p-7 md:p-8 hover:bg-bg-elevated transition-all duration-500"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
          <UsersRound className="w-4 h-4 text-accent" />
        </div>
        <span className="eyebrow">Leads Finder</span>
      </div>
      <h3 className="font-display font-bold text-2xl text-fg tracking-tight leading-[1.1] mb-4">
        Find the next people worth talking to.
      </h3>
      <p className="text-[14px] text-fg-dim leading-relaxed mb-7">
        Score your pitch like a YC partner × Blume VC. Seven sections, the two
        red flags that get you rejected, a rewrite for your weakest slide.
      </p>

      <div className="bg-bg-sub border border-line rounded-lg p-4 mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted">Research result</span>
          <span className="font-mono text-xs text-accent">Sources visible</span>
        </div>
        <div className="font-display font-bold text-3xl text-fg mb-1 tabular">10</div>
        <p className="text-xs text-fg-muted">requested leads, with public evidence</p>
      </div>

      <div className="flex items-center gap-2 text-accent font-medium text-sm group-hover:gap-3 transition-all">
        Try Leads Finder
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

/* === Reports === */
function FeatureCardReports() {
  return (
    <Link
      href="/signup?plan=founder_pro"
      className="md:col-span-4 group card-premium rounded-2xl p-7 md:p-8 hover:bg-bg-elevated transition-all duration-500 relative overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-signal-insight/15 border border-signal-insight/30 flex items-center justify-center">
          <FileText className="w-4 h-4 text-signal-insight" />
        </div>
        <span className="eyebrow">Business Reports</span>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-caps text-signal-insight border border-signal-insight/30 bg-signal-insight/5 rounded-full px-2 py-0.5">
          Pro
        </span>
      </div>
      <h3 className="font-display font-bold text-2xl text-fg tracking-tight leading-[1.1] mb-4">
        Investor-grade reports in 60 seconds.
      </h3>
      <p className="text-[14px] text-fg-dim leading-relaxed mb-7">
        Eight sections — exec summary, market sizing in ₹, competitive
        landscape, GTM strategy, projections, risks, and a 90-day plan.
        Exportable as PDF.
      </p>

      {/* Mini report preview — section checklist */}
      <div className="bg-bg-sub border border-line rounded-lg p-4 mb-6">
        <p className="font-mono text-[10px] uppercase tracking-caps text-fg-muted mb-3">
          Report structure
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-fg-dim">
          {[
            'Executive summary',
            'Market sizing (TAM/SAM/SOM)',
            'Competitive landscape',
            'GTM strategy',
            '5-year projections',
            'Risk register',
            '90-day action plan',
            'Funding ask & use',
          ].map((section) => (
            <div key={section} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-signal-insight flex-shrink-0" />
              <span className="truncate">{section}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-signal-insight font-medium text-sm group-hover:gap-3 transition-all">
        Generate a report
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}

/* === Chat — full width === */
function FeatureCardChat() {
  return (
    <Link
      href="/signup"
      className="md:col-span-12 group card-premium rounded-2xl p-7 md:p-10 hover:bg-bg-elevated transition-all duration-500 relative overflow-hidden"
    >
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left: copy */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-fg/10 border border-line-strong flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-fg" />
            </div>
            <span className="eyebrow">Co-founder Desk</span>
          </div>
          <h3 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tight leading-[1.05] mb-4 max-w-md">
            Your co-founder. Available 24/7. <span className="font-serif-italic font-normal text-fg-dim">On tap.</span>
          </h3>
          <p className="text-[15px] text-fg-dim leading-relaxed mb-7 max-w-md">
            Strategy, validation, fundraising, and GTM guidance grounded in your
            saved context. Ask for a clear next decision, not generic advice.
          </p>
          <div className="flex items-center gap-2 text-fg font-medium text-sm group-hover:gap-3 transition-all">
            Try Co-founder Desk
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Right: chat preview */}
        <div className="space-y-3">
          <div className="bg-fg/10 rounded-2xl rounded-tr-md px-4 py-3 text-[13px] text-fg ml-auto max-w-[85%] text-right">
            Should I raise now or wait?
          </div>
          <div className="bg-bg-sub border border-line rounded-2xl rounded-tl-md px-4 py-3 text-[13px] text-fg-dim max-w-[90%]">
            <p className="leading-relaxed">
              Start by documenting the evidence behind your current traction,
              runway, and next milestone. Then decide whether to raise or learn more first.
            </p>
            <p className="mt-2 text-[11px] text-fg-muted font-mono">
              Sources and assumptions are shown with the recommendation when research is used.
            </p>
          </div>
          <div className="bg-fg/10 rounded-2xl rounded-tr-md px-4 py-3 text-[13px] text-fg ml-auto max-w-[70%] text-right">
            What about dilution?
          </div>
        </div>
      </div>
    </Link>
  )
}
