'use client'

/**
 * THINKIOR — ACTIVITY FEED (founder timeline)
 * ─────────────────────────────────────────────────────────────────
 * Replaces the old dotted-list with a real timeline:
 *   - module icon + tone
 *   - result-focused line (verdict / score / first customer)
 *   - tool label + relative time
 *
 * Zero state is motivating, not empty.
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils/format'
import { FEATURE_NAMES } from '@/lib/constants'
import {
  CheckCircle2,
  Search,
  Lightbulb,
  Presentation,
  FileText,
  MessageSquare,
  Sparkles,
  Rocket,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { ActivityLog } from '@/types'

const ICON: Record<string, typeof CheckCircle2> = {
  validator: CheckCircle2,
  competitor: Search,
  ideas: Lightbulb,
  pitch: Presentation,
  report: FileText,
  chat: MessageSquare,
}

const ACCENT: Record<string, string> = {
  validator: 'text-accent',
  competitor: 'text-signal-insight',
  ideas: 'text-signal-pivot',
  pitch: 'text-signal-violet',
  report: 'text-accent',
  chat: 'text-fg-dim',
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setActivities(data as ActivityLog[])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="card-premium rounded-2xl p-2">
      <ol className="relative">
        {activities.map((a, i) => {
          const Icon = ICON[a.feature] || Sparkles
          const accent = ACCENT[a.feature] || 'text-fg-dim'
          return (
            <li
              key={a.id}
              className={cn(
                'flex items-start gap-3 px-3 py-3 rounded-md hover:bg-bg-elevated transition-colors',
                i !== 0 && 'mt-0.5'
              )}
            >
              {/* Timeline rail */}
              <div className="relative flex-shrink-0 w-7 flex flex-col items-center pt-0.5">
                <div
                  className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center bg-bg-card border border-line'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', accent)} strokeWidth={1.75} />
                </div>
                {i !== activities.length - 1 && (
                  <div className="w-px flex-1 bg-line mt-1.5 mb-[-12px] min-h-[24px]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-[10.5px] font-mono uppercase tracking-caps text-fg-muted">
                    {FEATURE_NAMES[a.feature] || a.feature}
                  </p>
                  <span className="text-[10.5px] text-fg-faint">·</span>
                  <p className="text-[10.5px] font-mono uppercase tracking-caps text-fg-faint inline-flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {timeAgo(a.created_at)}
                  </p>
                </div>
                {a.title && (
                  <p className="text-[13.5px] text-fg leading-snug line-clamp-2">
                    {a.title}
                  </p>
                )}
                {a.summary && (
                  <p className="text-[12px] text-fg-faint leading-relaxed mt-0.5 line-clamp-2">
                    {a.summary}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card-premium rounded-2xl p-8 sm:p-10 relative overflow-hidden">
      <div className="mesh-bg" aria-hidden="true" />
      <div className="relative z-10 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-md bg-accent/[0.08] border border-accent/30 flex items-center justify-center mx-auto mb-4">
          <Rocket className="w-5 h-5 text-accent" strokeWidth={1.75} />
        </div>
        <h3 className="font-display font-semibold text-[16px] text-fg mb-1.5 tracking-tight">
          Your founder timeline starts here
        </h3>
        <p className="text-[13px] text-fg-dim leading-relaxed mb-5">
          Run any tool — Validator, Competitor, Pitch, Ideas — and your work
          will appear here. Each entry shows the verdict, the score, or the
          headline result.
        </p>
        <Link
          href="/validator"
          className="inline-flex items-center gap-1.5 bg-accent text-bg hover:bg-accent-hover font-semibold text-[12.5px] px-3.5 py-2 rounded-md transition-colors btn-shine"
        >
          Start with Validator
        </Link>
      </div>
    </div>
  )
}
