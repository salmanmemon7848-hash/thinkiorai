'use client'

/**
 * THINKIOR — CO-FOUNDER DESK
 * ─────────────────────────────────────────────────────────────────
 * The always-on chat, but memory-aware.
 *
 * Differences from the generic AIChatPage:
 *   - Header shows the founder's name
 *   - Above the input, a collapsible MemoryIndicator shows
 *     what the chat already knows
 *   - QuickReplies (replacing generic starters) reference past
 *     sessions when memory exists
 *   - Hinglish / Hindi / English all work — the prompt's language
 *     helper handles detection automatically
 *
 * The underlying chat mechanics (useChat, /api/ai) are unchanged.
 * The Co-founder prompt was rewritten (lib/ai/prompts/chat.ts)
 * to make the LLM actively USE the founder memory it sees.
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useState } from 'react'
import { MessageSquare, Sparkles, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useChat } from '@/hooks/useChat'
import { useUsage } from '@/hooks/useUsage'
import AIMessage from '@/components/shared/AIMessage'
import UserMessage from '@/components/shared/UserMessage'
import LoadingDots from '@/components/shared/LoadingDots'
import MemoryIndicator, { type MemorySession } from './chat/MemoryIndicator'
import QuickReplies from './chat/QuickReplies'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'

interface FounderProfileLite {
  founder_name?: string | null
  idea_name?: string | null
}

export default function CoFounderChat() {
  const { messages, loading, error, sendMessage, clearMessages } = useChat('chat')
  const { usage } = useUsage('chat')
  const [memory, setMemory] = useState<MemorySession[]>([])
  const [profile, setProfile] = useState<FounderProfileLite | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          if (mounted) setSessionReady(true)
          return
        }
        const [profileRes, sessionsRes] = await Promise.all([
          supabase
            .from('founder_profiles')
            .select('founder_name, idea_name')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('founder_sessions')
            .select(
              'id, module, session_title, verdict, score_100, card_data, created_at'
            )
            .eq('user_id', user.id)
            .neq('module', 'chat')
            .order('created_at', { ascending: false })
            .limit(8),
        ])
        if (!mounted) return
        if (profileRes.data) setProfile(profileRes.data)
        if (sessionsRes.data) {
          setMemory(
            (sessionsRes.data as MemorySession[]).filter(
              (s) => s.session_title || s.verdict || s.score_100
            )
          )
        }
      } catch {
        // non-critical
      } finally {
        if (mounted) setSessionReady(true)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const limitExceeded = error === 'daily_limit' || usage?.exceeded

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] animate-fade-in">
      {/* Header */}
      <header className="pb-5 mb-5 border-b border-line flex-shrink-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-fg/[0.08] border-line-strong text-fg">
              <MessageSquare className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-fg leading-tight tracking-tight">
                Co-founder Desk
              </h1>
              <p className="text-sm text-fg-dim mt-0.5 max-w-2xl">
                Your always-on co-founder. Strategy, fundraising, ops, GTM —
                with Indian context and the memory of everything you&apos;ve run.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {profile?.founder_name && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-card border border-line">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[12px] text-fg-dim">
                  Hi, <span className="text-fg font-medium">{profile.founder_name}</span>
                </span>
              </div>
            )}
            {usage && (
              <span className="hidden sm:inline-flex items-center gap-2 text-[11px] font-mono tabular text-fg-muted bg-bg-card border border-line px-2.5 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {usage.remaining}/{usage.limit} left
              </span>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="flex items-center gap-1.5 text-xs text-fg-muted hover:text-signal-rose transition-colors px-3 py-1.5 rounded-md hover:bg-bg-card"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4 pr-1">
        {messages.length === 0 && !loading && sessionReady && (
          <div>
            <MemoryIndicator
              sessions={memory}
              profileName={profile?.founder_name || null}
            />
            <QuickReplies sessions={memory} onPick={sendMessage} />
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            <UserMessage key={i} content={msg.content} />
          ) : (
            <AIMessage
              key={i}
              content={msg.content}
              card={msg.card ?? null}
              cardKind={msg.cardKind ?? null}
            />
          )
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-fg/15 border border-fg/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="w-2 h-2 rounded-full animate-pulse-slow bg-fg" />
            </div>
            <div className="pt-1.5">
              <LoadingDots />
            </div>
          </div>
        )}

        {error && error !== 'daily_limit' && (
          <div className="bg-signal-rose/10 border border-signal-rose/30 rounded-lg px-4 py-3">
            <p className="font-mono text-[10px] tracking-caps uppercase text-signal-rose font-semibold mb-1">
              Error
            </p>
            <p className="text-sm text-fg">{error}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-4 border-t border-line">
        {limitExceeded ? (
          <div className="card-premium border-accent/40 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-sm text-fg mb-0.5">
                Daily limit reached
              </p>
              <p className="text-xs text-fg-muted">
                Resets at midnight IST. Upgrade for more.
              </p>
            </div>
            <Link
              href="/pricing"
              className="flex-shrink-0 bg-accent text-bg hover:bg-accent-hover font-semibold text-sm px-4 py-2 rounded-md transition-all"
            >
              Upgrade
            </Link>
          </div>
        ) : (
          <ChatInput
            onSend={sendMessage}
            loading={loading}
            placeholder={
              memory.length > 0
                ? `Ask anything. The chat remembers your ${memory.length} prior session${memory.length === 1 ? '' : 's'}.`
                : 'Ask the co-founder anything… (Hindi / Hinglish / English)'
            }
          />
        )}
        <p className="text-center text-[10px] font-mono tracking-caps uppercase text-fg-muted mt-3">
          Hinglish &amp; Hindi supported · Enter to send · Shift+↵ for new line
        </p>
      </div>
    </div>
  )
}

function ChatInput({
  onSend,
  loading,
  placeholder,
}: {
  onSend: (m: string) => void
  loading: boolean
  placeholder: string
}) {
  const [val, setVal] = useState('')
  return (
    <div className="card-premium rounded-xl p-2.5 flex gap-2 items-end focus-within:border-fg/40 transition-colors">
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (val.trim() && !loading) {
              onSend(val)
              setVal('')
            }
          }
        }}
        placeholder={placeholder}
        rows={1}
        className="flex-1 bg-transparent text-[14.5px] text-fg placeholder:text-fg-muted outline-none resize-none leading-relaxed max-h-[200px] py-2 px-2.5"
      />
      <button
        onClick={() => {
          if (val.trim() && !loading) {
            onSend(val)
            setVal('')
          }
        }}
        disabled={!val.trim() || loading}
        className={cn(
          'w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 transition-all',
          val.trim() && !loading
            ? 'bg-fg text-bg hover:bg-fg/90'
            : 'bg-bg-card text-fg-muted cursor-not-allowed'
        )}
        aria-label="Send"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        )}
      </button>
    </div>
  )
}

