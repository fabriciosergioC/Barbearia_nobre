import { Scissors } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  compact?: boolean
  showTagline?: boolean
}

export function Logo({ className, compact = false, showTagline = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/[0.09] shadow-[0_0_24px_-8px_rgba(201,162,74,0.6)]">
        <Scissors className="size-[18px] text-primary" strokeWidth={2.1} />
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-extrabold tracking-[0.18em] text-foreground">
            NOBRE
          </span>
          {showTagline && (
            <span className="mt-1 text-[9px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
              Gestão de barbearia
            </span>
          )}
        </div>
      )}
    </div>
  )
}
