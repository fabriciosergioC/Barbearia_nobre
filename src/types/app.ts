import type { AppRole, MemberStatus } from './database'

export interface MyProfile {
  id: string
  establishment_id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: AppRole
  status: MemberStatus
  created_at: string
}

export interface EstablishmentAddress {
  street?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  zip?: string
}

export interface MyEstablishment {
  id: string
  name: string
  slug: string
  phone: string | null
  email: string | null
  document: string | null
  address: EstablishmentAddress | null
  timezone: string
  logo_url: string | null
  created_at: string
}

export interface MyContext {
  profile: MyProfile
  establishment: MyEstablishment
  permissions: string[]
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  recepcionista: 'Recepcionista',
  barbeiro: 'Barbeiro',
}

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: 'Acesso total ao sistema, incluindo equipe, financeiro e auditoria.',
  gerente: 'Administra operação e financeiro conforme permissões concedidas.',
  recepcionista: 'Agenda, clientes e operações autorizadas do dia a dia.',
  barbeiro: 'Acesso aos próprios atendimentos, serviços e comissões.',
}
