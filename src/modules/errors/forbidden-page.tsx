import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10">
        <ShieldX className="size-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Sem permissão</h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Seu perfil não tem acesso a esta área. Se você precisa desse recurso, solicite ao
          administrador do estabelecimento.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link to="/">Voltar ao painel</Link>
      </Button>
    </div>
  )
}
