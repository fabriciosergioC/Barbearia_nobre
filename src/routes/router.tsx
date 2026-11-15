import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/app-layout'
import { LoadingScreen } from '@/components/shared/loading-screen'
import { AccountPage } from '@/modules/account/account-page'
import { AuthLayout } from '@/modules/auth/auth-layout'
import { ForgotPasswordPage } from '@/modules/auth/pages/forgot-password-page'
import { LoginPage } from '@/modules/auth/pages/login-page'
import { ResetPasswordPage } from '@/modules/auth/pages/reset-password-page'
import { SignUpPage } from '@/modules/auth/pages/sign-up-page'
import { DashboardPage } from '@/modules/dashboard/dashboard-page'
import { NotFoundPage } from '@/modules/errors/not-found-page'
import { RouteErrorBoundary } from '@/modules/errors/route-error-boundary'

import { RequireAuth, RequirePermission, RequireSession } from './guards'

const OnboardingPage = lazy(() =>
  import('@/modules/auth/pages/onboarding-page').then((module) => ({ default: module.OnboardingPage })),
)
const TeamPage = lazy(() =>
  import('@/modules/team/team-page').then((module) => ({ default: module.TeamPage })),
)
const SettingsPage = lazy(() =>
  import('@/modules/settings/settings-page').then((module) => ({ default: module.SettingsPage })),
)
const ForbiddenPage = lazy(() =>
  import('@/modules/errors/forbidden-page').then((module) => ({ default: module.ForbiddenPage })),
)

function LazyPage({ children, label }: { children: ReactNode; label?: string }) {
  return <Suspense fallback={<LoadingScreen label={label} />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'cadastro', element: <SignUpPage /> },
      { path: 'recuperar-senha', element: <ForgotPasswordPage /> },
      { path: 'redefinir-senha', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/onboarding',
    element: (
      <RequireSession>
        <LazyPage label="Carregando configuração">
          <OnboardingPage />
        </LazyPage>
      </RequireSession>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'equipe',
        element: (
          <RequirePermission permission="users.view">
            <LazyPage label="Carregando equipe">
              <TeamPage />
            </LazyPage>
          </RequirePermission>
        ),
      },
      {
        path: 'configuracoes',
        element: (
          <RequirePermission permission="settings.establishment.manage">
            <LazyPage label="Carregando configurações">
              <SettingsPage />
            </LazyPage>
          </RequirePermission>
        ),
      },
      { path: 'minha-conta', element: <AccountPage /> },
      {
        path: 'sem-permissao',
        element: (
          <LazyPage>
            <ForbiddenPage />
          </LazyPage>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '*',
    element: (
      <div className="min-h-svh bg-background">
        <NotFoundPage />
      </div>
    ),
  },
])
