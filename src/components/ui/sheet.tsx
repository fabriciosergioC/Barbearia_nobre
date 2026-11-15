import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

function SheetContent({
  className,
  children,
  side = 'left',
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { side?: 'left' | 'right' }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed inset-y-0 z-50 flex w-[19rem] max-w-[85vw] flex-col border-white/[0.08] bg-[#0d0d0f] shadow-2xl transition ease-in-out',
          side === 'left'
            ? 'left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
            : 'right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-300 data-[state=closed]:duration-200',
          className,
        )}
        {...props}
      >
        <DialogPrimitive.Title className="sr-only">Menu de navegação</DialogPrimitive.Title>
        {children}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          aria-label="Fechar menu"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export { Sheet, SheetClose, SheetContent, SheetTrigger }
