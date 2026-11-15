import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query-client'

import { AuthProvider } from './auth-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            closeButton
            toastOptions={{
              style: {
                background: '#141416',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f4f2ed',
                fontSize: '13px',
              },
            }}
          />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
