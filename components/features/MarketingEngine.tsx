'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, ChevronRight, Clipboard, Film, Image, Instagram, Linkedin, Loader2, Megaphone, PlaySquare, Plus, Share2, Sparkles, Target, ThumbsUp, TrendingUp, Youtube } from 'lucide-react'
import { useUsage } from '@/hooks/useUsage'
import type { MarketingContentPack, MarketingPackStatus, MarketingPlatform, MarketingProfile, MarketingReview, MarketingRoadmap } from '@/types'

type Workspace = { profile: MarketingProfile | null; roadmaps: MarketingRoadmap[]; packs: MarketingContentPack[]; reviews: MarketingReview[] }
type Brief = { businessName: string; offer: string; audience: string; country: string; goal: string; capacity: string; stage: string; currentChannels: string; platforms: MarketingPlatform[] }

const PLATFORM: Record<MarketingPlatform, { label: string; icon: typeof Instagram; color: string }> = {
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
  facebook: { label: 'Facebook', icon: Share2, color: 'text-blue-400' },
  youtube: { label: 'YouTube', icon: Youtube, color: 'text-red-400' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'text-sky-400' },
}
const STATUS: MarketingPackStatus[] = ['planned', 'created', 'published', 'learned']
const DEFAULT_BRIEF: Brief = { businessName: '', offer: '', audience: '', country: '', goal: 'Get first customers', capacity: '3–5 hours per week', stage: 'Pre-launch', currentChannels: '', platforms: ['instagram', 'linkedin'] }

export default function MarketingEngine() {
  const [workspace, setWorkspace] = useState<Workspace>({ profile: null, roadmaps: [], packs: [], reviews: [] })
  const [brief, setBrief] = useState<Brief>(DEFAULT_BRIEF)
  const [selected, setSelected] = useState<MarketingContentPack | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { usage, refetch: refetchUsage } = useUsage('marketing')

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/marketing')
      if (!response.ok) return
      const data = await response.json() as Workspace
      setWorkspace(data)
      if (data.profile) setBrief({
        businessName: data.profile.business_name || '', offer: data.profile.offer, audience: data.profile.audience, country: data.profile.country,
        goal: data.profile.goal, capacity: data.profile.capacity, stage: data.profile.stage, currentChannels: data.profile.current_channels || '', platforms: data.profile.platforms,
      })
      setSelected((current) => current ? (data.packs.find((pack) => pack.id === current.id) || data.packs[0] || null) : (data.packs[0] || null))
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const roadmap = workspace.roadmaps[0] || null
  const review = workspace.reviews[0] || null
  const schedule = useMemo(() => workspace.packs.filter((pack) => !roadmap || pack.roadmap_id === roadmap.id), [workspace.packs, roadmap])

  const createStrategy = async (event: FormEvent) => {
    event.preventDefault(); setGenerating(true); setError(null); setNotice(null)
    try {
      const response = await fetch('/api/marketing/strategy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(brief) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not create your strategy.')
      setNotice('Your strategy and weekly focus are ready. Create a content pack to start the schedule.')
      await load(); refetchUsage()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create your strategy.') } finally { setGenerating(false) }
  }

  const createPack = async (platform: MarketingPlatform, contentType: string, objective: string) => {
    setGenerating(true); setError(null); setNotice(null)
    try {
      const response = await fetch('/api/marketing/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roadmapId: roadmap?.id || null, platform, contentType, objective }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not create a content pack.')
      setSelected(data.pack as MarketingContentPack); setNotice('Content pack created. Review it, make it yours, then publish manually.')
      await load(); refetchUsage()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create a content pack.') } finally { setGenerating(false) }
  }

  const updatePack = async (patch: Record<string, unknown>) => {
    if (!selected) return
    setSaving(true); setError(null)
    try {
      const response = await fetch('/api/marketing/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, ...patch }) })
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not update the content pack.')
      setSelected(data.pack as MarketingContentPack); await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update the content pack.') } finally { setSaving(false) }
  }

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setGenerating(true); setError(null); setNotice(null)
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/marketing/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roadmapId: roadmap?.id || null, views: form.get('views'), engagement: form.get('engagement'), leads: form.get('leads'), sales: form.get('sales'), notes: form.get('notes') }) })
      const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Could not save this review.')
      setNotice(`Weekly review saved. Next priority: ${data.review.next_priority}`); event.currentTarget.reset(); await load()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save this review.') } finally { setGenerating(false) }
  }

  const copy = async (text: string) => { await navigator.clipboard.writeText(text); setNotice('Copied. Paste it into your image AI and create the poster manually.') }

  if (loading) return <div className="h-[500px] rounded-xl border border-line bg-bg-sub animate-pulse" />
  if (!workspace.profile) return <Setup brief={brief} setBrief={setBrief} onSubmit={createStrategy} busy={generating} error={error} />

  return <div className="space-y-5 animate-fade-in">
    <header className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 border-b border-line pb-5">
      <div><h1 className="font-display text-3xl font-bold tracking-tight text-fg">Marketing Engine</h1><p className="text-sm text-fg-dim mt-1">Your weekly social-media roadmap, built for your business—not a promise of virality.</p></div>
      <div className="flex items-center gap-2 text-xs text-fg-muted border border-line rounded-md px-3 py-2 bg-bg-card self-start"><Sparkles className="w-3.5 h-3.5 text-accent" />{usage ? `${usage.remaining}/${usage.limit} content packs ${usage.period === 'lifetime' ? 'in your Starter Pack' : 'left today'}` : 'Loading your allowance'}</div>
    </header>
    {error && <Notice tone="error">{error}</Notice>}{notice && <Notice>{notice}</Notice>}
    <section className="border border-line rounded-xl bg-bg-sub p-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
      <div className="min-w-0"><p className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mb-1">This week&apos;s focus</p><p className="text-sm text-fg leading-relaxed">{String(roadmap?.strategy?.weeklyFocus || roadmap?.objective || 'Create your first weekly roadmap.')}</p></div>
      <button type="button" onClick={() => createStrategy(new Event('submit') as unknown as FormEvent)} disabled={generating} className="self-start lg:self-auto inline-flex items-center gap-2 border border-accent/40 text-accent px-3.5 py-2 rounded-md text-xs font-semibold hover:bg-accent/[0.08] disabled:opacity-50"><TrendingUp className="w-3.5 h-3.5" />{generating ? 'Working…' : 'Update roadmap'}</button>
    </section>
    <section className="grid 2xl:grid-cols-[minmax(0,1fr)_430px] gap-4 items-start">
      <div className="space-y-4 min-w-0">
        <div className="overflow-hidden rounded-xl border border-line bg-bg-sub">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between"><div><h2 className="font-display font-semibold text-base text-fg">This week</h2><p className="text-xs text-fg-muted mt-0.5">Plan the work, then create and publish it yourself.</p></div><CalendarDays className="w-4 h-4 text-fg-muted" /></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead className="border-b border-line bg-bg-card text-[10px] font-mono uppercase tracking-caps text-fg-muted"><tr><th className="px-4 py-3 font-medium">Platform</th><th className="px-4 py-3 font-medium">Content</th><th className="px-4 py-3 font-medium">Objective</th><th className="px-4 py-3 font-medium">Scheduled</th><th className="px-4 py-3 font-medium">Status</th></tr></thead><tbody>
            {schedule.length ? schedule.map((pack) => <PackRow key={pack.id} pack={pack} active={selected?.id === pack.id} onClick={() => setSelected(pack)} />) : <tr><td colSpan={5} className="px-5 py-14 text-center"><Megaphone className="w-5 h-5 text-fg-faint mx-auto mb-3"/><p className="text-sm text-fg-muted">Create your first content pack to fill this week&apos;s schedule.</p></td></tr>}
          </tbody></table></div>
        </div>
        <div className="rounded-xl border border-line bg-bg-sub p-4"><div className="flex items-center justify-between gap-4 mb-3"><div><h2 className="font-display font-semibold text-base text-fg">Create content</h2><p className="text-xs text-fg-muted mt-0.5">Each pack includes a draft, filming guide, caption, and poster prompt.</p></div><Plus className="w-4 h-4 text-accent" /></div><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
          {workspace.profile.platforms.map((platform) => <button key={platform} onClick={() => createPack(platform, platform === 'youtube' ? 'Short' : platform === 'instagram' ? 'Reel' : 'Founder post', workspace.profile!.goal)} disabled={generating} className="border border-line hover:border-accent/50 hover:bg-accent/[0.05] text-left rounded-md p-3 transition-colors disabled:opacity-50"><PlatformLine platform={platform}/><p className="text-[11px] text-fg-dim mt-2">Create a {platform === 'youtube' ? 'Short' : platform === 'instagram' ? 'Reel' : 'post'}</p></button>)}
        </div></div>
        <form onSubmit={submitReview} className="rounded-xl border border-line bg-bg-sub overflow-hidden"><div className="px-4 py-3 border-b border-line flex items-center gap-2"><ThumbsUp className="w-4 h-4 text-accent"/><div><h2 className="font-display font-semibold text-base text-fg">Weekly review</h2><p className="text-xs text-fg-muted mt-0.5">Enter simple founder-reported results. Thinkior will suggest one next priority.</p></div></div><div className="p-4 grid sm:grid-cols-4 gap-2"><Metric name="views" label="Views"/><Metric name="engagement" label="Engagement"/><Metric name="leads" label="Leads"/><Metric name="sales" label="Sales"/><textarea name="notes" placeholder="What did you notice? (optional)" className="workspace-input min-h-20 resize-y sm:col-span-3"/><button disabled={generating || !roadmap} className="bg-accent text-bg rounded-md text-xs font-semibold px-3 py-2 hover:bg-accent-hover disabled:opacity-50">{generating ? 'Reviewing…' : 'Update next week'}</button></div>{review?.next_priority && <p className="px-4 pb-4 text-xs text-fg-dim">Latest priority: <span className="text-fg">{review.next_priority}</span></p>}</form>
      </div>
      <aside className="rounded-xl border border-line bg-bg-sub overflow-hidden 2xl:sticky 2xl:top-5">
        {selected ? <Detail pack={selected} saving={saving} onStatus={(status) => updatePack({ status })} onSchedule={(scheduledFor) => updatePack({ scheduledFor })} onCopy={copy} /> : <div className="p-6 text-sm text-fg-muted">Select a content pack to see its complete manual creation kit.</div>}
      </aside>
    </section>
  </div>
}

function Setup({ brief, setBrief, onSubmit, busy, error }: { brief: Brief; setBrief: (brief: Brief) => void; onSubmit: (event: FormEvent) => void; busy: boolean; error: string | null }) {
  const set = (key: keyof Brief, value: string | MarketingPlatform[]) => setBrief({ ...brief, [key]: value })
  const toggle = (platform: MarketingPlatform) => set('platforms', brief.platforms.includes(platform) ? brief.platforms.filter((item) => item !== platform) : [...brief.platforms, platform])
  return <form onSubmit={onSubmit} className="max-w-4xl mx-auto space-y-5 animate-fade-in"><header className="border-b border-line pb-5"><h1 className="font-display text-3xl font-bold tracking-tight text-fg">Marketing Engine</h1><p className="text-sm text-fg-dim mt-1">Answer a few focused questions. Thinkior will create your strategy and first seven-day roadmap.</p></header>{error && <Notice tone="error">{error}</Notice>}<div className="grid md:grid-cols-2 gap-4"><Field label="Business name" value={brief.businessName} onChange={(v) => set('businessName', v)} placeholder="What are you building?"/><Field label="Offer" value={brief.offer} onChange={(v) => set('offer', v)} placeholder="What do customers get?"/><Field label="Audience" value={brief.audience} onChange={(v) => set('audience', v)} placeholder="Who is this for?"/><Field label="Country / market" value={brief.country} onChange={(v) => set('country', v)} placeholder="Where are you selling?"/><Option label="Primary goal" value={brief.goal} options={['Get first customers', 'Build awareness', 'Grow a waitlist', 'Increase sales']} onChange={(v) => set('goal', v)}/><Option label="Founder capacity" value={brief.capacity} options={['1–2 hours per week', '3–5 hours per week', '6–10 hours per week']} onChange={(v) => set('capacity', v)}/><Option label="Business stage" value={brief.stage} options={['Pre-launch', 'Launched, no revenue', 'Early revenue']} onChange={(v) => set('stage', v)}/><Field label="Current channels (optional)" value={brief.currentChannels} onChange={(v) => set('currentChannels', v)} placeholder="e.g. Instagram, no posting yet"/></div><div className="rounded-xl border border-line bg-bg-sub p-4"><p className="text-sm font-medium text-fg">Choose social platforms</p><p className="text-xs text-fg-muted mt-1">Pick where you can realistically show up. You can change this later.</p><div className="grid sm:grid-cols-4 gap-2 mt-4">{(Object.keys(PLATFORM) as MarketingPlatform[]).map((platform) => <button key={platform} type="button" onClick={() => toggle(platform)} className={`rounded-md border px-3 py-3 text-left transition-colors ${brief.platforms.includes(platform) ? 'border-accent bg-accent/[0.08]' : 'border-line hover:border-line-strong'}`}><PlatformLine platform={platform}/></button>)}</div></div><button disabled={busy || brief.platforms.length === 0} className="inline-flex items-center gap-2 bg-accent text-bg rounded-md px-5 py-3 text-sm font-semibold hover:bg-accent-hover disabled:opacity-50">{busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}{busy ? 'Creating your roadmap…' : 'Create my Starter Pack'}</button><p className="text-xs text-fg-muted">Your Starter Pack includes one strategy, a seven-day roadmap, and three content packs. Thinkior recommends; you review and publish manually.</p></form>
}

function PackRow({ pack, active, onClick }: { pack: MarketingContentPack; active: boolean; onClick: () => void }) { const info = PLATFORM[pack.platform]; const Icon = info.icon; return <tr onClick={onClick} className={`cursor-pointer border-b border-line last:border-0 ${active ? 'bg-accent/[0.06]' : 'hover:bg-bg-card/80'}`}><td className="px-4 py-3.5"><span className="inline-flex items-center gap-2 text-xs font-medium text-fg"><Icon className={`w-4 h-4 ${info.color}`}/>{info.label}</span></td><td className="px-4 py-3.5"><p className="text-xs text-fg">{pack.content_type}</p><p className="text-[11px] text-fg-muted mt-0.5 line-clamp-1">{pack.title}</p></td><td className="px-4 py-3.5 text-xs text-fg-dim max-w-52">{pack.objective}</td><td className="px-4 py-3.5 text-xs text-fg-dim">{pack.scheduled_for ? new Date(pack.scheduled_for).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : 'Choose time'}</td><td className="px-4 py-3.5"><span className="text-[10px] font-mono uppercase tracking-caps text-accent">{pack.status}</span></td></tr> }
function Detail({ pack, saving, onStatus, onSchedule, onCopy }: { pack: MarketingContentPack; saving: boolean; onStatus: (status: MarketingPackStatus) => void; onSchedule: (date: string | null) => void; onCopy: (text: string) => void }) { const c = pack.content; const info = PLATFORM[pack.platform]; const Icon = info.icon; return <div className="p-5 space-y-5"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-lg border border-line bg-bg-card flex items-center justify-center"><Icon className={`w-5 h-5 ${info.color}`}/></div><div className="min-w-0 flex-1"><p className="font-display text-lg font-semibold text-fg">{pack.title}</p><p className="text-xs text-fg-muted mt-1">{info.label} {pack.content_type} · draft for founder review</p></div></div><select value={pack.status} disabled={saving} onChange={(event) => onStatus(event.target.value as MarketingPackStatus)} className="workspace-input text-xs"><option value="planned">Planned</option><option value="created">Created</option><option value="published">Published</option><option value="learned">Learned</option></select><input type="datetime-local" value={pack.scheduled_for ? new Date(pack.scheduled_for).toISOString().slice(0, 16) : ''} onChange={(event) => onSchedule(event.target.value ? new Date(event.target.value).toISOString() : null)} className="workspace-input text-xs"/><Content title="Hook" text={c.hook}/><Content title="Script" text={c.script}/><Content title="Shot guide" text={c.shotGuide}/><Content title="Caption + CTA" text={`${c.caption}\n\nCTA: ${c.cta}`}/><Content title="Why this is worth testing" text={c.rationale}/><Content title="Publish window" text={c.publishWindow}/><div className="rounded-lg border border-accent/30 bg-accent/[0.05] p-3"><div className="flex items-center justify-between gap-3 mb-2"><p className="text-[10px] font-mono uppercase tracking-caps text-accent">AI poster prompt</p><button onClick={() => onCopy(c.posterPrompt || '')} className="inline-flex items-center gap-1 text-xs text-accent hover:underline"><Clipboard className="w-3 h-3"/>Copy</button></div><p className="whitespace-pre-wrap text-xs leading-relaxed text-fg-dim">{c.posterPrompt}</p><p className="text-[10px] text-fg-muted mt-3">Paste into an image AI. No auto-publish.</p></div></div> }
function Content({ title, text }: { title: string; text: string | undefined }) { return <div><p className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mb-2">{title}</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-dim">{text || 'Not available'}</p></div> }
function PlatformLine({ platform }: { platform: MarketingPlatform }) { const { label, icon: Icon, color } = PLATFORM[platform]; return <span className="inline-flex items-center gap-2 text-xs font-medium text-fg"><Icon className={`w-4 h-4 ${color}`}/>{label}</span> }
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="space-y-1.5"><span className="text-xs text-fg-dim">{label}</span><input required={label !== 'Current channels (optional)'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="workspace-input"/></label> }
function Option({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="space-y-1.5"><span className="text-xs text-fg-dim">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="workspace-input">{options.map((option) => <option key={option}>{option}</option>)}</select></label> }
function Metric({ name, label }: { name: string; label: string }) { return <label><span className="text-[10px] font-mono uppercase tracking-caps text-fg-muted">{label}</span><input name={name} type="number" min="0" defaultValue="0" className="workspace-input mt-1 text-sm"/></label> }
function Notice({ children, tone = 'normal' }: { children: React.ReactNode; tone?: 'normal' | 'error' }) { return <div className={`rounded-lg border px-4 py-3 text-sm ${tone === 'error' ? 'border-signal-rose/30 bg-signal-rose/10 text-fg' : 'border-accent/30 bg-accent/[0.06] text-fg-dim'}`}>{children}</div> }
