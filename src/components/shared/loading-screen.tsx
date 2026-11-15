import { Loader2 } from 'lucide-react'

import { Logo } from './logo'

export function LoadingScreen({ label = 'Carregando' }: { label?: string }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 bg-background">
      <Logo showTagline />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin text-primary" />
        {label}…
      </div>
    </div>
  )
}
