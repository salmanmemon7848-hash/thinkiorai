'use client'

import { ExternalLink, ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { parseThinkiorCard, type CardKind } from '@/lib/ai/cardParser'
import {
  ValidatorCardSchema,
  ValidatorPreviewSchema,
  CompetitorCardSchema,
  IdeasCardSchema,
} from '@/lib/ai/cardSchemas'
import ValidatorCardView from '@/components/features/validator/ValidatorCard'
import CompetitorCardView from '@/components/features/competitor/CompetitorCard'
import IdeasCardView from '@/components/features/ideas/IdeasCard'
import type { ResearchSource } from '@/types'

interface AIMessageProps {
  content: string
  className?: string
  /** Optional structured card payload already parsed server-side. */
  card?: unknown | null
  cardKind?: CardKind | null
  sources?: ResearchSource[]
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char))
}

function renderMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\| (.+) \|$/gm, (match) => {
      const cells = match.slice(1, -1).split('|').map((c) => c.trim())
      return '<tr>' + cells.map((c) => `<td>${c}</td>`).join('') + '</tr>'
    })
    .replace(/^---+$/gm, '<hr class="border-line my-3" />')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul]|<hr|<tr)(.+)$/gm, '$1')
}

export default function AIMessage({ content, className, card, cardKind, sources = [] }: AIMessageProps) {
  let resolvedCard: unknown = card ?? null
  let resolvedText = content
  let resolvedKind: CardKind = cardKind ?? 'validator'

  if (!resolvedCard) {
    const order: CardKind[] = cardKind
      ? [cardKind, 'validator', 'competitor', 'ideas', 'preview']
      : ['validator', 'competitor', 'ideas', 'preview']
    for (const k of order) {
      const parsed = parseThinkiorCard(content, k)
      if (parsed.card) {
        resolvedCard = parsed.card
        resolvedText = parsed.text
        resolvedKind = parsed.cardKind ?? k
        break
      }
    }
  } else {
    const stripped = parseThinkiorCard(content, 'validator').text
    resolvedText = stripped || content
  }

  const hasTable = resolvedText.includes('|')
  const processedContent = hasTable
    ? resolvedText
        .replace(/^\|[-\s|]+\|$/gm, '')
        .replace(/(<tr>.*<\/tr>\n?)+/g, (m) => `<table><tbody>${m}</tbody></table>`)
    : resolvedText

  const validatorCard =
    resolvedCard && ValidatorCardSchema.safeParse(resolvedCard).success
      ? ValidatorCardSchema.parse(resolvedCard)
      : null
  const competitorCard =
    !validatorCard &&
    resolvedCard &&
    CompetitorCardSchema.safeParse(resolvedCard).success
      ? CompetitorCardSchema.parse(resolvedCard)
      : null
  const ideasCard =
    !validatorCard &&
    !competitorCard &&
    resolvedCard &&
    IdeasCardSchema.safeParse(resolvedCard).success
      ? IdeasCardSchema.parse(resolvedCard)
      : null
  const previewCard =
    !validatorCard &&
    !competitorCard &&
    !ideasCard &&
    resolvedCard &&
    ValidatorPreviewSchema.safeParse(resolvedCard).success
      ? ValidatorPreviewSchema.parse(resolvedCard)
      : null

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
        </div>
        <div
          className="ai-prose flex-1 text-[14.5px] leading-relaxed min-w-0"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(processedContent) }}
        />
      </div>

      {validatorCard && (
        <div className="sm:pl-10">
          <ValidatorCardView card={validatorCard} />
        </div>
      )}
      {competitorCard && (
        <div className="sm:pl-10">
          <CompetitorCardView card={competitorCard} />
        </div>
      )}
      {ideasCard && (
        <div className="sm:pl-10">
          <IdeasCardView card={ideasCard} />
        </div>
      )}
      {sources.length > 0 && (
        <div className="sm:pl-10">
          <div className="rounded-lg border border-line bg-bg-sub p-3">
            <div className="flex items-center gap-2 mb-2"><ShieldCheck className="w-3.5 h-3.5 text-accent" /><p className="text-[10px] uppercase tracking-caps font-mono text-fg-muted">Research sources — verify before acting</p></div>
            <ul className="space-y-2">
              {sources.map((source) => (
                <li key={source.url} className="text-xs leading-relaxed">
                  <a href={source.url} target="_blank" rel="noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">{source.title || 'Open source'}<ExternalLink className="w-3 h-3" /></a>
                  <p className="text-fg-muted mt-0.5 line-clamp-2">{source.snippet}</p>
                  <p className="text-fg-faint font-mono text-[10px] mt-0.5">Retrieved {new Date(source.retrievedAt).toLocaleDateString()} · {source.confidence} relevance</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {/* Preview card is rendered inline by FastPreview, not here. */}
      {previewCard && !validatorCard && !competitorCard && !ideasCard && null}

      {void resolvedKind}
    </div>
  )
}
