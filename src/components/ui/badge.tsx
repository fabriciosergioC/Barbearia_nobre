import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-primary/25 bg-primary/10 text-primary',
        secondary: 'border-white/[0.06] bg-white/[0.04] text-muted-foreground',
        outline: 'border-border bg-transparent text-muted-foreground',
        success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
        warning: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
        destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
