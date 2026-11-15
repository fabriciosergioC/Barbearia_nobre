import type * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-20 w-full rounded-lg border border-input bg-white/[0.02] px-3 py-2 text-sm text-foreground shadow-sm transition-colors outline-none',
        'placeholder:text-muted-foreground/60',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
