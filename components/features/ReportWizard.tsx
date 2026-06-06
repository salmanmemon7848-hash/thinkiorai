'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Building2,
  Zap,
  Target,
  TrendingUp,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FormData {
  reportType: string
  businessName: string
  industry: string
  businessStage: string
  businessDescription: string
  productService: string
  targetMarket: string
  currentRevenue: string
  mainChallenge: string
  competitors: string
  goals: string
  teamSize: string
  location: string
  fundingStatus: string
  uniqueAdvantage: string
}

const INIT: FormData = {
  reportType: '',
  businessName: '',
  industry: '',
  businessStage: '',
  businessDescription: '',
  productService: '',
  targetMarket: '',
  currentRevenue: '',
  mainChallenge: '',
  competitors: '',
  goals: '',
  teamSize: '',
  location: '',
  fundingStatus: '',
  uniqueAdvantage: '',
}

const STEPS = [
  { id: 1, title: 'Report type', subtitle: 'What kind of analysis do you need?', icon: FileText },
  { id: 2, title: 'Your business', subtitle: 'The essentials', icon: Building2 },
  { id: 3, title: 'What you do', subtitle: 'Product and edge', icon: Zap },
  { id: 4, title: 'Market & competitors', subtitle: 'Who you serve and against whom', icon: Target },
  { id: 5, title: 'Current status', subtitle: 'Revenue, team, funding', icon: TrendingUp },
  { id: 6, title: 'Goals & challenges', subtitle: 'What you want and what blocks you', icon: Rocket },
]

const REPORT_TYPES = [
  'Full Business Plan',
  'Market Analysis Report',
  'Growth Strategy Report',
  'Financial Performance Report',
  'Competitor Analysis Report',
  'Startup Pitch Report',
  'Go-To-Market Strategy Report',
  'Investment Readiness Report',
]

const STAGES = [
  'Idea Stage',
  'MVP Stage',
  'Pre-Revenue',
  'Early Revenue',
  'Growth Stage',
  'Scaling',
]

const REVENUES = [
  'No Revenue',
  'Under $1K/month',
  '$1K–$10K/month',
  '$10K–$50K/month',
  '$50K–$100K/month',
  '$100K+/month',
]

const TEAMS = ['Solo Founder', '2–3 People', '4–10 People', '11–50 People', '50+ People']

const FUNDING = [
  'Bootstrapped',
  'Friends & Family Round',
  'Pre-Seed',
  'Seed Round',
  'Series A or above',
  'Seeking Funding',
]

function Chips({
  options,
  selected,
  onSelect,
}: {
  options: string[]
  selected: string
  onSelect: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = selected === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={cn(
              'flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-md text-left text-[13px] transition-all border',
              active
                ? 'bg-accent/[0.08] border-accent/40 text-fg'
                : 'bg-bg-card border-line text-fg-dim hover:border-line-strong hover:text-fg'
            )}
          >
            <span className="font-medium leading-snug">{opt}</span>
            {active && <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={2.25} />}
          </button>
        )
      })}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  optional,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  optional?: boolean
}) {
  return (
    <div>
      <label className="flex items-baseline gap-2 mb-2">
        <span className="text-[13px] font-medium text-fg">{label}</span>
        {required && <span className="text-[11px] text-accent">required</span>}
        {optional && <span className="text-[11px] text-fg-faint">optional</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-card border border-line rounded-md px-3.5 py-2.5 text-[14px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent/60 transition-colors"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div>
      <label className="flex items-baseline gap-2 mb-2">
        <span className="text-[13px] font-medium text-fg">{label}</span>
        <span className="text-[11px] text-fg-faint">optional — better input = better report</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-bg-card border border-line rounded-md px-3.5 py-3 text-[14px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent/60 transition-colors resize-none leading-relaxed"
      />
    </div>
  )
}

const LOADING_MESSAGES = [
  'Searching the web for live market intelligence…',
  'Mapping the competitive landscape…',
  'Building your strategic narrative…',
  'Sizing the opportunity…',
  'Stress-testing the unit economics…',
  'Drafting your investor-grade report…',
]

export default function ReportWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INIT)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [error, setError] = useState('')

  const cur = STEPS[step - 1]
  const progress = (step / STEPS.length) * 100
  const set = (k: keyof FormData) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const canNext = () => {
    if (step === 1) return !!form.reportType
    if (step === 2) return !!(form.industry.trim() && form.businessStage)
    return true
  }

  async function generate() {
    setLoading(true)
    setError('')
    let i = 0
    setLoadingMsg(LOADING_MESSAGES[0])
    const ticker = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[i])
    }, 3500)

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Generation failed')
      clearInterval(ticker)
      router.push(`/reports/${data.reportId}`)
    } catch (err) {
      clearInterval(ticker)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="w-16 h-16 rounded-full border border-line flex items-center justify-center bg-bg-card">
            <Loader2 className="w-6 h-6 text-accent animate-spin" strokeWidth={1.75} />
          </div>
          <div className="absolute -inset-2 rounded-full border border-accent/20 animate-pulse-slow" />
        </div>
        <h2 className="font-display font-semibold text-2xl text-fg tracking-tighter mb-2">
          Generating your report
        </h2>
        <p className="text-[14px] text-fg-dim min-h-[20px] mb-8 transition-opacity">
          {loadingMsg}
        </p>
        <div className="w-72 max-w-full bg-bg-card border border-line rounded-full overflow-hidden h-1">
          <div
            className="h-full bg-gradient-to-r from-accent via-signal-insight to-signal-violet animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
        <p className="text-[12px] text-fg-faint mt-6 max-w-sm">
          Researching your market in real time. This takes 20–45 seconds.
        </p>
      </div>
    )
  }

  const StepIcon = cur.icon

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="eyebrow text-accent">Business Report</span>
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tighter leading-tight mb-2">
          Investor-grade report,{' '}
          <span className="font-serif-italic font-normal text-accent">in 30 seconds.</span>
        </h1>
        <p className="text-[14px] text-fg-dim">
          Answer a few questions — we&apos;ll research your market live and write the report.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[12px] text-fg-muted mb-2 font-mono">
          <span>STEP {step} OF {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-bg-card border border-line rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {STEPS.map((s) => {
            const done = s.id < step
            const active = s.id === step
            return (
              <div
                key={s.id}
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono font-semibold border transition-all',
                  done
                    ? 'bg-accent text-bg border-accent'
                    : active
                    ? 'bg-bg-card text-accent border-accent/60'
                    : 'bg-bg-card text-fg-faint border-line'
                )}
              >
                {done ? <Check className="w-3 h-3" strokeWidth={2.5} /> : s.id}
              </div>
            )
          })}
        </div>
      </div>

      {/* Card */}
      <div className="card-premium rounded-xl p-6 sm:p-8 mb-5">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-9 h-9 rounded-md bg-accent/[0.08] border border-accent/30 flex items-center justify-center flex-shrink-0">
            <StepIcon className="w-4 h-4 text-accent" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-fg tracking-tight leading-tight">
              {cur.title}
            </h2>
            <p className="text-[13px] text-fg-muted mt-0.5">{cur.subtitle}</p>
          </div>
        </div>

        {step === 1 && (
          <Chips options={REPORT_TYPES} selected={form.reportType} onSelect={set('reportType')} />
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field
              label="Business name"
              value={form.businessName}
              onChange={set('businessName')}
              placeholder="e.g. Thinkior AI"
              optional
            />
            <Field
              label="Industry or niche"
              value={form.industry}
              onChange={set('industry')}
              placeholder="e.g. AI SaaS, EdTech, D2C, HealthTech…"
              required
            />
            <div>
              <label className="block text-[13px] font-medium text-fg mb-2">
                Business stage <span className="text-[11px] text-accent ml-1">required</span>
              </label>
              <Chips options={STAGES} selected={form.businessStage} onSelect={set('businessStage')} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <TextArea
              label="Business description"
              value={form.businessDescription}
              onChange={set('businessDescription')}
              placeholder="What does your business do, what problem does it solve, and who is it for?"
            />
            <Field
              label="Product or service"
              value={form.productService}
              onChange={set('productService')}
              placeholder="SaaS platform, mobile app, consulting, physical product…"
              optional
            />
            <Field
              label="Your unique advantage"
              value={form.uniqueAdvantage}
              onChange={set('uniqueAdvantage')}
              placeholder="What makes you different from everyone else?"
              optional
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <Field
              label="Target market"
              value={form.targetMarket}
              onChange={set('targetMarket')}
              placeholder="e.g. SMB founders in India, enterprise HR teams, Gen Z students…"
              optional
            />
            <Field
              label="Known competitors"
              value={form.competitors}
              onChange={set('competitors')}
              placeholder="e.g. Notion, Monday.com, Zoho — comma separated"
              optional
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-fg mb-2">Current monthly revenue</label>
              <Chips options={REVENUES} selected={form.currentRevenue} onSelect={set('currentRevenue')} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-fg mb-2">Team size</label>
              <Chips options={TEAMS} selected={form.teamSize} onSelect={set('teamSize')} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-fg mb-2">Funding status</label>
              <Chips options={FUNDING} selected={form.fundingStatus} onSelect={set('fundingStatus')} />
            </div>
            <Field
              label="Location / market"
              value={form.location}
              onChange={set('location')}
              placeholder="India, USA, Southeast Asia, Global…"
              optional
            />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <TextArea
              label="Business goals"
              value={form.goals}
              onChange={set('goals')}
              placeholder="What do you want to achieve in the next 6–12 months? e.g. reach $10K MRR, raise a seed round…"
            />
            <TextArea
              label="Biggest challenge right now"
              value={form.mainChallenge}
              onChange={set('mainChallenge')}
              placeholder="Be specific — distribution, retention, pricing, hiring, regulatory…"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-signal-rose/[0.08] border border-signal-rose/30 rounded-md p-3 mb-4 text-[13px] text-signal-rose">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-md border border-line bg-bg-card text-fg-dim hover:text-fg hover:border-line-strong transition-colors text-[13px] font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < STEPS.length ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-accent text-bg font-semibold text-[13px] hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
          </button>
        ) : (
          <button
            onClick={generate}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-accent text-bg font-semibold text-[13px] hover:bg-accent-hover transition-colors btn-shine"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.25} />
            Generate report
          </button>
        )}
      </div>

      {step >= 2 && step < STEPS.length && (
        <p className="text-center text-[12px] text-fg-faint mt-4">
          Optional fields are fine to skip — the AI researches the gaps.
        </p>
      )}
    </div>
  )
}
