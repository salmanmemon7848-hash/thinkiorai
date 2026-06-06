'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AIMessageProps {
  content: string
  className?: string
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

export default function AIMessage({ content, className }: AIMessageProps) {
  const hasTable = content.includes('|')
  const processedContent = hasTable
    ? content
        .replace(/^\|[-\s|]+\|$/gm, '')
        .replace(/(<tr>.*<\/tr>\n?)+/g, (m) => `<table><tbody>${m}</tbody></table>`)
    : content

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="w-7 h-7 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
      </div>
      <div
        className="ai-prose flex-1 text-[14.5px] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(processedContent) }}
      />
    </div>
  )
}
