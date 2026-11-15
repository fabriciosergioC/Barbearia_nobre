import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Algo saiu do esperado',
  description = 'Não conseguimos carregar estas informações agora. Tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/[0.04] px-6 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl border border-destructive/25 bg-destructive/10">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-foreground">{title}</p>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw />
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
