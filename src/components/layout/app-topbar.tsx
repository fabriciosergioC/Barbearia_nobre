import { LogOut, Menu, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Logo } from '@/components/shared/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { useMyContext } from '@/hooks/use-my-context'
import { getInitials } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import { ROLE_LABELS } from '@/types/app'

import { navigation } from './navigation'

export function AppTopbar() {
  const { data: context } = useMyContext()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const setMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen)

  const current = navigation
    .flatMap((section) => section.items)
    .find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))

  async function handleSignOut() {
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-white/[0.06] bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu />
        </Button>
        <Link to="/" className="md:hidden" aria-label="Ir para o painel">
          <Logo compact />
        </Link>
        <div className="hidden min-w-0 flex-col md:flex">
          <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground/60 uppercase">
            {current ? 'Nobre · ' + current.label : 'Nobre'}
          </span>
          <span className="font-display truncate text-sm font-semibold text-foreground">
            {context?.establishment.name ?? 'Gestão de barbearia'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {context && (
          <Badge variant="outline" className="hidden sm:inline-flex">
            {ROLE_LABELS[context.profile.role]}
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-transparent p-1 transition-colors hover:border-white/[0.08] hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
              aria-label="Abrir menu da conta"
            >
              <Avatar className="size-8 border border-white/[0.08]">
                <AvatarImage src={context?.profile.avatar_url ?? undefined} alt="" />
                <AvatarFallback>{getInitials(context?.profile.full_name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate text-xs font-semibold text-foreground">
                {context?.profile.full_name ?? 'Usuário'}
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-normal text-muted-foreground">
                {context?.profile.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/minha-conta')}>
              <UserRound />
              Minha conta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
