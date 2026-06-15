'use client'

/**
 * THINKIOR — REPORT WIZARD (TEMPLATE-DRIVEN)
 * ─────────────────────────────────────────────────────────────────
 * Two-phase wizard:
 *   Phase 1: pick a template (5 curated options, each answers a
 *            specific question a founder has).
 *   Phase 2: answer the template's focused questions. Different
 *            templates surface different fields. Optional fields
 *            are fine to skip — the AI researches the gaps.
 *
 * Posts to /api/reports/generate. The backend uses the legacy
 * `reportType` field (from the template) as the prompt's report
 * type marker, so existing AI logic keeps working.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Lightbulb,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { safeFetchJson } from '@/lib/utils/safeFetch'
import {
  REPORT_TEMPLATES,
  getDefaultTemplate,
  getTemplateById,
  type ReportTemplate,
  type WizardStepConfig,
} from '@/lib/reports/templates'

type FormState = Record<string, string>

function buildInitialForm(template: ReportTemplate): FormState {
  const init: FormState = {
    reportType: template.reportType,
  }
  for (const step of template.steps) {
    init[step.key] = ''
  }
  return init
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
  const search = useSearchParams()
  const templateParam = search.get('template')
  const initialTemplate = useMemo(
    () => (templateParam ? getTemplateById(templateParam) : null) ?? getDefaultTemplate(),
    [templateParam]
  )

  const [template, setTemplate] = useState<ReportTemplate>(initialTemplate)
  const [phase, setPhase] = useState<'pick' | 'fill'>(
    templateParam ? 'fill' : 'pick'
  )
  const [form, setForm] = useState<FormState>(() => buildInitialForm(initialTemplate))
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [error, setError] = useState('')

  // When template changes, reset the form
  useEffect(() => {
    setForm(buildInitialForm(template))
    setStep(0)
  }, [template])

  const visibleSteps = template.steps.filter((s) => s.visible)
  const cur = visibleSteps[step]
  const progress = visibleSteps.length > 0 ? (step / visibleSteps.length) * 100 : 0
  const set = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  const canNext = () => {
    if (!cur) return true
    if (!cur.required) return true
    return (form[cur.key] || '').trim().length > 0
  }

  function pickTemplate(t: ReportTemplate) {
    setTemplate(t)
    setPhase('fill')
    router.replace(`/reports/new?template=${t.id}`, { scroll: false })
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
      const data = await safeFetchJson<{ reportId?: string; error?: string; message?: string; details?: string }>(
        '/api/reports/generate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: form }),
        }
      )
      if (!data.reportId) {
        // Include details if server provided them
        const base = data.message || data.error || 'Generation failed'
        const detail = data.details ? ` (${data.details})` : ''
        throw new Error(base + detail)
      }
      clearInterval(ticker)
      router.push(`/reports/${data.reportId}`)
    } catch (err) {
      clearInterval(ticker)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  // ── Loading screen ───────────────────────────────────────────
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
          Generating your {template.name}
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

  // ── Phase 1: template picker ─────────────────────────────────
  if (phase === 'pick') {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="eyebrow text-accent">Business Report</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tighter leading-tight mb-2">
            Pick a report.{' '}
            <span className="font-serif-italic font-normal text-accent">
              Get the answer.
            </span>
          </h1>
          <p className="text-[14px] text-fg-dim max-w-2xl">
            Each template is tuned for one specific question. No 60-field forms,
            no generic &ldquo;business plan&rdquo;. Pick the question you actually have.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {REPORT_TEMPLATES.map((t) => {
            const Icon = t.icon
            const toneCls: Record<ReportTemplate['tone'], { wrap: string; icon: string; chip: string }> = {
              accent: {
                wrap: 'hover:border-accent/40',
                icon: 'bg-accent/[0.08] border-accent/30 text-accent',
                chip: 'bg-accent/[0.06] text-accent border-accent/30',
              },
              pivot: {
                wrap: 'hover:border-signal-pivot/40',
                icon: 'bg-signal-pivot/[0.08] border-signal-pivot/30 text-signal-pivot',
                chip: 'bg-signal-pivot/[0.06] text-signal-pivot border-signal-pivot/30',
              },
              insight: {
                wrap: 'hover:border-signal-insight/40',
                icon: 'bg-signal-insight/[0.08] border-signal-insight/30 text-signal-insight',
                chip: 'bg-signal-insight/[0.06] text-signal-insight border-signal-insight/30',
              },
              violet: {
                wrap: 'hover:border-signal-violet/40',
                icon: 'bg-signal-violet/[0.08] border-signal-violet/30 text-signal-violet',
                chip: 'bg-signal-violet/[0.06] text-signal-violet border-signal-violet/30',
              },
              rose: {
                wrap: 'hover:border-signal-rose/40',
                icon: 'bg-signal-rose/[0.08] border-signal-rose/30 text-signal-rose',
                chip: 'bg-signal-rose/[0.06] text-signal-rose border-signal-rose/30',
              },
            }
            const tone = toneCls[t.tone]
            return (
              <button
                key={t.id}
                onClick={() => pickTemplate(t)}
                className={cn(
                  'card-premium rounded-xl p-5 text-left transition-colors group',
                  tone.wrap
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-md flex items-center justify-center border flex-shrink-0',
                      tone.icon
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-[15.5px] text-fg leading-tight">
                      {t.name}
                    </h3>
                    <p className="text-[12.5px] text-fg-dim leading-relaxed mt-1">
                      {t.tagline}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono uppercase tracking-caps',
                    tone.chip
                  )}
                >
                  <Lightbulb className="w-3 h-3" />
                  &ldquo;{t.question}&rdquo;
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-fg-muted group-hover:text-fg mt-3 transition-colors">
                  Start this report
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            )
          })}
        </div>

        <p className="text-center text-[11.5px] text-fg-faint mt-6 font-mono uppercase tracking-caps">
          All templates include India-specific data, real competitors, and a
          founder-grade recommendation.
        </p>
      </div>
    )
  }

  // ── Phase 2: filled form ──────────────────────────────────────
  if (!cur) {
    return (
      <div className="text-center text-fg-dim">No fields to fill for this template.</div>
    )
  }

  const TemplateIcon = template.icon

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => {
              setPhase('pick')
              router.replace('/reports/new', { scroll: false })
            }}
            className="text-[12px] text-fg-muted hover:text-fg inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Change template
          </button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <TemplateIcon className="w-4 h-4 text-accent" />
          <span className="eyebrow text-accent">{template.name}</span>
        </div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-fg tracking-tighter leading-tight mb-1">
          {template.tagline}
        </h1>
        <p className="text-[12.5px] text-fg-faint italic font-serif-italic">
          &ldquo;{template.question}&rdquo;
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[12px] text-fg-muted mb-2 font-mono">
          <span>
            STEP {step + 1} OF {visibleSteps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-bg-card border border-line rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="card-premium rounded-xl p-6 sm:p-8 mb-5">
        <h2 className="font-display font-semibold text-[17px] text-fg tracking-tight leading-tight mb-1">
          {cur.title}
        </h2>
        <p className="text-[13px] text-fg-muted mb-5">{cur.subtitle}</p>

        {cur.render === 'chips' && cur.options && (
          <Chips
            options={cur.options}
            selected={form[cur.key] || ''}
            onSelect={set(cur.key)}
          />
        )}

        {cur.render === 'text' && (
          <input
            type="text"
            value={form[cur.key] || ''}
            onChange={(e) => set(cur.key)(e.target.value)}
            placeholder={cur.placeholder}
            className="w-full bg-bg-card border border-line rounded-md px-3.5 py-2.5 text-[14px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent/60 transition-colors"
          />
        )}

        {cur.render === 'textarea' && (
          <textarea
            value={form[cur.key] || ''}
            onChange={(e) => set(cur.key)(e.target.value)}
            placeholder={cur.placeholder}
            rows={5}
            className="w-full bg-bg-card border border-line rounded-md px-3.5 py-3 text-[14px] text-fg placeholder:text-fg-faint focus:outline-none focus:border-accent/60 transition-colors resize-none leading-relaxed"
          />
        )}

        {!cur.required && (
          <p className="text-[11px] text-fg-faint mt-2">
            Optional — skip if you don&apos;t have it. The AI will research.
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-signal-rose/[0.08] border border-signal-rose/30 rounded-md p-3 mb-4 text-[13px] text-signal-rose">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-md border border-line bg-bg-card text-fg-dim hover:text-fg hover:border-line-strong transition-colors text-[13px] font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < visibleSteps.length - 1 ? (
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
            disabled={!canNext()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-accent text-bg font-semibold text-[13px] hover:bg-accent-hover transition-colors btn-shine disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.25} />
            Generate report
          </button>
        )}
      </div>

      <p className="text-center text-[12px] text-fg-faint mt-4">
        Takes 20–45 seconds. Live market research runs in the background.
      </p>
    </div>
  )
}

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
