import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Scissors,
  UsersRound,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { PageHeader } from '@/components/shared/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyContext } from '@/hooks/use-my-context'
import { formatDate, getInitials } from '@/lib/format'
import { useTeamMembers } from '@/modules/team/hooks'
import { ROLE_LABELS } from '@/types/app'

const roadmap = [
  { phase: 'Fase 1', label: 'Fundação, autenticação e permissões', status: 'Concluída' },
  { phase: 'Fase 2', label: 'Clientes, barbeiros e serviços', status: 'Próxima' },
  { phase: 'Fase 3', label: 'Agenda com validação de conflitos', status: 'Planejada' },
  { phase: 'Fase 4', label: 'Contas a pagar e receber', status: 'Planejada' },
  { phase: 'Fase 5', label: 'Comissões, estoque e vendas', status: 'Planejada' },
  { phase: 'Fase 6', label: 'Automações e notificações', status: 'Planejada' },
  { phase: 'Fase 7', label: 'Dashboard analítico e relatórios', status: 'Planejada' },
]

export function DashboardPage() {
  const { data: context } = useMyContext()
  const { data: members, isLoading } = useTeamMembers()

  if (!context) return null

  const activeMembers = members?.filter((member) => member.status === 'ativo') ?? []
  const pendingSetup = [
    !context.establishment.phone && 'telefone do estabelecimento',
    !context.establishment.email && 'e-mail de contato',
    !context.establishment.document && 'CPF/CNPJ',
    !context.establishment.address?.city && 'endereço',
    activeMembers.length < 2 && 'equipe convidada',
  ].filter(Boolean) as string[]

  const setupDone = 5 - pendingSetup.length
  const setupPercent = Math.round((setupDone / 5) * 100)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${context.profile.full_name.split(' ')[0]}`}
        description="Este é o seu painel inicial. A estrutura de base está ativa e integrada ao banco de dados."
        actions={
          <Button asChild variant="outline">
            <Link to="/minha-conta">
              Minha conta
              <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Equipe ativa
              </span>
              <UsersRound className="size-4 text-primary/80" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="font-display text-3xl font-bold text-foreground">
                {activeMembers.length}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  / {members?.length ?? 0}
                </span>
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">Usuários com acesso ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Seu perfil
              </span>
              <CheckCircle2 className="size-4 text-primary/80" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">
              {ROLE_LABELS[context.profile.role]}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {context.permissions.length} permissões concedidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Configuração
              </span>
              <Clock3 className="size-4 text-primary/80" />
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{setupPercent}%</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${setupPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {pendingSetup.length === 0
                ? 'Cadastro completo'
                : `${pendingSetup.length} pendência${pendingSetup.length > 1 ? 's' : ''} de cadastro`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Estabelecimento
              </span>
              <Scissors className="size-4 text-primary/80" />
            </div>
            <p className="font-display truncate text-xl font-bold text-foreground">
              {context.establishment.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Criado em {formatDate(context.establishment.created_at)}
            </p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Equipe do estabelecimento</CardTitle>
              <CardDescription>Pessoas com acesso ao sistema.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/equipe">
                Gerenciar
                <ArrowUpRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            )}
            {!isLoading && members?.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Nenhum membro encontrado.
              </p>
            )}
            {members?.slice(0, 5).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5"
              >
                <Avatar className="size-8">
                  <AvatarImage src={member.avatar_url ?? undefined} alt="" />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(member.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {member.full_name}
                    {member.id === context.profile.id && (
                      <span className="ml-1.5 text-[10px] text-muted-foreground">(você)</span>
                    )}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{member.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {ROLE_LABELS[member.role]}
                  </Badge>
                  <Badge variant={member.status === 'ativo' ? 'success' : 'secondary'}>
                    {member.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas etapas</CardTitle>
            <CardDescription>Evolução planejada do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {roadmap.map((item) => (
              <div
                key={item.phase}
                className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.02]"
              >
                <span className="mt-0.5 w-12 shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground/60 uppercase">
                  {item.phase}
                </span>
                <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {item.label}
                </p>
                <Badge variant={item.status === 'Concluída' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: CalendarDays, title: 'Agenda', description: 'Calendário e conflitos na Fase 3' },
          { icon: Wallet, title: 'Financeiro', description: 'Contas e baixas na Fase 4' },
          { icon: CircleDollarSign, title: 'Comissões', description: 'Cálculo automático na Fase 5' },
          { icon: UsersRound, title: 'Relatórios', description: 'Indicadores na Fase 7' },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.07] px-4 py-3.5"
          >
            <item.icon className="size-4 shrink-0 text-muted-foreground/60" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{item.title}</p>
              <p className="truncate text-[10px] text-muted-foreground/60">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
