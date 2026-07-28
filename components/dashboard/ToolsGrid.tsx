'use client'

/**
 * THINKIOR — TOOLS GRID
 * ─────────────────────────────────────────────────────────────────
 * The six tool cards on the dashboard. Outcome-focused copy,
 * accent-tinted icon, last-used hint when memory exists,
 * consistent hover affordance, and a free-plan upsell tile that
 * fits the same grid.
 * ─────────────────────────────────────────────────────────────────
 */

import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  Search,
  Lightbulb,
  Target,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ToolCard, ToolIconKey } from '@/lib/dashboard/summary'
import type { Plan } from '@/types'

const ICON_MAP: Record<ToolIconKey, typeof CheckCircle2> = {
  validator: CheckCircle2,
  competitor: Search,
  ideas: Lightbulb,
  leads: Target,
  reports: FileText,
  chat: MessageSquare,
}

const ACCENT_VAR: Record<ToolCard['accent'], string> = {
  accent: '--accent',
  insight: '--signal-insight',
  pivot: '--signal-pivot',
  violet: '--signal-violet',
  fg: '--fg',
}

export default function ToolsGrid({
  tools,
  plan,
}: {
  tools: ToolCard[]
  plan: Plan
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {tools.map((tool) => (
        <ToolCardItem key={tool.id} tool={tool} />
      ))}
      {plan === 'free' && <UpsellTile />}
    </div>
  )
}

function ToolCardItem({ tool }: { tool: ToolCard }) {
  const Icon = ICON_MAP[tool.iconKey] || Sparkles
  const accentVar = ACCENT_VAR[tool.accent]
  const used = tool.lastUsed

  return (
    <Link
      href={tool.href}
      className="group card-premium rounded-xl p-5 hover:bg-bg-elevated transition-all duration-300 relative overflow-hidden"
    >
      {/* Subtle accent on hover */}
      <span
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `color-mix(in srgb, var(${accentVar}) 50%, transparent)`,
        }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between mb-5">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center border"
          style={{
            background: `color-mix(in srgb, var(${accentVar}) 12%, transparent)`,
            borderColor: `color-mix(in srgb, var(${accentVar}) 30%, transparent)`,
          }}
        >
          <Icon
            className="w-4 h-4"
            strokeWidth={1.75}
            style={{ color: `var(${accentVar})` }}
          />
        </div>
        <ArrowUpRight
          className="w-4 h-4 text-fg-muted group-hover:text-fg group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
          aria-hidden="true"
        />
      </div>

      <h3 className="font-display font-semibold text-[15px] text-fg leading-tight mb-1 tracking-tight">
        {tool.label}
      </h3>
      <p className="text-[13px] text-fg-muted leading-relaxed">{tool.outcome}</p>

      {(used || tool.lastResult) && (
        <div className="mt-4 pt-3.5 border-t border-line-soft flex items-center justify-between gap-2 flex-wrap">
          {tool.lastResult && (
            <p className="text-[11.5px] text-fg-dim leading-snug line-clamp-1 min-w-0">
              {tool.lastResult}
            </p>
          )}
          {used && (
            <span className="text-[10.5px] font-mono uppercase tracking-caps text-fg-faint flex-shrink-0">
              {used}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

function UpsellTile() {
  return (
    <Link
      href="/pricing"
      className="rounded-xl p-5 border border-dashed border-line-strong hover:border-accent hover:bg-accent/[0.03] group transition-all duration-300 flex flex-col items-start justify-center min-h-[160px] relative overflow-hidden"
    >
      <span
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity bg-accent/50"
        aria-hidden="true"
      />
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <span className="eyebrow text-accent">Upgrade</span>
      </div>
      <h3 className="font-display font-semibold text-[15px] text-fg leading-tight mb-1 tracking-tight">
        Unlock more queries
      </h3>
      <p className="text-[13px] text-fg-muted leading-relaxed">
        All languages, saved reports, deeper runs →
      </p>
    </Link>
  )
}
