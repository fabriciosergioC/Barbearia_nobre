/**
 * Erros do Supabase/PostgREST traduzidos para mensagens exibíveis ao usuário.
 * O texto técnico permanece disponível no console para diagnóstico.
 */
export function getErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.'): string {
  if (!error) return fallback

  if (error instanceof Error) {
    const message = error.message

    if (/failed to fetch|networkerror|load failed/i.test(message)) {
      return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
    }
    if (/invalid login credentials/i.test(message)) {
      return 'E-mail ou senha incorretos.'
    }
    if (/email not confirmed/i.test(message)) {
      return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
    }
    if (/user already registered|already been registered/i.test(message)) {
      return 'Este e-mail já possui uma conta.'
    }
    if (/password should be at least/i.test(message)) {
      return 'A senha precisa ter pelo menos 8 caracteres.'
    }
    if (/email rate limit|over_email_send_rate_limit/i.test(message)) {
      return 'Muitos envios de e-mail em pouco tempo. Aguarde alguns minutos.'
    }
    if (/auth session missing|invalid or has expired|token has expired/i.test(message)) {
      return 'Link inválido ou expirado. Solicite um novo link de recuperação.'
    }
    if (/jwt expired|invalid refresh token|session_not_found/i.test(message)) {
      return 'Sua sessão expirou. Entre novamente.'
    }
    if (/establishment.*slug|identificador de estabelecimento/i.test(message)) {
      return 'Este identificador de estabelecimento já está em uso.'
    }
    if (/duplicate key value|23505/.test(message)) {
      return 'Já existe um registro com essas informações.'
    }
    if (/violates row-level security|42501|permission denied/i.test(message)) {
      return 'Você não tem permissão para essa ação.'
    }
    if (/já possui|already has a profile/i.test(message)) {
      return 'Este usuário já está vinculado a um estabelecimento.'
    }

    return message
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return getErrorMessage(new Error(String((error as { message: unknown }).message)), fallback)
  }

  return fallback
}
