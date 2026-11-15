import { AlertTriangle } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function RouteErrorBoundary() {
  const error = useRouteError()

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Erro inesperado ao carregar a página.'

  if (import.meta.env.DEV) {
    console.error('[router]', error)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl border border-destructive/25 bg-destructive/10">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">Não foi possível abrir esta página</h1>
        <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground">{message}</p>
      </div>
      <Button asChild variant="outline">
        <Link to="/">Voltar ao painel</Link>
      </Button>
    </div>
  )
}
