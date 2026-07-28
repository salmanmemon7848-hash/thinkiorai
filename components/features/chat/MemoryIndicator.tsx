'use client'

/**
 * THINKIOR — CO-FOUNDER MEMORY INDICATOR
 * ─────────────────────────────────────────────────────────────────
 * Compact panel that shows the founder what the chat already
 * knows about them — past Validator verdicts, Pitch scores,
 * Competitor maps, Ideas plans. Makes the memory visible, which
 * makes the chat feel like a real relationship instead of a
 * blank slate.
 *
 * Renders inline above the chat input. Collapsed by default,
 * expands to show the full digest.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import {
  Brain,
  CheckCircle2,
  X,
  RotateCw,
  Rocket,
  Search,
  Lightbulb,
  UsersRound,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface MemorySession {
  id?: string
  module: string
  session_title: string | null
  verdict: string | null
  score_100: number | null
  card_data?: Record<string, unknown> | null
  created_at?: string
}

const MODULE_ICON: Record<string, React.ElementType> = {
  validator: CheckCircle2,
  competitor: Search,
  ideas: Lightbulb,
  leads: UsersRound,
  chat: MessageSquare,
  report: Sparkles,
}
const MODULE_LABEL: Record<string, string> = {
  validator: 'Validator',
  competitor: 'Competitor',
  ideas: 'Ideas',
  leads: 'Leads Finder',
  chat: 'Chat',
  report: 'Report',
}

function verdictTone(verdict: string | null): string {
  if (!verdict) return 'border-line bg-bg-card text-fg-muted'
  const v = verdict.toUpperCase()
  if (v === 'GO' || v === 'SEED' || v === 'ANGEL' || v === 'BUILD')
    return 'border-signal-go/30 bg-signal-go/[0.06] text-signal-go'
  if (v === 'KILL' || v === 'NOT_READY' || v === 'DONT_START_YET')
    return 'border-signal-rose/30 bg-signal-rose/[0.06] text-signal-rose'
  if (v === 'PIVOT' || v === 'PRE_SEED')
    return 'border-signal-pivot/30 bg-signal-pivot/[0.06] text-signal-pivot'
  return 'border-line bg-bg-card text-fg-muted'
}

export default function MemoryIndicator({
  sessions,
  profileName,
}: {
  sessions: MemorySession[]
  profileName: string | null
}) {
  const [open, setOpen] = useState(false)

  if (sessions.length === 0) {
    return (
      <div className="mb-3 px-1">
        <p className="text-[11px] font-mono uppercase tracking-caps text-fg-faint inline-flex items-center gap-1.5">
          <Brain className="w-3 h-3" />
          No prior sessions · the chat will remember this one
        </p>
      </div>
    )
  }

  const top = sessions.slice(0, 4)
  const tone = verdictTone(top[0]?.verdict || null)

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full card-premium rounded-md px-3 py-2 flex items-center gap-3 hover:bg-bg-elevated transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-md bg-signal-violet/15 border border-signal-violet/30 flex items-center justify-center flex-shrink-0">
          <Brain className="w-3.5 h-3.5 text-signal-violet" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-fg-dim leading-tight">
            {profileName ? (
              <>Chatting with <span className="text-fg font-medium">{profileName}</span></>
            ) : (
              <>Co-founder Desk</>
            )}
            <span className="text-fg-faint"> · remembers </span>
            <span className="text-fg font-medium">
              {sessions.length} session{sessions.length === 1 ? '' : 's'}
            </span>
          </p>
          <p className="text-[11px] text-fg-faint mt-0.5 truncate">
            Last: {top[0]?.session_title || top[0]?.module || '—'}
          </p>
        </div>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-fg-muted flex-shrink-0" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-fg-muted flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="mt-2 card-premium rounded-md p-3 space-y-2 animate-fade-in">
          {top.map((s, i) => {
            const Icon = MODULE_ICON[s.module] || Sparkles
            const score100 = s.score_100
            const card = s.card_data
            return (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-md bg-bg/40 border border-line-soft"
              >
                <div className="w-7 h-7 rounded-md bg-bg-elevated border border-line flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-fg-dim" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-caps text-fg-muted">
                      {MODULE_LABEL[s.module] || s.module}
                    </span>
                    {s.verdict && (
                      <span
                        className={cn(
                          'text-[10px] font-mono uppercase tracking-caps px-1.5 py-0.5 rounded border',
                          verdictTone(s.verdict)
                        )}
                      >
                        {s.verdict.replace('_', ' ')}
                      </span>
                    )}
                    {typeof score100 === 'number' && (
                      <span className="text-[10px] font-mono tabular text-fg-dim">
                        {score100}/100
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-fg-dim leading-snug line-clamp-2">
                    {s.session_title || (card?.headline as string) || 'Untitled session'}
                  </p>
                </div>
              </div>
            )
          })}
          <p className="text-[11px] text-fg-faint leading-relaxed pt-1">
            The chat sees all of this. Ask it to reference any of it.
          </p>
        </div>
      )}
    </div>
  )
}
