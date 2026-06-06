'use client'

/**
 * THINKIOR AI — SESSION MEMORY SYSTEM
 * ─────────────────────────────────────────────────────────────────
 *  1. useFounderMemory() hook — every AI module imports this
 *  2. SessionHistory sidebar component
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ────────────────────────────────────────────────────────
export interface FounderProfile {
  user_id: string
  idea_name: string
  idea_description: string
  domain: string
  stage: string
  target_customer: string
  city: string
  team_size: string
  biggest_challenge: string
  onboarding_completed: boolean
}

export interface FounderSession {
  id: string
  module: string
  session_title: string
  verdict: string | null
  score: number | null
  summary: string
  created_at: string
}

interface UseFounderMemory {
  profile: FounderProfile | null
  sessions: FounderSession[]
  loading: boolean
  getContextPrompt: () => string
  saveSession: (data: Omit<FounderSession, 'id' | 'created_at'> & { full_output?: object }) => Promise<void>
  refresh: () => Promise<void>
}

// ════════════════════════════════════════════════════════════════
// useFounderMemory() HOOK
// ════════════════════════════════════════════════════════════════

export function useFounderMemory(): UseFounderMemory {
  const supabase = createClient()
  const [profile, setProfile] = useState<FounderProfile | null>(null)
  const [sessions, setSessions] = useState<FounderSession[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const [{ data: prof }, { data: sess }] = await Promise.all([
      supabase.from('founder_profiles').select('*').eq('user_id', user.id).single(),
      supabase
        .from('founder_sessions')
        .select('id, module, session_title, verdict, score, summary, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (prof) setProfile(prof as FounderProfile)
    if (sess) setSessions(sess as FounderSession[])
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /**
   * getContextPrompt()
   * Returns a rich context block injected at the TOP of every
   * Thinkior system prompt.
   */
  const getContextPrompt = useCallback((): string => {
    if (!profile) return ''

    const recentSessions = sessions.slice(0, 5)
    const verdictHistory = recentSessions
      .filter((s) => s.verdict)
      .map(
        (s) =>
          `  • [${s.module.toUpperCase()}] "${s.session_title}" → ${s.verdict} (score: ${s.score ?? 'N/A'})`
      )
      .join('\n')

    const stageMap: Record<string, string> = {
      idea: 'idea stage (no product built)',
      validation: 'validation stage (talking to customers)',
      mvp: 'has a working MVP',
      revenue: 'has early revenue',
      scaling: 'scaling (₹1L+ MRR)',
    }

    return `
══ FOUNDER CONTEXT (from memory — do not ask the founder to repeat this) ══

STARTUP:
  Name: ${profile.idea_name || 'Not named yet'}
  Description: ${profile.idea_description || 'Not provided'}
  Domain: ${profile.domain || 'Not specified'}
  Stage: ${stageMap[profile.stage] || profile.stage || 'Unknown'}
  Target customer: ${profile.target_customer || 'Not defined'}
  City: ${profile.city || 'India'}
  Team size: ${profile.team_size || 'Not specified'}
  Biggest challenge right now: ${profile.biggest_challenge || 'Not specified'}

PREVIOUS THINKIOR SESSIONS:
${verdictHistory || '  No previous sessions — this is their first analysis.'}

INSTRUCTION: Use this context to make your analysis hyper-personalised.
Reference their specific idea, domain, and city in examples. Never ask
"what is your startup idea?" — you already know. Address their biggest
challenge directly in your response. If they have previous verdicts,
reference those results when relevant.
══════════════════════════════════════════════════════════════════════════
`.trim()
  }, [profile, sessions])

  /**
   * saveSession()
   * Called by each AI module after it receives a response.
   */
  const saveSession = useCallback(
    async (data: Omit<FounderSession, 'id' | 'created_at'> & { full_output?: object }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('founder_sessions').insert({
        user_id: user.id,
        ...data,
      })

      // Refresh sessions list
      const { data: sess } = await supabase
        .from('founder_sessions')
        .select('id, module, session_title, verdict, score, summary, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (sess) setSessions(sess as FounderSession[])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return { profile, sessions, loading, getContextPrompt, saveSession, refresh: fetchData }
}

// ════════════════════════════════════════════════════════════════
// SESSION HISTORY SIDEBAR COMPONENT
// ════════════════════════════════════════════════════════════════

const MODULE_ICONS: Record<string, string> = {
  validator: '✓',
  competitor: '⚔',
  ideas: '💡',
  pitch: '📊',
  chat: '💬',
  report: '📄',
}

const VERDICT_COLORS: Record<string, string> = {
  GO: '#3FE0B0',
  KILL: '#FB7185',
  PIVOT: '#FBBF24',
}

interface SessionHistoryProps {
  sessions: FounderSession[]
  profile: FounderProfile | null
  loading: boolean
}

export function SessionHistory({ sessions, profile, loading }: SessionHistoryProps) {
  if (loading) {
    return (
      <div className="py-4">
        <div className="h-14 bg-bg-card rounded-[10px] mb-2 animate-pulse" />
        <div className="h-[42px] bg-bg-card rounded-[10px] mb-2 animate-pulse" />
        <div className="h-[42px] bg-bg-card rounded-[10px] mb-2 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="py-4">
      {/* Founder identity card */}
      {profile?.onboarding_completed && (
        <div className="bg-accent/[0.08] border border-accent/20 rounded-[10px] px-[14px] py-3 mb-5">
          <div className="text-[13px] font-semibold text-accent">
            {profile.idea_name || 'Your startup'}
          </div>
          <div className="text-[11px] text-fg-muted mt-[3px]">
            {[profile.domain, profile.stage, profile.city].filter(Boolean).join(' · ')}
          </div>
        </div>
      )}

      {/* Session list */}
      <div className="text-[11px] text-fg-muted uppercase tracking-wider mb-[10px]">
        Recent sessions
      </div>
      {sessions.length === 0 ? (
        <p className="text-[13px] text-fg-muted">No sessions yet. Run your first analysis.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-3 py-[10px] rounded-[10px] cursor-pointer transition-colors hover:bg-bg-card"
            >
              <div className="flex items-center gap-[10px] min-w-0">
                <span className="text-[13px] flex-shrink-0">
                  {MODULE_ICONS[s.module] ?? '•'}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] text-fg-dim truncate">
                    {s.session_title || s.module}
                  </span>
                  {s.summary && (
                    <span className="text-[11px] text-fg-muted truncate">{s.summary}</span>
                  )}
                </div>
              </div>
              {s.verdict && (
                <span
                  className="text-[11px] font-bold flex-shrink-0"
                  style={{ color: VERDICT_COLORS[s.verdict] ?? '#888' }}
                >
                  {s.verdict}
                </span>
              )}
              {s.score && !s.verdict && (
                <span className="text-[11px] text-[#7DD3FC] flex-shrink-0">{s.score}/10</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
