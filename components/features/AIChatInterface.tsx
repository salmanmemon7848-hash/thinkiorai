'use client'

import { useRef, useEffect, useState, type KeyboardEvent } from 'react'
import { Send, Trash2, CornerDownLeft } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useUsage } from '@/hooks/useUsage'
import AIMessage from '@/components/shared/AIMessage'
import UserMessage from '@/components/shared/UserMessage'
import LoadingDots from '@/components/shared/LoadingDots'
import type { Feature } from '@/types'
import { FEATURE_NAMES } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CertificateTrigger } from '@/components/features/Certificate'

interface AIChatInterfaceProps {
  feature: Feature
  title: string
  description: string
  icon: React.ReactNode
  starters: string[]
  accentColor?: string
  /** Optional replacement for the default starter chips. Receives
   *  the parent's sendMessage so chips can fire messages. */
  customStarters?: React.ReactNode
}

const ACCENT_MAP: Record<string, { text: string; bg: string; border: string; cssVar: string }> = {
  accent: { text: 'text-accent', bg: 'bg-accent', border: 'border-accent', cssVar: '--accent' },
  insight: { text: 'text-signal-insight', bg: 'bg-signal-insight', border: 'border-signal-insight', cssVar: '--signal-insight' },
  pivot: { text: 'text-signal-pivot', bg: 'bg-signal-pivot', border: 'border-signal-pivot', cssVar: '--signal-pivot' },
  violet: { text: 'text-signal-violet', bg: 'bg-signal-violet', border: 'border-signal-violet', cssVar: '--signal-violet' },
  fg: { text: 'text-fg', bg: 'bg-fg', border: 'border-fg', cssVar: '--fg' },
}

export default function AIChatInterface({
  feature,
  title,
  description,
  icon,
  starters,
  accentColor = 'accent',
  customStarters,
}: AIChatInterfaceProps) {
  const { messages, loading, error, sendMessage, clearMessages } = useChat(feature)
  const { usage, refetch } = useUsage(feature)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [founderProfile, setFounderProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [founderRes, profileRes] = await Promise.all([
          supabase.from('founder_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('profiles').select('name, email').eq('id', user.id).maybeSingle(),
        ])

        const founder: any = founderRes.data ?? {}
        const profile: any = profileRes.data ?? {}

        const resolvedName =
          (founder.founder_name && founder.founder_name.trim()) ||
          (profile.name && profile.name.trim()) ||
          (user.user_metadata?.full_name && user.user_metadata.full_name.trim()) ||
          (user.user_metadata?.name && user.user_metadata.name.trim()) ||
          (user.email ? user.email.split('@')[0] : '') ||
          'Founder'

        setFounderProfile({
          ...founder,
          founder_name: resolvedName,
          user_email: user.email,
        })
      } catch {
        // profile load failed, certificate will render without founder name
      }
    }
    fetchProfile()
  }, [])

  const parseLastVerdict = () => {
    // Certificate ONLY for Business Validator
    if (feature !== 'validator') return null

    const assistantMsgs = messages.filter((m) => m.role === 'assistant')
    if (assistantMsgs.length === 0) return null

    const last = assistantMsgs[assistantMsgs.length - 1]

    // Prefer the structured card payload (the new way). Fall back to
    // the old text regex for backward compatibility with old sessions
    // that don't have a card.
    const card = last.card as { verdict?: string; confidence?: string } | null
    if (card && card.verdict === 'GO' && card.confidence === 'High') {
      return { verdict: 'GO' as const, confidence: 'High' as const }
    }

    const lastText = last.content
    const verdictMatch = lastText.match(/VERDICT:\s*(GO|KILL|PIVOT)/i)
    if (!verdictMatch) return null
    const verdict = verdictMatch[1].toUpperCase()
    if (verdict !== 'GO') return null

    const confMatch = lastText.match(/Confidence:\s*\**\s*(High|Medium|Low)/i)
    if (!confMatch) return null
    const confidence = confMatch[1]
    if (confidence.toLowerCase() !== 'high') return null

    return { verdict: 'GO' as const, confidence: 'High' as const }
  }

  const parsedCert = parseLastVerdict()
  // Show only when: validator feature + GO verdict + High confidence
  const showCertificate =
    parsedCert !== null &&
    founderProfile !== null &&
    parsedCert.verdict === 'GO' &&
    parsedCert.confidence === 'High'

  const a = ACCENT_MAP[accentColor] ?? ACCENT_MAP.accent

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const msg = input
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(msg)
    refetch()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }

  const limitExceeded = error === 'daily_limit' || usage?.exceeded

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] animate-fade-in">
      {/* Header */}
      <header className="pb-5 mb-5 border-b border-line flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center border"
              style={{
                background: `color-mix(in srgb, var(${a.cssVar}) 12%, transparent)`,
                borderColor: `color-mix(in srgb, var(${a.cssVar}) 30%, transparent)`,
                color: `var(${a.cssVar})`,
              }}
            >
              {icon}
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-fg leading-tight tracking-tight">
                {title}
              </h1>
              <p className="text-sm text-fg-dim mt-0.5 max-w-2xl">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
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
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4 pr-1">
        {messages.length === 0 && !loading && (
          <div className="py-6">
            {customStarters ? (
              customStarters
            ) : (
              <>
                <p className="font-display font-semibold text-base text-fg mb-1.5 tracking-tight">
                  Start anywhere
                </p>
                <p className="text-sm text-fg-muted mb-6">
                  Type your question below, or try one of these openings.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
                  {starters.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="card-premium text-left p-4 rounded-lg hover:bg-bg-elevated transition-all duration-300 group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-caps text-fg-muted mt-0.5 tabular">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-[13.5px] text-fg-dim group-hover:text-fg leading-relaxed transition-colors">
                          {s}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
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
              sources={msg.sources}
            />
          )
        )}

        {showCertificate && parsedCert && (
          <div className="flex justify-start sm:pl-10 mt-2 mb-4 animate-fade-in">
            <CertificateTrigger
              data={{
                founder_name: founderProfile.founder_name || 'Founder',
                startup_name: founderProfile.idea_name || 'My Startup',
                idea_description: founderProfile.idea_description || '',
                domain: founderProfile.domain || 'Tech',
                confidence: parsedCert.confidence,
                verdict: 'GO',
              }}
            />
          </div>
        )}

        {loading && (
          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border"
              style={{
                background: `color-mix(in srgb, var(${a.cssVar}) 15%, transparent)`,
                borderColor: `color-mix(in srgb, var(${a.cssVar}) 30%, transparent)`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse-slow"
                style={{ background: `var(${a.cssVar})` }}
              />
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

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 pt-4 border-t border-line">
        {limitExceeded ? (
          <div className="card-premium border-accent/40 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-sm text-fg mb-0.5">Daily limit reached</p>
              <p className="text-xs text-fg-muted">Resets at midnight IST. Upgrade for more.</p>
            </div>
            <Link
              href="/pricing"
              className="flex-shrink-0 bg-accent text-bg hover:bg-accent-hover font-semibold text-sm px-4 py-2 rounded-md transition-all"
            >
              Upgrade
            </Link>
          </div>
        ) : (
          <div className="card-premium rounded-xl p-2.5 flex gap-2 items-end focus-within:border-accent/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={`Ask about ${FEATURE_NAMES[feature].toLowerCase()}...`}
              rows={1}
              className="flex-1 bg-transparent text-[14.5px] text-fg placeholder:text-fg-muted outline-none resize-none leading-relaxed max-h-[200px] py-2 px-2.5"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={cn(
                'w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 transition-all',
                input.trim() && !loading
                  ? 'bg-fg text-bg hover:bg-fg/90'
                  : 'bg-bg-card text-fg-muted cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mt-3 text-[10px] font-mono tracking-caps uppercase text-fg-muted">
          <CornerDownLeft className="w-3 h-3" />
          Enter to send · <span className="kbd">Shift</span> + <span className="kbd">↵</span> for new line
        </div>
      </div>
    </div>
  )
}
