import { LayoutDashboard, Settings2, UserRound, UsersRound, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  permission?: string
  end?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    title: 'Operação',
    items: [{ label: 'Painel', to: '/', icon: LayoutDashboard, permission: 'dashboard.view', end: true }],
  },
  {
    title: 'Gestão',
    items: [
      { label: 'Equipe', to: '/equipe', icon: UsersRound, permission: 'users.view' },
      {
        label: 'Estabelecimento',
        to: '/configuracoes',
        icon: Settings2,
        permission: 'settings.establishment.manage',
      },
    ],
  },
  {
    title: 'Conta',
    items: [{ label: 'Minha conta', to: '/minha-conta', icon: UserRound }],
  },
]

export function visibleNavigation(permissions: string[], isAdmin = false): NavSection[] {
  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permission || isAdmin || permissions.includes(item.permission)),
    }))
    .filter((section) => section.items.length > 0)
}
