import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Loader2,
  MailPlus,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import { Field, FormError } from '@/components/shared/field'
import { PageHeader } from '@/components/shared/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMyContext } from '@/hooks/use-my-context'
import { usePermissions } from '@/hooks/use-permissions'
import { formatDate, getInitials } from '@/lib/format'
import { getErrorMessage } from '@/lib/errors'
import { inviteMember, updateMemberRole, updateMemberStatus, type TeamMember } from '@/modules/team/api'
import { useTeamMembers } from '@/modules/team/hooks'
import { inviteMemberSchema, type InviteMemberInput } from '@/schemas/auth'
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/types/app'
import type { AppRole } from '@/types/database'

const roles: AppRole[] = ['admin', 'gerente', 'recepcionista', 'barbeiro']

export function TeamPage() {
  const { data: context } = useMyContext()
  const { can } = usePermissions()
  const { data: members, isLoading, isError, error, refetch } = useTeamMembers()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [memberToDeactivate, setMemberToDeactivate] = useState<TeamMember | null>(null)

  const canManage = can('users.manage')

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return members ?? []
    return (members ?? []).filter(
      (member) =>
        member.full_name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        ROLE_LABELS[member.role].toLowerCase().includes(term),
    )
  }, [members, search])

  const roleMutation = useMutation({
    mutationFn: ({ member, role }: { member: TeamMember; role: AppRole }) =>
      updateMemberRole(member.id, role),
    onSuccess: (_data, variables) => {
      toast.success(`Perfil de ${variables.member.full_name} atualizado.`)
      void queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, 'Não foi possível alterar o perfil.'))
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ member, status }: { member: TeamMember; status: 'ativo' | 'inativo' }) =>
      updateMemberStatus(member.id, status),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === 'ativo'
          ? `${variables.member.full_name} foi reativado.`
          : `${variables.member.full_name} foi desativado.`,
      )
      setMemberToDeactivate(null)
      void queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
    onError: (mutationError) => {
      toast.error(getErrorMessage(mutationError, 'Não foi possível alterar o status.'))
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipe"
        description="Gerencie quem acessa o estabelecimento e o que cada perfil pode fazer."
        actions={
          canManage && (
            <Button onClick={() => setInviteOpen(true)}>
              <MailPlus />
              Convidar membro
            </Button>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <div
            key={role}
            className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-primary/80" />
              <p className="text-xs font-semibold text-foreground">{ROLE_LABELS[role]}</p>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-card/80">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, e-mail ou perfil"
              className="h-9 pl-9"
              aria-label="Buscar membros"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {members?.length ?? 0} membro{(members?.length ?? 0) === 1 ? '' : 's'} no estabelecimento
          </p>
        </div>

        {isLoading && (
          <div className="space-y-2 p-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {isError && (
          <div className="p-6 text-center">
            <p className="text-xs text-destructive">{getErrorMessage(error)}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredMembers.length === 0 && (
          <div className="p-4">
            <EmptyState
              icon={Search}
              title={search ? 'Nenhum membro encontrado' : 'Equipe vazia'}
              description={
                search
                  ? 'Ajuste a busca para encontrar outra pessoa.'
                  : 'Convide um profissional ou recepcionista para começar.'
              }
              action={
                !search && canManage ? (
                  <Button size="sm" onClick={() => setInviteOpen(true)}>
                    <MailPlus />
                    Convidar membro
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}

        {!isLoading && filteredMembers.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Membro</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Desde</TableHead>
                {canManage && <TableHead className="w-10 pr-4" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const isSelf = member.id === context?.profile.id
                return (
                  <TableRow key={member.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={member.avatar_url ?? undefined} alt="" />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                            {member.full_name}
                            {isSelf && (
                              <span className="text-[10px] font-normal text-muted-foreground">(você)</span>
                            )}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'ativo' ? 'success' : 'secondary'}>
                        {member.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-[11px] text-muted-foreground md:table-cell">
                      {formatDate(member.created_at)}
                    </TableCell>
                    {canManage && (
                      <TableCell className="pr-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Ações para ${member.full_name}`}
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger disabled={isSelf}>
                                <UserCheck />
                                Alterar perfil
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {roles.map((role) => (
                                  <DropdownMenuItem
                                    key={role}
                                    disabled={member.role === role}
                                    onSelect={() => roleMutation.mutate({ member, role })}
                                  >
                                    {ROLE_LABELS[role]}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            {member.status === 'ativo' ? (
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={isSelf}
                                onSelect={() => setMemberToDeactivate(member)}
                              >
                                <UserX />
                                Desativar acesso
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={() => statusMutation.mutate({ member, status: 'ativo' })}
                              >
                                <UserCheck />
                                Reativar acesso
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} canManage={canManage} />

      <Dialog
        open={Boolean(memberToDeactivate)}
        onOpenChange={(open) => !open && setMemberToDeactivate(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Desativar acesso</DialogTitle>
            <DialogDescription>
              {memberToDeactivate?.full_name} não poderá mais entrar no sistema. O histórico do
              usuário é mantido e o acesso pode ser reativado depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToDeactivate(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={statusMutation.isPending}
              onClick={() =>
                memberToDeactivate &&
                statusMutation.mutate({ member: memberToDeactivate, status: 'inativo' })
              }
            >
              {statusMutation.isPending && <Loader2 className="animate-spin" />}
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InviteMemberDialog({
  open,
  onOpenChange,
  canManage,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  canManage: boolean
}) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { fullName: '', email: '', role: 'barbeiro' },
  })

  const inviteMutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      toast.success('Convite enviado por e-mail.')
      void queryClient.invalidateQueries({ queryKey: ['team-members'] })
      reset()
      setFormError(null)
      onOpenChange(false)
    },
    onError: (mutationError) => {
      const message = getErrorMessage(mutationError, 'Não foi possível enviar o convite.')
      setFormError(
        /edge function|failed to send a request/i.test(message)
          ? 'O serviço de convites ainda não está publicado. Aplique a função team-invite no Supabase e tente novamente.'
          : message,
      )
    },
  })

  function onSubmit(values: InviteMemberInput) {
    setFormError(null)
    inviteMutation.mutate(values)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          reset()
          setFormError(null)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            A pessoa receberá um e-mail para definir a senha e acessar o estabelecimento com o
            perfil escolhido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormError message={formError} />

          <Field label="Nome completo" htmlFor="invite-name" error={errors.fullName?.message} required>
            <Input id="invite-name" placeholder="Nome do membro" {...register('fullName')} />
          </Field>

          <Field label="E-mail" htmlFor="invite-email" error={errors.email?.message} required>
            <Input
              id="invite-email"
              type="email"
              placeholder="pessoa@barbearia.com"
              {...register('email')}
            />
          </Field>

          <Field label="Perfil de acesso" htmlFor="invite-role" error={errors.role?.message} required>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="invite-role" aria-invalid={Boolean(errors.role)}>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canManage || inviteMutation.isPending}>
              {inviteMutation.isPending && <Loader2 className="animate-spin" />}
              Enviar convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
