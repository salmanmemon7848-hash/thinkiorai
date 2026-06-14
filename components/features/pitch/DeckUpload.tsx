'use client'

/**
 * THINKIOR — DECK UPLOAD
 * ─────────────────────────────────────────────────────────────────
 * Drag-drop or click-to-pick a PDF pitch deck. Sends the file to
 * /api/pitch/upload which extracts text via pdf-parse and runs the
 * Pitch Evaluator against the deck content.
 *
 * State machine: idle → uploading → evaluating → done | error
 * ─────────────────────────────────────────────────────────────────
 */

import { useCallback, useRef, useState } from 'react'
import {
  UploadCloud,
  FileText,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { PitchCard } from '@/lib/ai/cardSchemas'
import PitchCardView from './PitchCard'

type Phase = 'idle' | 'uploading' | 'extracting' | 'evaluating' | 'done' | 'error'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ACCEPT = 'application/pdf,.pdf'

export default function DeckUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PitchCard | null>(null)
  const [extractedPreview, setExtractedPreview] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setFile(null)
    setPhase('idle')
    setProgress(0)
    setError(null)
    setResult(null)
    setExtractedPreview('')
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const validateAndSet = useCallback((f: File) => {
    setError(null)
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported. Please convert your deck to PDF.')
      return false
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('Deck is too large (max 10 MB). Try a smaller PDF.')
      return false
    }
    if (f.size < 100) {
      setError('That file looks empty or corrupted.')
      return false
    }
    setFile(f)
    return true
  }, [])

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      if (f) validateAndSet(f)
    },
    [validateAndSet]
  )

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const f = e.dataTransfer.files?.[0]
      if (f) validateAndSet(f)
    },
    [validateAndSet]
  )

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const submit = useCallback(async () => {
    if (!file) return
    setPhase('uploading')
    setError(null)
    setResult(null)
    setProgress(0)

    try {
      // Simulated progress (XHR gives us real progress, but the route
      // does both upload + extract + LLM, so the phases are visual).
      const tick = (() => {
        let id: ReturnType<typeof setInterval> | null = null
        let p = 0
        return {
          start: () => {
            id = setInterval(() => {
              p = Math.min(90, p + 6)
              setProgress(p)
            }, 250)
          },
          stop: () => {
            if (id) clearInterval(id)
            setProgress(100)
          },
        }
      })()
      tick.start()

      const form = new FormData()
      form.append('deck', file)

      // Phase transitions (uploading → extracting → evaluating)
      setTimeout(() => {
        if (phase !== 'error') setPhase('extracting')
      }, 400)
      setTimeout(() => {
        if (phase !== 'error') setPhase('evaluating')
      }, 1200)

      const res = await fetch('/api/pitch/upload', {
        method: 'POST',
        body: form,
      })

      tick.stop()

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Could not process the deck. Please try again.')
      }

      const data = await res.json()
      setResult(data.card)
      setExtractedPreview(data.preview ?? '')
      setPhase('done')
    } catch (err) {
      setError((err as Error).message)
      setPhase('error')
    }
  }, [file, phase])

  // ── Done state: render the PitchCard ─────────────────────────
  if (phase === 'done' && result) {
    return (
      <div className="animate-fade-in">
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[12px] text-fg-dim">
            <CheckCircle2 className="w-4 h-4 text-signal-go" />
            <span>
              Scored <span className="text-fg font-medium">{file?.name}</span>
            </span>
          </div>
          <button
            onClick={reset}
            className="text-[12px] text-fg-dim hover:text-fg inline-flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Score another deck
          </button>
        </div>
        <PitchCardView card={result} />
        {extractedPreview && (
          <details className="mt-3 card-premium rounded-md p-3">
            <summary className="text-[11px] font-mono uppercase tracking-caps text-fg-muted cursor-pointer hover:text-fg-dim">
              Extracted text preview ({extractedPreview.length} chars shown)
            </summary>
            <pre className="mt-2 text-[11.5px] text-fg-faint leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {extractedPreview.slice(0, 1200)}
              {extractedPreview.length > 1200 ? '…' : ''}
            </pre>
          </details>
        )}
      </div>
    )
  }

  // ── Idle / uploading / error ─────────────────────────────────
  const isBusy =
    phase === 'uploading' || phase === 'extracting' || phase === 'evaluating'

  return (
    <div className="space-y-3">
      <div
        onClick={() => !isBusy && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        className={cn(
          'relative card-premium rounded-2xl p-8 border-2 border-dashed transition-all cursor-pointer',
          isDragging
            ? 'border-signal-violet/60 bg-signal-violet/[0.04]'
            : 'border-line hover:border-signal-violet/40 hover:bg-bg-elevated/30',
          isBusy && 'pointer-events-none opacity-70'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onPick}
          className="hidden"
        />
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center border transition-colors',
              isDragging
                ? 'bg-signal-violet/15 border-signal-violet/40'
                : 'bg-bg-elevated border-line'
            )}
          >
            {isBusy ? (
              <Loader2 className="w-6 h-6 text-signal-violet animate-spin" />
            ) : (
              <UploadCloud
                className={cn(
                  'w-6 h-6',
                  isDragging ? 'text-signal-violet' : 'text-fg-dim'
                )}
                strokeWidth={1.5}
              />
            )}
          </div>

          {!file ? (
            <>
              <div>
                <p className="font-display font-semibold text-[15px] text-fg">
                  {isDragging
                    ? 'Drop your deck here'
                    : 'Upload your pitch deck (PDF)'}
                </p>
                <p className="text-[12.5px] text-fg-dim mt-1 max-w-sm">
                  Drag &amp; drop a PDF, or click to pick. We&apos;ll extract the
                  text and score your pitch — investor-grade feedback in 30s.
                </p>
              </div>
              <p className="text-[11px] font-mono uppercase tracking-caps text-fg-faint">
                PDF only · max 10 MB
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-bg-elevated border border-line max-w-md w-full">
                <FileText className="w-4 h-4 text-signal-violet flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-fg truncate font-medium">{file.name}</p>
                  <p className="text-[11px] text-fg-faint font-mono">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                {!isBusy && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      reset()
                    }}
                    className="text-fg-muted hover:text-signal-rose p-1"
                    aria-label="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isBusy && (
                <div className="w-full max-w-sm">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-caps text-fg-muted mb-1.5">
                    <span>
                      {phase === 'uploading' && 'Uploading…'}
                      {phase === 'extracting' && 'Extracting text…'}
                      {phase === 'evaluating' && 'VC partner is reading…'}
                    </span>
                    <span className="tabular">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-signal-violet transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {!isBusy && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    submit()
                  }}
                  className="inline-flex items-center gap-1.5 bg-accent text-bg hover:bg-accent-hover font-semibold text-[13px] px-5 py-2.5 rounded-md transition-colors btn-shine"
                >
                  Score my deck
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-signal-rose/10 border border-signal-rose/30 rounded-md px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-signal-rose flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-fg leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  )
}
