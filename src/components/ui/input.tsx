import type * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-lg border border-input bg-white/[0.02] px-3 py-2 text-sm text-foreground shadow-sm transition-colors outline-none',
        'placeholder:text-muted-foreground/60 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
