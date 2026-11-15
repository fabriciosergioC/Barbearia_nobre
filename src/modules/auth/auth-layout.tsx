import { CalendarCheck2, CircleDollarSign, Scissors, Sparkles } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { Logo } from '@/components/shared/logo'

const highlights = [
  {
    icon: CalendarCheck2,
    title: 'Agenda sem conflitos',
    description: 'Horários, duração e disponibilidade validados no banco.',
  },
  {
    icon: CircleDollarSign,
    title: 'Financeiro sob controle',
    description: 'Contas a pagar e receber, baixas parciais e comissões.',
  },
  {
    icon: Sparkles,
    title: 'Operação automatizada',
    description: 'Lembretes, confirmações e relatórios em segundo plano.',
  },
]

export function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#0c0c0e] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(46rem 30rem at 10% 0%, rgba(201,162,74,0.14), transparent 60%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: 'auto, 56px 56px, 56px 56px',
          }}
        />
        <Scissors
          className="pointer-events-none absolute -right-16 -bottom-20 size-[26rem] rotate-12 text-white/[0.02]"
          strokeWidth={0.6}
        />

        <Link to="/auth/login" className="relative w-fit" aria-label="Nobre">
          <Logo showTagline />
        </Link>

        <div className="relative max-w-md space-y-8">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-primary/90 uppercase">
              Sistema de gestão premium
            </p>
            <h1 className="font-display text-4xl leading-[1.08] font-bold text-foreground xl:text-[2.9rem]">
              A gestão da sua barbearia, <span className="gold-text">no ponto certo.</span>
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Agenda, clientes, financeiro, comissões e estoque em um único lugar. Sem planilhas, sem
              retrabalho, sem caixa.
            </p>
          </div>

          <ul className="space-y-4">
            {highlights.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.07]">
                  <item.icon className="size-4 text-primary" />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{item.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-[11px] text-muted-foreground/70">
          <span className="h-px w-8 bg-primary/40" />
          Feito para barbearias que levam a sério o próprio negócio.
        </div>
      </aside>

      <main className="flex min-h-svh flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 lg:hidden">
          <Logo showTagline />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
        <p className="px-6 pb-6 text-center text-[10px] tracking-wide text-muted-foreground/50">
          © {new Date().getFullYear()} Nobre · Seus dados protegidos conforme a LGPD
        </p>
      </main>
    </div>
  )
}
