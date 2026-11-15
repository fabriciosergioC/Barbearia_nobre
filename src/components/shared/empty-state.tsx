import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-12 text-center',
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
