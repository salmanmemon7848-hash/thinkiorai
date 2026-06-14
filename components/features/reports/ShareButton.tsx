'use client'

/**
 * THINKIOR — REPORT SHARE BUTTON
 * ─────────────────────────────────────────────────────────────────
 * Toggles a public read-only link for a report. Renders inline in
 * the report viewer's toolbar.
 *
 * State machine: idle → loading → enabled | disabled | error
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import {
  Share2,
  Copy,
  Check,
  Loader2,
  Link as LinkIcon,
  EyeOff,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ShareButtonProps {
  reportId: string
  initialEnabled: boolean
  initialSlug: string | null
}

export default function ShareButton({
  reportId,
  initialEnabled,
  initialSlug,
}: ShareButtonProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [slug, setSlug] = useState<string | null>(initialSlug)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const shareUrl =
    slug && typeof window !== 'undefined'
      ? `${window.location.origin}/share/report/${slug}`
      : null

  async function toggle() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      if (enabled) {
        const res = await fetch(`/api/reports/${reportId}/share`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Could not disable sharing')
        setEnabled(false)
        setOpen(false)
      } else {
        const res = await fetch(`/api/reports/${reportId}/share`, {
          method: 'POST',
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not enable sharing')
        setEnabled(true)
        setSlug(data.shareSlug)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Could not copy link to clipboard.')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1.5 text-[12.5px] font-medium px-3 py-1.5 rounded-md transition-colors',
          enabled
            ? 'bg-signal-go/[0.08] text-signal-go border border-signal-go/30 hover:bg-signal-go/[0.12]'
            : 'text-fg-dim hover:text-fg border border-line hover:border-line-strong'
        )}
      >
        {enabled ? (
          <>
            <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
            Shared
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            Share
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 card-premium rounded-lg p-4 z-20 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-3.5 h-3.5 text-accent" />
            <p className="eyebrow text-accent">Public link</p>
          </div>

          {!enabled ? (
            <>
              <p className="text-[13px] text-fg-dim leading-relaxed mb-3">
                Generate a read-only link anyone can open. Useful for sharing
                with co-founders, investors, or your team.
              </p>
              <button
                onClick={toggle}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-accent text-bg hover:bg-accent-hover font-semibold text-[12.5px] px-3 py-2 rounded-md transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Enabling…
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    Enable sharing
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <p className="text-[12px] text-fg-dim leading-relaxed mb-2.5">
                Anyone with this link can view the report.
              </p>
              <div className="flex items-center gap-1.5 mb-3">
                <input
                  readOnly
                  value={shareUrl ?? ''}
                  onClick={(e) => e.currentTarget.select()}
                  className="flex-1 min-w-0 bg-bg border border-line rounded-md px-2.5 py-1.5 text-[11.5px] text-fg font-mono"
                />
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-1 text-[11.5px] font-medium text-fg-dim hover:text-fg bg-bg-elevated border border-line px-2.5 py-1.5 rounded-md transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-signal-go" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                {shareUrl && (
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-[11.5px] text-accent hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in new tab
                  </a>
                )}
                <button
                  onClick={toggle}
                  disabled={loading}
                  className="ml-auto inline-flex items-center gap-1 text-[11.5px] text-signal-rose hover:underline disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                  Disable
                </button>
              </div>
            </>
          )}

          {error && (
            <p className="text-[11.5px] text-signal-rose mt-2.5 leading-relaxed">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
