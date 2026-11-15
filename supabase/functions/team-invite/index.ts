// ============================================================================
// Nobre · Edge Function: team-invite
// Convida um novo membro para o estabelecimento do solicitante.
// Requer a permissão users.manage. Usa service_role apenas no servidor.
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2'

const ROLES = ['admin', 'gerente', 'recepcionista', 'barbeiro'] as const
type Role = (typeof ROLES)[number]

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405, origin)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Sessão inválida. Entre novamente.' }, 401, origin)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Função sem configuração do Supabase.' }, 500, origin)
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const accessToken = authHeader.slice('Bearer '.length).trim()

  const {
    data: { user },
    error: authError,
  } = await callerClient.auth.getUser(accessToken)

  if (authError || !user) {
    return json({ error: 'Sessão inválida. Entre novamente.' }, 401, origin)
  }

  const { data: allowed, error: permissionError } = await callerClient.rpc('has_permission', {
    p_permission: 'users.manage',
  })

  if (permissionError || !allowed) {
    return json({ error: 'Você não tem permissão para convidar membros.' }, 403, origin)
  }

  let payload: { full_name?: string; email?: string; role?: string }
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Corpo da requisição inválido.' }, 400, origin)
  }

  const fullName = String(payload.full_name ?? '').trim()
  const email = String(payload.email ?? '').trim().toLowerCase()
  const role = String(payload.role ?? '') as Role

  if (fullName.length < 3 || fullName.length > 120) {
    return json({ error: 'Informe o nome completo do membro.' }, 422, origin)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ error: 'Informe um e-mail válido.' }, 422, origin)
  }

  if (!ROLES.includes(role)) {
    return json({ error: 'Perfil de acesso inválido.' }, 422, origin)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const callerProfile = await adminClient
    .from('profiles')
    .select('establishment_id, status')
    .eq('id', user.id)
    .maybeSingle()

  if (callerProfile.error || !callerProfile.data) {
    return json({ error: 'Perfil do solicitante não encontrado.' }, 403, origin)
  }

  if (callerProfile.data.status !== 'ativo') {
    return json({ error: 'Seu acesso está inativo.' }, 403, origin)
  }

  const establishmentId = callerProfile.data.establishment_id

  const alreadyMember = await adminClient
    .from('profiles')
    .select('id')
    .eq('establishment_id', establishmentId)
    .eq('email', email)
    .maybeSingle()

  if (alreadyMember.data) {
    return json({ error: 'Esta pessoa já faz parte da sua equipe.' }, 409, origin)
  }

  const appUrl = (Deno.env.get('APP_URL') ?? 'http://localhost:5173').replace(/\/$/, '')

  const invite = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/redefinir-senha`,
    data: { full_name: fullName },
  })

  if (invite.error || !invite.data.user) {
    const message = invite.error?.message ?? ''
    const code = invite.error?.code ?? ''
    if (/already|registered|exists/i.test(message)) {
      return json(
        { error: 'Este e-mail já possui uma conta no sistema. Cada usuário acessa um único estabelecimento.' },
        409,
        origin,
      )
    }
    if (code === 'email_address_invalid' || /invalid|not valid|not deliverable/i.test(message)) {
      return json({ error: 'E-mail inválido ou não entregável. Use um endereço real.' }, 422, origin)
    }
    if (/rate limit|too many|exceeded/i.test(message)) {
      return json({ error: 'Limite de envios atingido. Aguarde alguns minutos e tente novamente.' }, 429, origin)
    }
    console.error('[team-invite] invite error', code, message)
    return json({ error: 'Não foi possível enviar o convite. Tente novamente.' }, 502, origin)
  }

  const invitedUser = invite.data.user

  const profileInsert = await adminClient.from('profiles').insert({
    id: invitedUser.id,
    establishment_id: establishmentId,
    full_name: fullName,
    email,
    role,
    status: 'ativo',
  })

  if (profileInsert.error) {
    console.error('[team-invite] profile insert error', profileInsert.error.message)
    await adminClient.auth.admin.deleteUser(invitedUser.id)
    return json({ error: 'Não foi possível vincular o membro ao estabelecimento.' }, 500, origin)
  }

  await adminClient.from('audit_logs').insert({
    establishment_id: establishmentId,
    actor_id: user.id,
    action: 'member.invited',
    entity: 'profiles',
    entity_id: invitedUser.id,
    after: { email, role, full_name: fullName },
    metadata: { source: 'team-invite' },
  })

  return json({ ok: true, user_id: invitedUser.id }, 200, origin)
})
