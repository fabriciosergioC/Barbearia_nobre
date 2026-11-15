import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { Field, FormError } from '@/components/shared/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { env } from '@/lib/env'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth'

export function ForgotPasswordPage() {
  const [formError, setFormError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null)

    const { error } = await supabase().auth.resetPasswordForEmail(values.email, {
      redirectTo: `${env.appUrl}/auth/redefinir-senha`,
    })

    if (error) {
      setFormError(getErrorMessage(error))
      return
    }

    setSentTo(values.email)
  }

  return (
    <div className="space-y-7">
      <Link
        to="/auth/login"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Voltar para o login
      </Link>

      {sentTo ? (
        <div className="space-y-5">
          <div className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
            <MailCheck className="size-5 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Verifique seu e-mail</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Se existir uma conta para <span className="text-foreground">{sentTo}</span>, enviamos um
              link para redefinir sua senha. O link expira em alguns minutos.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/auth/login">Voltar para o login</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Recuperar senha</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Informe o e-mail da sua conta para receber o link de redefinição.
            </p>
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

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? 'Enviando…' : 'Enviar link de recuperação'}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
