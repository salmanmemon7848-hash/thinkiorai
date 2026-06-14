'use client'

/**
 * THINKIOR — REPORT NOT FOUND
 * ─────────────────────────────────────────────────────────────────
 * Replaces a generic 404 with a clear, branded page that tells
 * the founder WHAT happened and what to do next. Three reasons:
 *
 *   - missing:    row doesn't exist (or RLS hid it)
 *   - wrong_owner: row exists but belongs to a different account
 *   - query_error: real DB error, logged server-side
 *
 * In all three cases, the CTA is "generate a new report" — the
 * fastest way out. There's also a "back to dashboard" fallback.
 * ─────────────────────────────────────────────────────────────────
 */

import Link from 'next/link'
import {
  FileX2,
  ShieldAlert,
  Database,
  ArrowRight,
  Home,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type Reason = 'missing' | 'wrong_owner' | 'query_error'

const REASON_META: Record<
  Reason,
  {
    badge: string
    title: string
    sub: string
    icon: typeof FileX2
    tone: 'rose' | 'pivot' | 'violet'
  }
> = {
  missing: {
    badge: 'Not found',
    title: 'We couldn’t find that report.',
    sub: 'It may have been deleted, never finished generating, or the link is wrong. The fastest fix: generate a fresh report.',
    icon: FileX2,
    tone: 'rose',
  },
  wrong_owner: {
    badge: 'Different account',
    title: 'This report belongs to a different account.',
    sub: 'You’re signed in as a different user than the one who generated it. The most common cause is signing up again with a new email — your old reports still exist but on the other account. Sign out, sign back in with the original email, or just generate a new one here.',
    icon: ShieldAlert,
    tone: 'pivot',
  },
  query_error: {
    badge: 'Temporary error',
    title: 'We hit a temporary error loading this report.',
    sub: 'It’s a database hiccup on our side. Try again in a few seconds. If it keeps failing, generate a new report.',
    icon: Database,
    tone: 'violet',
  },
}

const TONE_CLS: Record<Reason, { wrap: string; icon: string; badge: string }> = {
  missing: {
    wrap: 'border-signal-rose/30 bg-signal-rose/[0.04]',
    icon: 'text-signal-rose',
    badge: 'text-signal-rose border-signal-rose/30 bg-signal-rose/[0.08]',
  },
  wrong_owner: {
    wrap: 'border-signal-pivot/30 bg-signal-pivot/[0.04]',
    icon: 'text-signal-pivot',
    badge: 'text-signal-pivot border-signal-pivot/30 bg-signal-pivot/[0.08]',
  },
  query_error: {
    wrap: 'border-signal-violet/30 bg-signal-violet/[0.04]',
    icon: 'text-signal-violet',
    badge: 'text-signal-violet border-signal-violet/30 bg-signal-violet/[0.08]',
  },
}

export default function ReportNotFound({
  reason,
  reportId,
}: {
  reason: Reason
  reportId: string
}) {
  const meta = REASON_META[reason]
  const tone = TONE_CLS[reason]
  const Icon = meta.icon

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg transition-colors"
      >
        ← All reports
      </Link>

      <div className={cn('card-premium rounded-2xl border p-8 sm:p-10', tone.wrap)}>
        <div className="flex items-center gap-2 mb-4">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10.5px] font-mono uppercase tracking-caps font-semibold',
              tone.badge
            )}
          >
            <Icon className="w-3 h-3" strokeWidth={2.25} />
            {meta.badge}
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl md:text-3xl text-fg tracking-tighter leading-tight mb-2.5 max-w-2xl">
          {meta.title}
        </h1>
        <p className="text-[14px] text-fg-dim leading-relaxed max-w-2xl mb-6">
          {meta.sub}
        </p>

        {reason === 'wrong_owner' && (
          <div className="card-premium rounded-md p-4 mb-6 max-w-2xl">
            <p className="text-[10.5px] font-mono uppercase tracking-caps text-fg-muted mb-2">
              Quick diagnostic
            </p>
            <ol className="text-[12.5px] text-fg-dim leading-relaxed space-y-1.5 list-decimal pl-4">
              <li>
                Open your Supabase dashboard → <span className="text-fg font-mono">SQL Editor</span>
              </li>
              <li>
                Run:{' '}
                <code className="text-[11.5px] bg-bg-elevated px-1.5 py-0.5 rounded border border-line font-mono text-fg">
                  SELECT id, user_id, business_name, created_at FROM public.business_reports ORDER
                  BY created_at DESC LIMIT 5;
                </code>
              </li>
              <li>
                Compare the report&apos;s <code className="font-mono">user_id</code> to your
                current <code className="font-mono">auth.uid()</code> (run{' '}
                <code className="font-mono">SELECT auth.uid();</code>)
              </li>
              <li>
                If they don&apos;t match, you&apos;re signed in as a different account
              </li>
            </ol>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/reports/new"
            className="inline-flex items-center gap-1.5 bg-accent text-bg hover:bg-accent-hover font-semibold text-[13.5px] px-4 py-2.5 rounded-md transition-colors btn-shine"
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.25} />
            Generate a new report
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 border border-line hover:border-line-strong text-fg-dim hover:text-fg text-[13px] font-medium px-3.5 py-2.5 rounded-md transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Back to dashboard
          </Link>
        </div>

        {reportId && (
          <p className="text-[10.5px] font-mono uppercase tracking-caps text-fg-faint mt-6">
            Report ID: {reportId}
          </p>
        )}
      </div>
    </div>
  )
}
