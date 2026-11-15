import { isSupabaseConfigured } from '@/lib/env'

export function SetupRequiredPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-5 py-10">
      <div className="w-full max-w-xl space-y-6 rounded-2xl border border-white/[0.08] bg-card p-7">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
            Configuração necessária
          </p>
          <h1 className="text-2xl font-semibold">Conecte o projeto ao Supabase</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            O aplicativo está pronto, mas ainda não há credenciais do Supabase. Crie o arquivo{' '}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-foreground">.env</code>{' '}
            na raiz do projeto com as chaves do painel do Supabase.
          </p>
        </div>

        <pre className="overflow-x-auto rounded-lg border border-white/[0.06] bg-[#0a0a0b] p-4 text-xs leading-relaxed text-muted-foreground">
          <code>{`VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
VITE_APP_URL=http://localhost:5173`}</code>
        </pre>

        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
          <p>1. Copie as credenciais em Project Settings → API.</p>
          <p>2. Use apenas a chave anon/publishable. A service_role nunca vai para o frontend.</p>
          <p>3. Aplique as migrations em supabase/migrations e reinicie o servidor.</p>
        </div>

        <p className="text-[11px] text-muted-foreground/60">
          Status: credenciais do Supabase {isSupabaseConfigured ? 'detectadas' : 'ausentes'}.
        </p>
      </div>
    </div>
  )
}
