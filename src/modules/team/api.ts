import { supabase } from '@/lib/supabase'
import type { AppRole, MemberStatus } from '@/types/database'

export interface TeamMember {
  id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: AppRole
  status: MemberStatus
  created_at: string
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase()
    .from('profiles')
    .select('id, full_name, email, phone, avatar_url, role, status, created_at')
    .order('created_at', { ascending: true })
    .returns<TeamMember[]>()

  if (error) throw error
  return data ?? []
}

export async function updateMemberRole(memberId: string, role: AppRole): Promise<void> {
  const { error } = await supabase().from('profiles').update({ role }).eq('id', memberId)
  if (error) throw error
}

export async function updateMemberStatus(memberId: string, status: MemberStatus): Promise<void> {
  const { error } = await supabase().from('profiles').update({ status }).eq('id', memberId)
  if (error) throw error
}

export interface InviteMemberPayload {
  fullName: string
  email: string
  role: AppRole
}

export async function inviteMember(payload: InviteMemberPayload): Promise<void> {
  const client = supabase()

  const send = () =>
    client.functions.invoke('team-invite', {
      body: {
        full_name: payload.fullName,
        email: payload.email,
        role: payload.role,
      },
    })

  let { data, error } = await send()
  let status = 0
  let serverMessage: string | null = null

  if (error) {
    const response = (error as { context?: unknown }).context

    if (response instanceof Response) {
      status = response.status
      try {
        const body = (await response.clone().json()) as { error?: string }
        serverMessage = body?.error ?? null
      } catch {
        serverMessage = null
      }
    }
  }

  // Token expirado: renova a sessão e tenta uma vez mais.
  if (error && status === 401) {
    const { data: refreshed } = await client.auth.refreshSession()
    if (!refreshed.session) {
      await client.auth.signOut()
      throw new Error('Sua sessão expirou. Entre novamente.')
    }

    ;({ data, error } = await send())
    serverMessage = null

    if (error) {
      const response = (error as { context?: unknown }).context
      if (response instanceof Response) {
        try {
          const body = (await response.json()) as { error?: string }
          serverMessage = body?.error ?? null
        } catch {
          serverMessage = null
        }
      }
    }
  }

  if (error) {
    throw new Error(serverMessage ?? error.message)
  }

  if (data?.error) throw new Error(String(data.error))
}
