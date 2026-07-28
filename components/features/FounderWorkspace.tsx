'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  ExternalLink,
  FlaskConical,
  Flag,
  Lightbulb,
  Plus,
  Search,
  Target,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { FounderEvidence, FounderExperiment } from '@/types'

type Decision = {
  id: string
  title: string
  rationale: string | null
  expected_outcome: string | null
  status: string
}

type GtmPlan = {
  icp: string | null
  positioning: string | null
  value_proposition: string | null
  first_channel: string | null
  next_action: string | null
  resource_url: string | null
  resource_title: string | null
}

type Review = {
  id: string
  learned: string | null
  changed_assumption: string | null
  next_focus: string | null
  created_at: string
}

const JOURNEY = [
  { label: 'Validate', href: '/validator', description: 'Prove the problem and your riskiest assumption.' },
  { label: 'Research', href: '/competitor', description: 'Collect evidence, competitors, and market context.' },
  { label: 'Decide', href: '#decisions', description: 'Make a choice and state what should happen next.' },
  { label: 'Go to market', href: '#gtm', description: 'Clarify customer, message, channel, and first test.' },
  { label: 'Review', href: '#review', description: 'Turn learning into the next weekly focus.' },
]

const RESOURCE = {
  title: 'Customer interview guide',
  url: 'https://www.ycombinator.com/library/4A-how-to-talk-to-users',
}

export default function FounderWorkspace() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [evidence, setEvidence] = useState<FounderEvidence[]>([])
  const [experiments, setExperiments] = useState<FounderExperiment[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [gtm, setGtm] = useState<GtmPlan | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const [evidenceRes, experimentsRes, decisionsRes, gtmRes, reviewRes] = await Promise.all([
      supabase.from('founder_evidence').select('*').order('created_at', { ascending: false }).limit(8),
      supabase.from('founder_experiments').select('*').order('due_date', { ascending: true }).limit(6),
      supabase.from('founder_decisions').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('founder_gtm_plans').select('*').maybeSingle(),
      supabase.from('founder_reviews').select('*').order('created_at', { ascending: false }).limit(1),
    ])
    setEvidence((evidenceRes.data ?? []) as FounderEvidence[])
    setExperiments((experimentsRes.data ?? []) as FounderExperiment[])
    setDecisions((decisionsRes.data ?? []) as Decision[])
    setGtm((gtmRes.data ?? null) as GtmPlan | null)
    setReviews((reviewRes.data ?? []) as Review[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const activeStep = useMemo(() => {
    if (evidence.length === 0) return 0
    if (decisions.length === 0) return 1
    if (!gtm?.next_action) return 2
    return 3
  }, [decisions.length, evidence.length, gtm?.next_action])

  const save = async (task: () => PromiseLike<{ error: unknown }>, message: string) => {
    setSaving(true)
    setNotice(null)
    const { error } = await task()
    setSaving(false)
    if (error) {
      setNotice('Could not save this yet. Confirm the Founder Workspace migration has been applied.')
      return
    }
    setNotice(message)
    await load()
  }

  const addEvidence = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    const claim = String(form.get('claim') ?? '').trim()
    if (!title || !claim || !userId) return
    const sourceUrl = String(form.get('source_url') ?? '').trim()
    await save(
      () => createClient().from('founder_evidence').insert({
        user_id: userId, title, claim,
        kind: String(form.get('kind') ?? 'market'),
        source_url: sourceUrl || null,
        source_title: String(form.get('source_title') ?? '').trim() || null,
        confidence: sourceUrl ? 'medium' : 'low',
        status: sourceUrl ? 'unverified' : 'assumption',
      }),
      'Evidence saved. Verify the source before using it for a decision.'
    )
    event.currentTarget.reset()
  }

  const addDecision = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    if (!title || !userId) return
    await save(
      () => createClient().from('founder_decisions').insert({
        user_id: userId, title,
        rationale: String(form.get('rationale') ?? '').trim() || null,
        expected_outcome: String(form.get('outcome') ?? '').trim() || null,
      }),
      'Decision recorded. Review it after you have new evidence.'
    )
    event.currentTarget.reset()
  }

  const addExperiment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') ?? '').trim()
    if (!title || !userId) return
    await save(
      () => createClient().from('founder_experiments').insert({
        user_id: userId, title,
        hypothesis: String(form.get('hypothesis') ?? '').trim() || null,
        success_metric: String(form.get('metric') ?? '').trim() || null,
        due_date: String(form.get('due_date') ?? '') || null,
        resource_url: RESOURCE.url,
        resource_title: RESOURCE.title,
      }),
      'Experiment planned. Do the work yourself, then return with what you learned.'
    )
    event.currentTarget.reset()
  }

  const saveGtm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return
    const form = new FormData(event.currentTarget)
    await save(
      () => createClient().from('founder_gtm_plans').upsert({
        user_id: userId,
        icp: String(form.get('icp') ?? '').trim() || null,
        positioning: String(form.get('positioning') ?? '').trim() || null,
        value_proposition: String(form.get('value_proposition') ?? '').trim() || null,
        first_channel: String(form.get('channel') ?? '').trim() || null,
        next_action: String(form.get('next_action') ?? '').trim() || null,
        resource_url: RESOURCE.url,
        resource_title: RESOURCE.title,
      }, { onConflict: 'user_id' }),
      'Your GTM guide is saved. Keep it small: one audience, one message, one channel.'
    )
  }

  const addReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (!userId) return
    await save(
      () => createClient().from('founder_reviews').insert({
        user_id: userId,
        learned: String(form.get('learned') ?? '').trim() || null,
        changed_assumption: String(form.get('assumption') ?? '').trim() || null,
        next_focus: String(form.get('focus') ?? '').trim() || null,
      }),
      'Weekly review saved. Your next decision should use this learning.'
    )
    event.currentTarget.reset()
  }

  if (loading) return <div className="h-80 card-premium rounded-2xl animate-pulse" />

  const next = JOURNEY[Math.min(activeStep, JOURNEY.length - 1)]
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="card-premium rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="mesh-bg" aria-hidden="true" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="eyebrow text-accent mb-2">Founder workspace</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-fg">Make the next decision clearer.</h1>
              <p className="text-fg-dim mt-3 max-w-2xl leading-relaxed">Thinkior guides your research and growth work. You make the calls and do the work.</p>
            </div>
            <Link href={next.href} className="btn-shine inline-flex items-center gap-2 bg-accent text-bg font-semibold px-4 py-2.5 rounded-md text-sm">
              Next: {next.label}<ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ol className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-7">
            {JOURNEY.map((step, i) => (
              <li key={step.label} className={`border rounded-lg p-3 ${i === activeStep ? 'border-accent/60 bg-accent/[0.06]' : i < activeStep ? 'border-line-strong bg-bg-card' : 'border-line bg-bg/40'}`}>
                <p className="font-mono text-[10px] text-fg-muted">0{i + 1}</p>
                <p className="font-medium text-[13px] text-fg mt-1">{step.label}</p>
              </li>
            ))}
          </ol>
        </div>
      </header>

      {notice && <div className="rounded-lg border border-accent/30 bg-accent/[0.06] px-4 py-3 text-sm text-fg">{notice}</div>}

      <section className="grid xl:grid-cols-2 gap-5">
        <Panel icon={Search} title="Evidence hub" description="Save what you know, identify what is only an assumption, and keep the original source close.">
          <form onSubmit={addEvidence} className="grid sm:grid-cols-2 gap-2 mb-4">
            <Field name="title" placeholder="Evidence title" required />
            <select name="kind" className="workspace-input"><option value="market">Market</option><option value="competitor">Competitor</option><option value="customer">Customer</option><option value="risk">Risk</option></select>
            <Field name="claim" placeholder="What does this evidence suggest?" required className="sm:col-span-2" />
            <Field name="source_title" placeholder="Source name (optional)" />
            <Field name="source_url" type="url" placeholder="Source URL (optional)" />
            <Submit disabled={saving} label="Save evidence" />
          </form>
          <div className="space-y-2">{evidence.length ? evidence.map((item) => <EvidenceRow key={item.id} item={item} />) : <Empty text="No evidence yet. Start with a market claim, customer quote, competitor fact, or risk." />}</div>
        </Panel>

        <Panel icon={Compass} title="Decision log" description="State the call, why you made it, and what should happen if it is right." id="decisions">
          <form onSubmit={addDecision} className="space-y-2 mb-4">
            <Field name="title" placeholder="Decision: e.g. focus on independent consultants" required />
            <Field name="rationale" placeholder="Why now? What evidence supports it?" />
            <Field name="outcome" placeholder="Expected outcome" />
            <Submit disabled={saving} label="Record decision" />
          </form>
          <div className="space-y-2">{decisions.length ? decisions.map((item) => <div key={item.id} className="rounded-lg border border-line p-3"><p className="text-sm font-medium text-fg">{item.title}</p>{item.rationale && <p className="text-xs text-fg-muted mt-1">Why: {item.rationale}</p>}{item.expected_outcome && <p className="text-xs text-accent mt-1">Expected: {item.expected_outcome}</p>}</div>) : <Empty text="No decisions recorded. Decisions become stronger when you can revisit the evidence behind them." />}</div>
        </Panel>

        <Panel icon={FlaskConical} title="Experiment planner" description="Run the smallest test that can change your mind. Thinkior plans; you execute." >
          <form onSubmit={addExperiment} className="grid sm:grid-cols-2 gap-2 mb-4">
            <Field name="title" placeholder="Experiment title" required />
            <Field name="due_date" type="date" />
            <Field name="hypothesis" placeholder="Hypothesis" className="sm:col-span-2" />
            <Field name="metric" placeholder="Success metric" className="sm:col-span-2" />
            <Submit disabled={saving} label="Plan experiment" />
          </form>
          <div className="space-y-2">{experiments.length ? experiments.map((item) => <ExperimentRow key={item.id} item={item} />) : <Empty text="Start with five customer conversations, a pricing test, or a one-page landing-page test." />}</div>
        </Panel>

        <Panel icon={Target} title="GTM guide" description="Keep your launch focused: one audience, one message, one channel, and one next test." id="gtm">
          <form onSubmit={saveGtm} className="grid sm:grid-cols-2 gap-2">
            <Field name="icp" defaultValue={gtm?.icp ?? ''} placeholder="Ideal customer profile" />
            <Field name="channel" defaultValue={gtm?.first_channel ?? ''} placeholder="First channel" />
            <Field name="positioning" defaultValue={gtm?.positioning ?? ''} placeholder="Positioning" className="sm:col-span-2" />
            <Field name="value_proposition" defaultValue={gtm?.value_proposition ?? ''} placeholder="Value proposition" className="sm:col-span-2" />
            <Field name="next_action" defaultValue={gtm?.next_action ?? ''} placeholder="This week's GTM action" className="sm:col-span-2" />
            <Submit disabled={saving} label="Save GTM guide" />
          </form>
          <a href={RESOURCE.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent hover:underline"><BookOpen className="w-3.5 h-3.5" />Resource: {RESOURCE.title}<ExternalLink className="w-3 h-3" /></a>
        </Panel>
      </section>

      <section id="review" className="card-premium rounded-2xl p-6 sm:p-7">
        <div className="flex items-start gap-3 mb-5"><div className="w-9 h-9 rounded-md border border-accent/30 bg-accent/[0.08] flex items-center justify-center"><ClipboardCheck className="w-4 h-4 text-accent" /></div><div><h2 className="font-display text-lg font-semibold text-fg">Weekly founder review</h2><p className="text-sm text-fg-muted mt-1">Close the loop. What changed, and what matters next?</p></div></div>
        <form onSubmit={addReview} className="grid md:grid-cols-3 gap-2">
          <Field name="learned" placeholder="What did you learn?" />
          <Field name="assumption" placeholder="Which assumption changed?" />
          <Field name="focus" placeholder="Next week's focus" />
          <Submit disabled={saving} label="Save review" />
        </form>
        {reviews[0] && <p className="text-xs text-fg-muted mt-4">Latest focus: <span className="text-fg">{reviews[0].next_focus || 'Not set'}</span></p>}
      </section>
    </div>
  )
}

function Panel({ icon: Icon, title, description, children, id }: { icon: typeof Search; title: string; description: string; children: React.ReactNode; id?: string }) {
  return <section id={id} className="card-premium rounded-2xl p-5 sm:p-6"><div className="flex gap-3 mb-5"><div className="w-9 h-9 rounded-md bg-bg-card border border-line flex items-center justify-center"><Icon className="w-4 h-4 text-accent" /></div><div><h2 className="font-display text-lg font-semibold text-fg">{title}</h2><p className="text-xs leading-relaxed text-fg-muted mt-1">{description}</p></div></div>{children}</section>
}

function Field({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`workspace-input ${className}`} />
}

function Submit({ label, disabled }: { label: string; disabled: boolean }) {
  return <button type="submit" disabled={disabled} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-fg text-bg hover:bg-fg/90 disabled:opacity-50 px-3 py-2 text-xs font-semibold"><Plus className="w-3.5 h-3.5" />{label}</button>
}

function EvidenceRow({ item }: { item: FounderEvidence }) {
  const tone = item.status === 'verified' ? 'text-signal-go border-signal-go/30 bg-signal-go/10' : item.status === 'assumption' ? 'text-signal-pivot border-signal-pivot/30 bg-signal-pivot/10' : 'text-signal-insight border-signal-insight/30 bg-signal-insight/10'
  return <div className="rounded-lg border border-line p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-fg">{item.title}</p><span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${tone}`}>{item.status}</span></div><p className="text-xs text-fg-muted leading-relaxed mt-1">{item.claim}</p><div className="flex flex-wrap gap-2 mt-2 text-[11px]">{item.source_url ? <a className="text-accent inline-flex items-center gap-1 hover:underline" href={item.source_url} target="_blank" rel="noreferrer">{item.source_title || 'Open source'}<ExternalLink className="w-3 h-3" /></a> : <span className="text-fg-faint">No source — treat as an assumption.</span>}<span className="text-fg-faint">Confidence: {item.confidence}</span></div></div>
}

function ExperimentRow({ item }: { item: FounderExperiment }) {
  return <div className="rounded-lg border border-line p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-fg">{item.title}</p><span className="text-[10px] font-mono uppercase text-fg-muted">{item.status}</span></div>{item.hypothesis && <p className="text-xs text-fg-muted mt-1">Hypothesis: {item.hypothesis}</p>}{item.success_metric && <p className="text-xs text-accent mt-1">Success: {item.success_metric}</p>}{item.resource_url && <a href={item.resource_url} target="_blank" rel="noreferrer" className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 mt-2">{item.resource_title || 'Open resource'}<ChevronRight className="w-3 h-3" /></a>}</div>
}

function Empty({ text }: { text: string }) { return <p className="rounded-lg bg-bg-sub border border-dashed border-line px-3 py-4 text-xs leading-relaxed text-fg-muted">{text}</p> }
