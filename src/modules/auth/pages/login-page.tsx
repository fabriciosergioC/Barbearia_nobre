import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Field, FormError, PasswordInput } from '@/components/shared/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { loginSchema, type LoginInput } from '@/schemas/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginInput) {
    setFormError(null)
    setNeedsConfirmation(null)

    const { error } = await supabase().auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      const message = getErrorMessage(error)
      setFormError(message)
      if (/confirm/i.test(error.message)) {
        setNeedsConfirmation(values.email)
      }
      return
    }

    toast.success('Bem-vindo de volta.')
    const from = (location.state as { from?: string } | null)?.from
    navigate(from ?? '/', { replace: true })
  }

  async function resendConfirmation() {
    const email = getValues('email') || needsConfirmation
    if (!email) return

    setResending(true)
    const { error } = await supabase().auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    })
    setResending(false)

    if (error) {
      setFormError(getErrorMessage(error))
      return
    }
    toast.success('E-mail de confirmação reenviado.')
  }

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Entrar</h2>
        <p className="text-sm text-muted-foreground">Acesse o painel da sua barbearia.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormError message={formError} />

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

        <Field label="Senha" htmlFor="password" error={errors.password?.message} required>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </Field>

        <div className="flex justify-end">
          <Link
            to="/auth/recuperar-senha"
            className="text-xs font-medium text-primary/90 underline-offset-4 hover:text-primary hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          {isSubmitting ? 'Entrando…' : 'Entrar no painel'}
        </Button>

        {needsConfirmation && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={resendConfirmation}
            disabled={resending}
          >
            {resending ? <Loader2 className="animate-spin" /> : <Mail />}
            Reenviar confirmação de e-mail
          </Button>
        )}
      </form>

      <div className="space-y-4 border-t border-white/[0.06] pt-5">
        <p className="text-center text-xs text-muted-foreground">
          Ainda não tem conta?{' '}
          <Link
            to="/auth/cadastro"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Criar minha barbearia
          </Link>
        </p>
        <p className="text-center text-[10px] leading-relaxed text-muted-foreground/50">
          Ao entrar, você concorda com o tratamento dos dados conforme a LGPD.
        </p>
      </div>
    </div>
  )
}
