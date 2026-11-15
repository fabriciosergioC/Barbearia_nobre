import { ChevronLeft, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

import { Logo } from '@/components/shared/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'
import { useMyContext } from '@/hooks/use-my-context'
import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/types/app'

import { visibleNavigation } from './navigation'

interface SidebarContentProps {
  collapsed: boolean
  onNavigate?: () => void
  onCollapse?: () => void
  showCollapse?: boolean
}

export function SidebarContent({
  collapsed,
  onNavigate,
  onCollapse,
  showCollapse = true,
}: SidebarContentProps) {
  const { data: context } = useMyContext()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const sections = visibleNavigation(context?.permissions ?? [], context?.profile.role === 'admin')

  async function handleSignOut() {
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-16 items-center border-b border-white/[0.06] px-4', collapsed && 'justify-center px-0')}>
        <NavLink to="/" onClick={onNavigate} aria-label="Ir para o painel">
          <Logo compact={collapsed} showTagline={false} />
        </NavLink>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Navegação principal">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground/60 uppercase">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const link = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground transition-colors',
                      'hover:bg-white/[0.04] hover:text-foreground',
                      isActive && 'bg-primary/[0.08] text-primary',
                      collapsed && 'justify-center px-0',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                      )}
                      <item.icon className="size-[17px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              )

              if (!collapsed) return link

              return (
                <Tooltip key={item.to} delayDuration={100}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        {!collapsed && context && (
          <div className="mb-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
            <p className="truncate text-xs font-medium text-foreground">{context.establishment.name}</p>
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              Plano de gestão · {ROLE_LABELS[context.profile.role]}
            </p>
          </div>
        )}

        <div className={cn('flex items-center gap-2', collapsed && 'flex-col')}>
          {showCollapse && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onCollapse}
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
              className="text-muted-foreground"
            >
              {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          )}
          {!collapsed && (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Avatar className="size-7 border border-white/[0.06]">
                <AvatarImage src={context?.profile.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="text-[10px]">{getInitials(context?.profile.full_name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-foreground">{context?.profile.full_name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{context?.profile.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            aria-label="Sair do sistema"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut />
          </Button>
        </div>
        {!collapsed && (
          <p className="mt-3 flex items-center gap-1 px-1 text-[9px] tracking-wide text-muted-foreground/40">
            <ChevronLeft className="size-3" />
            Nobre · versão 1.0
          </p>
        )}
      </div>
    </div>
  )
}
