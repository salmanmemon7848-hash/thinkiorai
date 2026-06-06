import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-fg text-bg hover:bg-fg/90',
        accent: 'bg-accent text-bg hover:bg-accent-hover shadow-glow-accent',
        secondary:
          'bg-bg-card border border-line hover:bg-bg-elevated hover:border-line-strong text-fg',
        ghost: 'text-fg-dim hover:text-fg hover:bg-bg-card',
        destructive:
          'bg-signal-rose/10 text-signal-rose border border-signal-rose/30 hover:bg-signal-rose/20',
        link: 'text-accent hover:text-accent-hover underline-offset-4 hover:underline px-0',
      },
      size: {
        default: 'h-10 px-5 py-2.5 text-sm',
        sm: 'h-8 px-3.5 py-2 text-xs',
        lg: 'h-12 px-7 py-3 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
