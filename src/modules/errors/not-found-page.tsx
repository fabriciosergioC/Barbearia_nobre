import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Compass className="size-6 text-primary" />
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-primary/80 uppercase">Erro 404</p>
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          O endereço acessado não existe ou foi movido. Volte ao painel para continuar.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Voltar ao painel</Link>
      </Button>
    </div>
  )
}
