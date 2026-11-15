import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Loader2, LogOut, Mail, Save, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Field, FormError, PasswordInput } from '@/components/shared/field'
import { PageHeader } from '@/components/shared/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useMyContext } from '@/hooks/use-my-context'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime, getInitials, maskPhone } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { profileSchema, resetPasswordSchema, type ProfileInput, type ResetPasswordInput } from '@/schemas/auth'
import { ROLE_LABELS } from '@/types/app'

export function AccountPage() {
  const { data: context } = useMyContext()
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [signOutOpen, setSignOutOpen] = useState(false)

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: context?.profile.full_name ?? '',
      phone: context?.profile.phone ?? '',
    },
  })

  const passwordForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const profileMutation = useMutation({
    mutationFn: async (values: ProfileInput) => {
      const { error } = await supabase()
        .from('profiles')
        .update({ full_name: values.fullName, phone: values.phone || null })
        .eq('id', context?.profile.id ?? '')

      if (error) throw error
    },
    onSuccess: (_data, values) => {
      toast.success('Perfil atualizado.')
      profileForm.reset(values)
      void queryClient.invalidateQueries({ queryKey: ['my-context'] })
      void queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
    onError: (error) => setProfileError(getErrorMessage(error)),
  })

  const passwordMutation = useMutation({
    mutationFn: async (values: ResetPasswordInput) => {
      const { error } = await supabase().auth.updateUser({ password: values.password })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Senha atualizada com sucesso.')
      passwordForm.reset()
    },
    onError: (error) => setPasswordError(getErrorMessage(error)),
  })

  if (!context) return null

  async function handleSignOutAll() {
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Minha conta"
        description="Seus dados de acesso, perfil e segurança."
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="size-12 border border-white/[0.08]">
                  <AvatarImage src={context.profile.avatar_url ?? undefined} alt="" />
                  <AvatarFallback className="text-sm">
                    {getInitials(context.profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <CardTitle className="truncate">{context.profile.full_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="size-3" />
                    {context.profile.email}
                    <Badge variant="outline">{ROLE_LABELS[context.profile.role]}</Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit((values) => {
                  setProfileError(null)
                  profileMutation.mutate(values)
                })}
                className="space-y-5"
                noValidate
              >
                <FormError message={profileError} />

                <Field
                  label="Nome completo"
                  htmlFor="fullName"
                  error={profileForm.formState.errors.fullName?.message}
                  required
                >
                  <Input
                    id="fullName"
                    autoComplete="name"
                    aria-invalid={Boolean(profileForm.formState.errors.fullName)}
                    {...profileForm.register('fullName')}
                  />
                </Field>

                <Field
                  label="Telefone"
                  htmlFor="phone"
                  error={profileForm.formState.errors.phone?.message}
                  hint="Opcional. Usado apenas para contato interno."
                >
                  <Input
                    id="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 99999-9999"
                    aria-invalid={Boolean(profileForm.formState.errors.phone)}
                    {...profileForm.register('phone', {
                      onChange: (event) => {
                        event.target.value = maskPhone(event.target.value)
                      },
                    })}
                  />
                </Field>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={profileMutation.isPending || !profileForm.formState.isDirty}
                  >
                    {profileMutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                    Salvar perfil
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary/80" />
                Segurança
              </CardTitle>
              <CardDescription>Altere sua senha de acesso.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit((values) => {
                  setPasswordError(null)
                  passwordMutation.mutate(values)
                })}
                className="space-y-5"
                noValidate
              >
                <FormError message={passwordError} />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Nova senha"
                    htmlFor="new-password"
                    error={passwordForm.formState.errors.password?.message}
                    required
                  >
                    <PasswordInput
                      id="new-password"
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      aria-invalid={Boolean(passwordForm.formState.errors.password)}
                      {...passwordForm.register('password')}
                    />
                  </Field>

                  <Field
                    label="Confirmar senha"
                    htmlFor="confirm-password"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    required
                  >
                    <PasswordInput
                      id="confirm-password"
                      autoComplete="new-password"
                      placeholder="Repita a nova senha"
                      aria-invalid={Boolean(passwordForm.formState.errors.confirmPassword)}
                      {...passwordForm.register('confirmPassword')}
                    />
                  </Field>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-muted-foreground/70">
                    A senha deve ter letras, números e pelo menos 8 caracteres.
                  </p>
                  <Button type="submit" disabled={passwordMutation.isPending}>
                    {passwordMutation.isPending && <Loader2 className="animate-spin" />}
                    Atualizar senha
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-primary/80" />
                Sessão
              </CardTitle>
              <CardDescription>Informações do seu acesso atual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">E-mail</span>
                <span className="truncate text-foreground">{context.profile.email}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Último acesso</span>
                <span className="text-foreground">
                  {formatDateTime(session?.user.last_sign_in_at ?? null)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Membro desde</span>
                <span className="text-foreground">{formatDateTime(context.profile.created_at)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Perfil</span>
                <Badge variant="outline">{ROLE_LABELS[context.profile.role]}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary/80" />
                Privacidade
              </CardTitle>
              <CardDescription>Seus dados e os dados dos clientes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-[11px] leading-relaxed text-muted-foreground">
              <p>
                Acessos são registrados em logs de auditoria. Dados pessoais devem ser tratados
                apenas para a finalidade do atendimento, conforme a LGPD.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setSignOutOpen(true)}
              >
                <LogOut />
                Encerrar todas as sessões
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Encerrar todas as sessões</DialogTitle>
            <DialogDescription>
              Você será desconectado de todos os dispositivos, incluindo este. Será necessário
              entrar novamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignOutOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void handleSignOutAll()}>
              Encerrar sessões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
