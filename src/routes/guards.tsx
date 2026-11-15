import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { ErrorState } from '@/components/shared/error-state'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useMyContext } from '@/hooks/use-my-context'
import { getErrorMessage } from '@/lib/errors'

export function RequireSession({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingScreen label="Verificando sessão" />
  if (status === 'anonymous') {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }

  return children
}

function InactiveAccess() {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">Acesso inativo</h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Seu usuário está desativado neste estabelecimento. Fale com um administrador para
          reativar o acesso.
        </p>
      </div>
      <Button variant="outline" onClick={() => void signOut()}>
        Sair da conta
      </Button>
    </div>
  )
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, signOut } = useAuth()
  const { data: context, isLoading, isError, error, refetch } = useMyContext()

  if (status === 'loading') return <LoadingScreen label="Verificando sessão" />
  if (status === 'anonymous') return <Navigate to="/auth/login" replace />

  if (isLoading) return <LoadingScreen label="Carregando seu acesso" />

  if (isError) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6">
        <div className="w-full max-w-md space-y-4">
          <ErrorState
            title="Não foi possível carregar seu acesso"
            description={getErrorMessage(error)}
            onRetry={() => void refetch()}
          />
          <Button variant="ghost" className="w-full" onClick={() => void signOut()}>
            Sair e entrar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!context) return <Navigate to="/onboarding" replace />
  if (context.profile.status !== 'ativo') return <InactiveAccess />

  return children
}

export function RequirePermission({
  permission,
  children,
}: {
  permission: string
  children: ReactNode
}) {
  const { data: context } = useMyContext()

  const allowed =
    context?.profile.status === 'ativo' &&
    (context.profile.role === 'admin' || context.permissions.includes(permission))

  if (!allowed) return <Navigate to="/sem-permissao" replace />

  return children
}
