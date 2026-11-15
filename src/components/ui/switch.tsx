import * as SwitchPrimitive from '@radix-ui/react-switch'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-white/10 transition-colors outline-none',
        'data-[state=checked]:border-primary/60 data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10',
        'focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-[#0b0b0c] shadow-sm ring-0 transition-transform',
          'data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-0.5',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
