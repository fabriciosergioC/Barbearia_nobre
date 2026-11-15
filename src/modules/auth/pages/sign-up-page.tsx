import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Field, FormError, PasswordInput } from '@/components/shared/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { env } from '@/lib/env'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { signUpSchema, type SignUpInput } from '@/schemas/auth'

export function SignUpPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(values: SignUpInput) {
    setFormError(null)

    const { data, error } = await supabase().auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${env.appUrl}/onboarding`,
      },
    })

    if (error) {
      setFormError(getErrorMessage(error))
      return
    }

    if (data.session) {
      toast.success('Conta criada. Vamos configurar sua barbearia.')
      navigate('/onboarding', { replace: true })
      return
    }

    setSentTo(values.email)
  }

  if (sentTo) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
          <MailCheck className="size-5 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Confirme seu e-mail</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Enviamos um link de confirmação para <span className="text-foreground">{sentTo}</span>.
            Abra o e-mail para ativar sua conta e continuar a configuração.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link to="/auth/login">Voltar para o login</Link>
        </Button>
        <p className="text-[11px] leading-relaxed text-muted-foreground/60">
          Não recebeu? Verifique a pasta de spam ou tente novamente em alguns minutos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Criar minha barbearia</h2>
        <p className="text-sm text-muted-foreground">
          Comece com uma conta de administrador. Leva menos de um minuto.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormError message={formError} />

        <Field label="Nome completo" htmlFor="fullName" error={errors.fullName?.message} required>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Seu nome"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            {...register('fullName')}
          />
        </Field>

        <Field label="E-mail" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@barbearia.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Senha" htmlFor="password" error={errors.password?.message} required>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
          </Field>

          <Field
            label="Confirmar senha"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
            required
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Repita a senha"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              {...register('confirmPassword')}
            />
          </Field>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground/70">
          A senha deve ter ao menos 8 caracteres, com letras e números.
        </p>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          {isSubmitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>

      <p className="border-t border-white/[0.06] pt-5 text-center text-xs text-muted-foreground">
        Já possui conta?{' '}
        <Link to="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
