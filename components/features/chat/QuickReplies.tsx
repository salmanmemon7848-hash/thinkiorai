'use client'

/**
 * THINKIOR — CO-FOUNDER QUICK REPLIES
 * ─────────────────────────────────────────────────────────────────
 * Suggested prompts that show up under the starters when the chat
 * has memory. Adapts to what the founder has actually done:
 *   - Has a Validator verdict? → "What must change to move from
 *     PIVOT to GO?"
 *   - Has a Pitch score? → "Rewrite my weakest slide"
 *   - Has a Competitor map? → "Where should I compete?"
 *   - Has nothing? → falls back to the generic starters
 *
 * Each chip sends the message via the parent's sendMessage.
 * ─────────────────────────────────────────────────────────────────
 */

import { Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { MemorySession } from './MemoryIndicator'

const GENERIC_STARTERS = [
  'When should I raise my first round vs stay bootstrapped?',
  'How do I find my first 10 B2B customers in India with zero budget?',
  "What's the best way to structure equity for my first hire in India?",
  'Walk me through registering under DPIIT Startup India — what are the actual benefits?',
]

interface QuickRepliesProps {
  sessions: MemorySession[]
  onPick: (message: string) => void
}

export default function QuickReplies({ sessions, onPick }: QuickRepliesProps) {
  if (sessions.length === 0) {
    return (
      <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
        {GENERIC_STARTERS.map((s, i) => (
          <button
            key={i}
            onClick={() => onPick(s)}
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
    )
  }

  const contextual: string[] = []
  const seen = new Set<string>()

  const push = (s: string) => {
    if (!seen.has(s)) {
      seen.add(s)
      contextual.push(s)
    }
  }

  const lastValidator = sessions.find((s) => s.module === 'validator')
  if (lastValidator) {
    const v = (lastValidator.verdict || '').toUpperCase()
    if (v === 'KILL') {
      push(
        'Based on my last Validator, what is the ONE thing that would move it from KILL to PIVOT?'
      )
    } else if (v === 'PIVOT') {
      push('What must change to move my last Validator from PIVOT to GO?')
    } else if (v === 'GO') {
      push('My last Validator said GO — what are the first 3 things I should do this week?')
    }
  }

  const lastLeads = sessions.find((s) => s.module === 'leads')
  if (lastLeads) {
    push('Help me prepare for the next conversation from my saved leads.')
  }

  const lastMarketing = sessions.find((s) => s.module === 'marketing')
  if (lastMarketing) {
    push('Based on my Marketing Engine work, what should I test next week?')
  }

  const lastIdeas = sessions.find((s) => s.module === 'ideas')
  if (lastIdeas) {
    push('Help me pressure-test the first-customer from my last Ideas plan.')
  }

  // Always-on generic fallbacks
  push('Give me a 5-minute Indian fundraising primer — what do angels actually look for?')
  push("I'm feeling stuck this week. What is the ONE thing I should ship?")

  return (
    <div className="space-y-3 max-w-3xl">
      {contextual.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10.5px] font-mono uppercase tracking-caps text-signal-violet inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Based on what you&apos;ve run
          </p>
          {contextual.slice(0, 3).map((s, i) => (
            <ContextualChip key={i} text={s} onClick={() => onPick(s)} />
          ))}
        </div>
      )}

      {contextual.length > 3 && (
        <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
          {contextual.slice(3, 5).map((s, i) => (
            <GenericChip key={i} text={s} onClick={() => onPick(s)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ContextualChip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3.5 py-2.5 rounded-md border transition-colors group',
        'bg-signal-violet/[0.04] border-signal-violet/20 hover:border-signal-violet/40 hover:bg-signal-violet/[0.08]'
      )}
    >
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-3 h-3 text-signal-violet flex-shrink-0" />
        <p className="text-[13px] text-fg leading-snug flex-1">{text}</p>
        <ArrowRight className="w-3 h-3 text-fg-faint group-hover:text-fg group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    </button>
  )
}

function GenericChip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card-premium text-left p-3.5 rounded-md hover:bg-bg-elevated transition-all group"
    >
      <p className="text-[12.5px] text-fg-dim group-hover:text-fg leading-relaxed transition-colors">
        {text}
      </p>
    </button>
  )
}
