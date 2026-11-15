import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:border-ring aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_20px_-10px_rgba(201,162,74,0.55)] hover:bg-[#d5b05a] active:bg-[#bb9440]',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-[#232328] border border-white/5',
        outline:
          'border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-white/[0.03] hover:text-foreground',
        ghost: 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
        destructive:
          'bg-destructive/90 text-destructive-foreground hover:bg-destructive focus-visible:ring-destructive/30',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 gap-1.5 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-sm',
        icon: 'size-10',
        'icon-sm': 'size-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
