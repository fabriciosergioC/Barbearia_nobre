import { RouterProvider } from 'react-router-dom'

import { isSupabaseConfigured } from '@/lib/env'
import { SetupRequiredPage } from '@/modules/errors/setup-required-page'
import { AppProviders } from '@/providers/app-providers'
import { router } from '@/routes/router'

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupRequiredPage />
  }

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
