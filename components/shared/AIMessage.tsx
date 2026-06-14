'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { parseThinkiorCard, type CardKind } from '@/lib/ai/cardParser'
import {
  ValidatorCardSchema,
  ValidatorPreviewSchema,
  CompetitorCardSchema,
  PitchCardSchema,
  IdeasCardSchema,
} from '@/lib/ai/cardSchemas'
import ValidatorCardView from '@/components/features/validator/ValidatorCard'
import CompetitorCardView from '@/components/features/competitor/CompetitorCard'
import PitchCardView from '@/components/features/pitch/PitchCard'
import IdeasCardView from '@/components/features/ideas/IdeasCard'

interface AIMessageProps {
  content: string
  className?: string
  /** Optional structured card payload already parsed server-side. */
  card?: unknown | null
  cardKind?: CardKind | null
}

function renderMarkdown(text: string): string {
  return text
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

export default function AIMessage({ content, className, card, cardKind }: AIMessageProps) {
  let resolvedCard: unknown = card ?? null
  let resolvedText = content
  let resolvedKind: CardKind = cardKind ?? 'validator'

  if (!resolvedCard) {
    const order: CardKind[] = cardKind
      ? [cardKind, 'validator', 'competitor', 'pitch', 'ideas', 'preview']
      : ['validator', 'competitor', 'pitch', 'ideas', 'preview']
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
  const pitchCard =
    !validatorCard &&
    !competitorCard &&
    resolvedCard &&
    PitchCardSchema.safeParse(resolvedCard).success
      ? PitchCardSchema.parse(resolvedCard)
      : null
  const ideasCard =
    !validatorCard &&
    !competitorCard &&
    !pitchCard &&
    resolvedCard &&
    IdeasCardSchema.safeParse(resolvedCard).success
      ? IdeasCardSchema.parse(resolvedCard)
      : null
  const previewCard =
    !validatorCard &&
    !competitorCard &&
    !pitchCard &&
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
      {pitchCard && (
        <div className="sm:pl-10">
          <PitchCardView card={pitchCard} />
        </div>
      )}
      {ideasCard && (
        <div className="sm:pl-10">
          <IdeasCardView card={ideasCard} />
        </div>
      )}
      {/* Preview card is rendered inline by FastPreview, not here. */}
      {previewCard && !validatorCard && !competitorCard && !pitchCard && !ideasCard && null}

      {void resolvedKind}
    </div>
  )
}
