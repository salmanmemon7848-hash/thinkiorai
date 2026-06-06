import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold tracking-caps uppercase border rounded transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent/10 text-accent border-accent/30',
        go: 'bg-signal-go/10 text-signal-go border-signal-go/30',
        kill: 'bg-signal-kill/10 text-signal-kill border-signal-kill/30',
        pivot: 'bg-signal-pivot/10 text-signal-pivot border-signal-pivot/30',
        insight: 'bg-signal-insight/10 text-signal-insight border-signal-insight/30',
        violet: 'bg-signal-violet/10 text-signal-violet border-signal-violet/30',
        muted: 'bg-bg-card text-fg-muted border-line',
        outline: 'bg-transparent text-fg-dim border-line-strong',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
