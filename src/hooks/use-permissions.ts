import { useMemo } from 'react'

import { useMyContext } from './use-my-context'

export function usePermissions() {
  const { data: context } = useMyContext()

  return useMemo(
    () => ({
      role: context?.profile.role ?? null,
      permissions: context?.permissions ?? [],
      isAdmin: context?.profile.role === 'admin',
      can: (permission: string) => {
        if (!context || context.profile.status !== 'ativo') return false
        return context.profile.role === 'admin' || context.permissions.includes(permission)
      },
    }),
    [context],
  )
}
