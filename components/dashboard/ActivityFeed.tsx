'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils/format'
import { FEATURE_NAMES } from '@/lib/constants'
import type { ActivityLog } from '@/types'
import { FileText } from 'lucide-react'

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
          <div key={i} className="h-14 bg-bg-card rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="card-premium rounded-xl p-10 text-center">
        <div className="w-12 h-12 rounded-lg bg-bg-elevated border border-line flex items-center justify-center mx-auto mb-4">
          <FileText className="w-5 h-5 text-fg-muted" />
        </div>
        <p className="font-display font-semibold text-base text-fg mb-1.5 tracking-tight">
          No activity yet
        </p>
        <p className="text-sm text-fg-muted max-w-xs mx-auto">
          Once you start using the tools, your recent work will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="card-premium rounded-xl overflow-hidden">
      {activities.map((a, i) => (
        <div
          key={a.id}
          className={`flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors ${
            i !== 0 ? 'border-t border-line-soft' : ''
          }`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
          <span className="text-[11px] font-mono uppercase tracking-caps text-fg-muted flex-shrink-0 w-32 hidden sm:block">
            {FEATURE_NAMES[a.feature]}
          </span>
          <span className="text-sm text-fg flex-1 truncate">{a.title}</span>
          <span className="font-mono text-xs text-fg-muted tabular flex-shrink-0">
            {timeAgo(a.created_at)}
          </span>
        </div>
      ))}
    </div>
  )
}
