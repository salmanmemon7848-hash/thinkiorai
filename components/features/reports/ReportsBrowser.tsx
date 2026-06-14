'use client'

/**
 * THINKIOR — REPORTS BROWSER
 * ─────────────────────────────────────────────────────────────────
 * Searchable, filterable, sortable list of past reports. Per-row
 * share + open + delete. All client-side — no extra round trips
 * unless the user clicks a button.
 * ─────────────────────────────────────────────────────────────────
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  ArrowUpRight,
  Share2,
  Copy,
  Check,
  Trash2,
  Loader2,
  FileText,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ReportRow {
  id: string
  business_name: string | null
  report_type: string
  industry: string
  stage: string | null
  created_at: string
  share_enabled: boolean
  share_slug: string | null
}

type SortKey = 'newest' | 'oldest' | 'name'

export default function ReportsBrowser({ reports }: { reports: ReportRow[] }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [rows, setRows] = useState(reports)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Distinct report types for the filter chip row
  const types = useMemo(() => {
    const s = new Set<string>()
    for (const r of rows) s.add(r.report_type)
    return ['all', ...Array.from(s).sort()]
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = rows.filter((r) => {
      if (typeFilter !== 'all' && r.report_type !== typeFilter) return false
      if (!q) return true
      return (
        (r.business_name || '').toLowerCase().includes(q) ||
        r.report_type.toLowerCase().includes(q) ||
        r.industry.toLowerCase().includes(q)
      )
    })
    out = out.sort((a, b) => {
      if (sort === 'name') {
        return (a.business_name || '').localeCompare(b.business_name || '')
      }
      const at = new Date(a.created_at).getTime()
      const bt = new Date(b.created_at).getTime()
      return sort === 'oldest' ? at - bt : bt - at
    })
    return out
  }, [rows, query, typeFilter, sort])

  async function copyShareLink(r: ReportRow) {
    if (!r.share_enabled || !r.share_slug) return
    const url = `${window.location.origin}/share/report/${r.share_slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(r.id)
      setTimeout(() => setCopiedId(null), 1800)
    } catch {
      // user denied — silent
    }
  }

  async function deleteReport(r: ReportRow) {
    if (deletingId) return
    if (!confirm(`Delete "${r.business_name || r.report_type}"? This cannot be undone.`)) {
      return
    }
    setDeletingId(r.id)
    try {
      const res = await fetch(`/api/reports/${r.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }
      setRows((prev) => prev.filter((x) => x.id !== r.id))
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="card-premium rounded-lg p-3 mb-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px] bg-bg border border-line rounded-md px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-fg-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, type, or industry…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-fg placeholder:text-fg-faint outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[11px] text-fg-muted hover:text-fg"
            >
              Clear
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="bg-bg border border-line rounded-md px-2.5 py-1.5 text-[12.5px] text-fg-dim hover:text-fg outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">By name</option>
        </select>
      </div>

      {/* Type filter chips */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              'px-3 py-1 rounded-full text-[12px] font-medium border transition-colors whitespace-nowrap',
              typeFilter === t
                ? 'bg-accent/[0.08] text-accent border-accent/30'
                : 'bg-bg-card text-fg-dim border-line hover:border-line-strong hover:text-fg'
            )}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
        <p className="ml-auto text-[11px] text-fg-faint font-mono uppercase tracking-caps whitespace-nowrap">
          {filtered.length} of {rows.length}
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card-premium rounded-lg p-8 text-center">
          <p className="text-[13px] text-fg-dim">
            No reports match your filters. Try clearing the search.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <ReportRow
              key={r.id}
              r={r}
              copied={copiedId === r.id}
              deleting={deletingId === r.id}
              onCopy={() => copyShareLink(r)}
              onDelete={() => deleteReport(r)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReportRow({
  r,
  copied,
  deleting,
  onCopy,
  onDelete,
}: {
  r: ReportRow
  copied: boolean
  deleting: boolean
  onCopy: () => void
  onDelete: () => void
}) {
  return (
    <div className="card-premium rounded-lg p-4 flex items-center gap-4 hover:bg-bg-elevated transition-colors group">
      <Link
        href={`/reports/${r.id}`}
        className="flex items-center gap-4 flex-1 min-w-0"
      >
        <div className="w-9 h-9 rounded-md bg-bg-elevated border border-line flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-fg-dim group-hover:text-accent transition-colors" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-[14px] text-fg tracking-tight truncate">
              {r.business_name || 'Untitled'}
            </h3>
            <span className="text-[11px] text-fg-muted font-mono">
              · {r.report_type}
            </span>
            {r.share_enabled && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-signal-go/30 bg-signal-go/[0.06] text-signal-go text-[10px] font-mono uppercase tracking-caps">
                <Share2 className="w-2.5 h-2.5" />
                Public
              </span>
            )}
          </div>
          <p className="text-[12px] text-fg-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{r.industry}</span>
            <span>·</span>
            <span>{r.stage ?? 'Unspecified stage'}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(r.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1 flex-shrink-0">
        {r.share_enabled && (
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-fg-dim hover:text-fg px-2 py-1 rounded-md hover:bg-bg-elevated transition-colors"
            title="Copy public link"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-signal-go" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy link
              </>
            )}
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-fg-dim hover:text-signal-rose px-2 py-1 rounded-md hover:bg-bg-elevated transition-colors disabled:opacity-60"
          title="Delete report"
        >
          {deleting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
        </button>
        <Link
          href={`/reports/${r.id}`}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-fg-dim hover:text-fg px-2 py-1 rounded-md hover:bg-bg-elevated transition-colors"
        >
          Open
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
