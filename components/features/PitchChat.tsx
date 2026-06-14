'use client'

import { useEffect, useState } from 'react'
import { Presentation, Upload, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUsage } from '@/hooks/useUsage'
import AIChatInterface from './AIChatInterface'
import DeckUpload from './pitch/DeckUpload'

const STARTERS = [
  'Evaluate my pitch: [paste your pitch deck content or key bullet points]',
  "I'm pitching to angels next week — what are the 3 things that will kill my pitch?",
  'Help me rewrite my market size slide — investors always question it',
  'My traction slide is weak. I have 200 signups but 0 paying customers. What do I say?',
]

type Mode = 'chat' | 'upload'

/**
 * Pitch Evaluator.
 *
 * Two input modes (toggle in the header):
 *   - Chat: paste your pitch as text, get a scorecard.
 *   - Upload: drag-drop a PDF deck, get the same scorecard plus
 *     a slide-aware rewrite.
 *
 * Freemium: Free plan = 1 lifetime run (chat or upload), then
 * the chat is replaced by DeckUpload + an upsell panel. The
 * DeckUpload is intentionally shown in the gated state too — a
 * one-off "try uploading your deck" feels more concrete than a
 * hard wall and converts better.
 */
export default function PitchChat() {
  const { usage, loading } = useUsage('pitch')
  const [sessionReady, setSessionReady] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)
  const [mode, setMode] = useState<Mode>('chat')

  useEffect(() => {
    let mounted = true
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!mounted) return
        setIsAuthed(!!data.user)
        setSessionReady(true)
      })
      .catch(() => {
        if (!mounted) return
        setSessionReady(true)
      })
    return () => {
      mounted = false
    }
  }, [])

  if (!sessionReady || loading) {
    return (
      <AIChatInterface
        feature="pitch"
        title="Pitch Evaluator"
        description="Score your pitch like a YC partner × Blume VC. Honest. Specific. Actionable."
        icon={<Presentation className="w-5 h-5" strokeWidth={1.75} />}
        starters={STARTERS}
        accentColor="violet"
      />
    )
  }

  const showGate = !isAuthed || (usage?.exceeded ?? false)

  // Gated state: show upload + upsell (no toggle, no chat option)
  if (showGate) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] animate-fade-in">
        <header className="pb-5 mb-5 border-b border-line flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-signal-violet/[0.12] border-signal-violet/30 text-signal-violet">
              <Presentation className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-fg leading-tight tracking-tight">
                Pitch Evaluator
              </h1>
              <p className="text-sm text-fg-dim mt-0.5 max-w-2xl">
                Score your pitch like a YC partner × Blume VC. Honest. Specific.
                Actionable.
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-1">
          <DeckUpload />

          <div className="mt-6 px-1">
            <p className="eyebrow text-fg-muted mb-3">What the full Pitch Evaluator does</p>
            <ul className="space-y-2.5 text-[13.5px] text-fg-dim leading-relaxed">
              <li className="flex gap-2.5">
                <span className="text-signal-violet mt-0.5">→</span>
                Overall fundability score out of 100 + a tier (Not ready /
                Pre-seed / Angel / Seed ready).
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-violet mt-0.5">→</span>
                7-section scorecard: problem, solution, market size, traction,
                business model, team, ask.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-violet mt-0.5">→</span>
                Strongest point + biggest red flag, side by side.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-violet mt-0.5">→</span>
                Weakest slide: issue + drop-in slide-ready rewrite.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-violet mt-0.5">→</span>
                What kills your raise, the 10-minute fix, and what this
                specific investor wants next.
              </li>
              <li className="flex gap-2.5">
                <span className="text-signal-violet mt-0.5">→</span>
                Downloadable scorecard image and a shareable link.
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Authed + under quota:
  //   - mode === 'chat' → render the full chat interface as-is
  //   - mode === 'upload' → render the toggle header + DeckUpload
  //
  // We branch here instead of nesting because AIChatInterface
  // owns its own full-height header — nesting breaks the layout.
  if (mode === 'chat') {
    return (
      <div className="relative">
        <div className="absolute top-3 right-3 z-10 inline-flex p-0.5 rounded-md bg-bg-card border border-line shadow-sm">
          <button
            onClick={() => setMode('chat')}
            className="px-2.5 py-1.5 rounded text-[11.5px] font-medium flex items-center gap-1.5 bg-bg-elevated text-fg"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button
            onClick={() => setMode('upload')}
            className="px-2.5 py-1.5 rounded text-[11.5px] font-medium flex items-center gap-1.5 text-fg-dim hover:text-fg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload PDF
          </button>
        </div>
        <AIChatInterface
          feature="pitch"
          title="Pitch Evaluator"
          description="Score your pitch like a YC partner × Blume VC. Honest. Specific. Actionable."
          icon={<Presentation className="w-5 h-5" strokeWidth={1.75} />}
          starters={STARTERS}
          accentColor="violet"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] lg:h-[calc(100vh-80px)] animate-fade-in">
      <header className="pb-5 mb-5 border-b border-line flex-shrink-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-signal-violet/[0.12] border-signal-violet/30 text-signal-violet">
              <Presentation className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-fg leading-tight tracking-tight">
                Pitch Evaluator
              </h1>
              <p className="text-sm text-fg-dim mt-0.5 max-w-2xl">
                Drop your deck. We score it like a Blume partner would.
              </p>
            </div>
          </div>
          <div className="inline-flex p-0.5 rounded-md bg-bg-card border border-line">
            <button
              onClick={() => setMode('chat')}
              className="px-3 py-1.5 rounded text-[12px] font-medium flex items-center gap-1.5 text-fg-dim hover:text-fg transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={() => setMode('upload')}
              className="px-3 py-1.5 rounded text-[12px] font-medium flex items-center gap-1.5 bg-bg-elevated text-fg"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload PDF
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-1 pb-4">
        <DeckUpload />
      </div>
    </div>
  )
}
