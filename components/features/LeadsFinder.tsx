'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bookmark, BriefcaseBusiness, Building2, CheckCircle2, ChevronRight, ExternalLink,
  Globe2, Linkedin, Loader2, Mail, MessageSquareText, Search, Send, Sparkles,
  Trash2, UsersRound,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { requestedLeadCount } from '@/lib/leads/schema'
import type { FounderLead, LeadCandidate, LeadStage, LeadType } from '@/types'

type SearchResponse = { searchId: string; leads: LeadCandidate[]; summary: string }
type Draft = { channel: 'email' | 'linkedin'; subject: string | null; body: string }

const STAGES: Array<{ value: LeadStage; label: string }> = [
  { value: 'saved', label: 'Saved' }, { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' }, { value: 'not_a_fit', label: 'Not a fit' },
]

export default function LeadsFinder() {
  const [leadType, setLeadType] = useState<LeadType>('customer')
  const [query, setQuery] = useState('Find 10 B2B SaaS companies in the United Kingdom that may need faster employee onboarding.')
  const [results, setResults] = useState<LeadCandidate[]>([])
  const [searchId, setSearchId] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [savedLeads, setSavedLeads] = useState<FounderLead[]>([])
  const [selected, setSelected] = useState<LeadCandidate | FounderLead | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [drafting, setDrafting] = useState<'email' | 'linkedin' | null>(null)

  const loadSaved = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('founder_leads').select('*').order('updated_at', { ascending: false }).limit(50)
    setSavedLeads((data ?? []) as FounderLead[])
  }, [])

  useEffect(() => { loadSaved() }, [loadSaved])

  const selectedSaved = selected && 'id' in selected ? selected as FounderLead : null
  const existingSaved = selected && savedLeads.find((lead) => lead.name === selected.name && lead.lead_type === leadType)
  const requested = requestedLeadCount(query)
  const stageCounts = useMemo(() => STAGES.map((stage) => ({ ...stage, count: savedLeads.filter((lead) => lead.stage === stage.value).length })), [savedLeads])

  const runSearch = async (event: FormEvent) => {
    event.preventDefault()
    if (!requested) { setError('Include the number of leads you need, from 1 to 10.'); return }
    setLoading(true); setError(null); setDraft(null)
    try {
      const res = await fetch('/api/leads/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, leadType }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Search failed.')
      const response = data as SearchResponse
      setResults(response.leads); setSearchId(response.searchId); setSummary(response.summary)
      setSelected(response.leads[0] ?? null)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Search failed.') }
    finally { setLoading(false) }
  }

  const saveLead = async () => {
    if (!selected || existingSaved) return
    setSaving(true); setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sign in to save a lead.')
      const { data, error: saveError } = await supabase.from('founder_leads').insert({
        user_id: user.id, search_id: searchId, lead_type: leadType, name: selected.name,
        website: selected.website, location: selected.location, fit: selected.fit,
        confidence: selected.confidence, contact_path: selected.contactPath, contact_url: selected.contactUrl,
        evidence: selected.evidence, stage: 'saved',
      }).select('*').single()
      if (saveError || !data) throw new Error('Could not save this lead.')
      const saved = data as FounderLead
      setSelected(saved); await loadSaved()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save the lead.') }
    finally { setSaving(false) }
  }

  const updateSaved = async (patch: Partial<Pick<FounderLead, 'stage' | 'notes' | 'follow_up_at'>>) => {
    if (!selectedSaved) return
    setSaving(true)
    const { data, error: updateError } = await createClient().from('founder_leads').update(patch).eq('id', selectedSaved.id).select('*').single()
    setSaving(false)
    if (updateError || !data) { setError('Could not update this saved lead.'); return }
    setSelected(data as FounderLead); await loadSaved()
  }

  const deleteLead = async () => {
    if (!selectedSaved) return
    setSaving(true)
    const { error: deleteError } = await createClient().from('founder_leads').delete().eq('id', selectedSaved.id)
    setSaving(false)
    if (deleteError) { setError('Could not remove this lead.'); return }
    setSelected(null); setDraft(null); await loadSaved()
  }

  const createDraft = async (channel: 'email' | 'linkedin') => {
    if (!selectedSaved) { setError('Save this lead before drafting outreach.'); return }
    setDrafting(channel); setError(null)
    try {
      const res = await fetch('/api/leads/outreach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: selectedSaved.id, channel }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Could not draft outreach.')
      setDraft(data as Draft)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not draft outreach.') }
    finally { setDrafting(null) }
  }

  return <div className="space-y-5 animate-fade-in">
    <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 border-b border-line pb-5">
      <div><h1 className="font-display text-3xl font-bold tracking-tight text-fg">Leads Finder</h1><p className="text-sm text-fg-dim mt-1">Find the next people worth talking to.</p></div>
      <div className="inline-flex rounded-md border border-line bg-bg-card p-0.5 self-start lg:self-auto">
        <Tab active={leadType === 'customer'} onClick={() => setLeadType('customer')} icon={Building2} label="Customers" />
        <Tab active={leadType === 'investor'} onClick={() => setLeadType('investor')} icon={BriefcaseBusiness} label="Investors" />
      </div>
    </header>

    <form onSubmit={runSearch} className="rounded-xl border border-line bg-bg-sub p-3 flex flex-col md:flex-row gap-3">
      <div className="flex-1 flex items-start gap-3 px-2 py-2"><MessageSquareText className="w-5 h-5 text-fg-muted mt-0.5 flex-shrink-0" /><textarea value={query} onChange={(event) => setQuery(event.target.value)} rows={2} className="min-h-[50px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-fg outline-none placeholder:text-fg-muted" placeholder="Find 10 B2B customer or investor leads…" /></div>
      <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"><Search className="w-4 h-4" />{loading ? 'Researching…' : 'Search leads'}</button>
    </form>
    <div className="flex flex-wrap items-center gap-3 text-xs text-fg-muted"><span>{leadType === 'customer' ? 'Customers' : 'Investors'}</span><span>•</span><span>Request 1–10 leads</span>{requested && <><span>•</span><span className="text-accent">Requesting {requested}</span></>}</div>
    {error && <div className="rounded-lg border border-signal-rose/30 bg-signal-rose/10 px-4 py-3 text-sm text-fg">{error}</div>}
    {summary && <div className="rounded-lg border border-accent/25 bg-accent/[0.05] px-4 py-3 text-sm text-fg-dim">{summary}</div>}

    <section className="grid 2xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
      <div className="overflow-hidden rounded-xl border border-line bg-bg-sub">
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead className="border-b border-line bg-bg-card text-[10px] font-mono uppercase tracking-caps text-fg-muted"><tr><th className="px-4 py-3 font-medium">Company / fund</th><th className="px-4 py-3 font-medium">Why this fits</th><th className="px-4 py-3 font-medium">Evidence</th><th className="px-4 py-3 font-medium">Contact path</th><th className="px-4 py-3 font-medium">Action</th></tr></thead><tbody>
          {results.length ? results.map((lead) => <LeadRow key={lead.name} lead={lead} active={selected?.name === lead.name && !selectedSaved} saved={savedLeads.some((saved) => saved.name === lead.name && saved.lead_type === leadType)} onSelect={() => { setSelected(lead); setDraft(null) }} />) : <tr><td colSpan={5} className="px-5 py-16 text-center"><UsersRound className="w-5 h-5 text-fg-faint mx-auto mb-3" /><p className="text-sm text-fg-muted">Describe the people you want to reach, including a count from 1 to 10.</p></td></tr>}
        </tbody></table></div>
        {results.length > 0 && <div className="border-t border-line px-4 py-3 text-xs text-fg-muted">Showing {results.length} of {requested ?? results.length} requested leads. Every result needs evidence; fewer results are better than invented ones.</div>}
      </div>

      <aside className="rounded-xl border border-line bg-bg-sub overflow-hidden 2xl:sticky 2xl:top-5">
        {selected ? <LeadDetail lead={selected} saved={selectedSaved || existingSaved || null} saving={saving} draft={draft} drafting={drafting} onSave={saveLead} onStage={(stage) => updateSaved({ stage })} onNotes={(notes) => updateSaved({ notes })} onFollowUp={(follow_up_at) => updateSaved({ follow_up_at })} onDelete={deleteLead} onDraft={createDraft} /> : <div className="p-6 text-sm text-fg-muted">Select a result to review its sources and contact path.</div>}
        <div className="border-t border-line p-4"><p className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mb-3">Saved leads</p><div className="grid grid-cols-4 gap-1.5">{stageCounts.map((stage) => <div key={stage.value} className="rounded-md border border-line bg-bg-card p-2"><p className="text-[10px] text-fg-muted leading-tight">{stage.label}</p><p className="text-base font-semibold text-fg mt-1">{stage.count}</p></div>)}</div></div>
      </aside>
    </section>
  </div>
}

function Tab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Building2; label: string }) { return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-bg-elevated text-accent shadow-sm' : 'text-fg-muted hover:text-fg'}`}><Icon className="w-3.5 h-3.5" />{label}</button> }

function LeadRow({ lead, active, saved, onSelect }: { lead: LeadCandidate; active: boolean; saved: boolean; onSelect: () => void }) { const evidence = lead.evidence[0]; return <tr onClick={onSelect} className={`cursor-pointer border-b border-line last:border-0 transition-colors ${active ? 'bg-accent/[0.06]' : 'hover:bg-bg-card/80'}`}><td className="px-4 py-3.5"><div className="flex gap-2.5 items-center"><div className="w-8 h-8 rounded bg-bg-card border border-line flex items-center justify-center text-xs font-semibold text-accent">{lead.name.slice(0, 2).toUpperCase()}</div><div><p className="text-sm font-medium text-fg">{lead.name}</p><p className="text-[11px] text-fg-muted">{lead.location || 'Location not stated'}</p></div></div></td><td className="px-4 py-3.5 max-w-[280px]"><p className="text-xs leading-relaxed text-fg-dim line-clamp-3">{lead.fit}</p></td><td className="px-4 py-3.5 max-w-[220px]"><a href={evidence?.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-accent hover:underline line-clamp-2">{evidence?.title || 'Open source'}<ExternalLink className="w-3 h-3 flex-shrink-0" /></a><p className="text-[10px] text-fg-faint mt-1">Retrieved {evidence ? new Date(evidence.retrievedAt).toLocaleDateString() : 'today'}</p></td><td className="px-4 py-3.5"><span className="inline-flex items-center gap-1.5 text-xs text-fg-dim">{lead.contactPath.toLowerCase().includes('linkedin') ? <Linkedin className="w-3.5 h-3.5 text-accent" /> : <Globe2 className="w-3.5 h-3.5 text-accent" />}{lead.contactPath}</span></td><td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs ${saved ? 'border-signal-go/30 text-signal-go bg-signal-go/10' : 'border-line text-fg-muted'}`}>{saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}{saved ? 'Saved' : 'Review'}</span></td></tr> }

function LeadDetail({ lead, saved, saving, draft, drafting, onSave, onStage, onNotes, onFollowUp, onDelete, onDraft }: { lead: LeadCandidate | FounderLead; saved: FounderLead | null; saving: boolean; draft: Draft | null; drafting: 'email' | 'linkedin' | null; onSave: () => void; onStage: (stage: LeadStage) => void; onNotes: (notes: string) => void; onFollowUp: (date: string | null) => void; onDelete: () => void; onDraft: (channel: 'email' | 'linkedin') => void }) {
  const sourceBacked = lead.confidence === 'source_backed'
  return <div className="p-5 space-y-5"><div className="flex items-start justify-between gap-3"><div><p className="font-display text-xl font-semibold text-fg">{lead.name}</p><p className="text-xs text-fg-muted mt-1">{lead.location || 'Location not stated'}</p></div><span className={`text-[10px] font-mono uppercase tracking-caps rounded border px-2 py-1 ${sourceBacked ? 'border-signal-go/30 bg-signal-go/10 text-signal-go' : 'border-signal-pivot/30 bg-signal-pivot/10 text-signal-pivot'}`}>{sourceBacked ? 'Source-backed' : 'AI-inferred'}</span></div>
    <div><p className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mb-2">Why this fits</p><p className="text-sm leading-relaxed text-fg-dim">{lead.fit}</p></div>
    <div><p className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mb-2">Evidence</p><ul className="space-y-3">{lead.evidence.map((item) => <li key={item.url + item.fact} className="text-xs leading-relaxed text-fg-dim"><p>{item.fact}</p><a href={item.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-accent hover:underline">{item.title}<ExternalLink className="w-3 h-3" /></a><p className="text-[10px] text-fg-faint mt-0.5">Retrieved {new Date(item.retrievedAt).toLocaleDateString()}</p></li>)}</ul></div>
    <div><p className="text-[10px] font-mono uppercase tracking-caps text-fg-muted mb-2">Public contact path</p>{lead.contactUrl ? <a href={lead.contactUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"><Globe2 className="w-4 h-4" />{lead.contactPath}<ExternalLink className="w-3 h-3" /></a> : <p className="text-sm text-fg-dim">{lead.contactPath}</p>}</div>
    {!saved ? <button onClick={onSave} disabled={saving} className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-accent py-2.5 text-sm font-semibold text-bg disabled:opacity-50"><Bookmark className="w-4 h-4" />{saving ? 'Saving…' : 'Save lead'}</button> : <><div className="grid grid-cols-2 gap-2"><button onClick={() => onDraft('email')} disabled={!!drafting} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-fg text-bg py-2 text-xs font-semibold disabled:opacity-50">{drafting === 'email' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}Email</button><button onClick={() => onDraft('linkedin')} disabled={!!drafting} className="inline-flex items-center justify-center gap-1.5 rounded-md border border-accent/50 text-accent py-2 text-xs font-semibold disabled:opacity-50">{drafting === 'linkedin' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}LinkedIn</button></div><div className="grid grid-cols-2 gap-2"><select value={saved.stage} onChange={(event) => onStage(event.target.value as LeadStage)} className="workspace-input text-xs py-2"><option value="saved">Saved</option><option value="contacted">Contacted</option><option value="replied">Replied</option><option value="not_a_fit">Not a fit</option></select><input type="date" value={saved.follow_up_at || ''} onChange={(event) => onFollowUp(event.target.value || null)} className="workspace-input text-xs py-2" /></div><textarea defaultValue={saved.notes || ''} onBlur={(event) => onNotes(event.target.value)} placeholder="Notes for your next conversation" className="workspace-input min-h-20 resize-y text-xs" /><button onClick={onDelete} disabled={saving} className="inline-flex items-center gap-1.5 text-xs text-signal-rose hover:underline"><Trash2 className="w-3.5 h-3.5" />Remove lead</button></>}
    {draft && <div className="rounded-lg border border-accent/30 bg-accent/[0.05] p-3"><p className="text-[10px] font-mono uppercase tracking-caps text-accent mb-2">{draft.channel} draft — send manually</p>{draft.subject && <p className="text-xs font-medium text-fg mb-2">Subject: {draft.subject}</p>}<p className="whitespace-pre-wrap text-xs leading-relaxed text-fg-dim">{draft.body}</p></div>}
  </div>
}
