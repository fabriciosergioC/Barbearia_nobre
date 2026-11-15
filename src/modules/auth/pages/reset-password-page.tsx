import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Field, FormError, PasswordInput } from '@/components/shared/field'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null)

    const { error } = await supabase().auth.updateUser({ password: values.password })

    if (error) {
      setFormError(getErrorMessage(error))
      return
    }

    toast.success('Senha atualizada. Entre com a nova senha.')
    await supabase().auth.signOut()
    navigate('/auth/login', { replace: true })
  }

  return (
    <div className="space-y-7">
      <div className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
        <ShieldCheck className="size-5 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Definir nova senha</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Escolha uma senha forte. Você será direcionado ao login após a alteração.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormError message={formError} />

        <Field label="Nova senha" htmlFor="password" error={errors.password?.message} required>
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
          label="Confirmar nova senha"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            {...register('confirmPassword')}
          />
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
        </Button>
      </form>

      <p className="text-center text-[11px] leading-relaxed text-muted-foreground/60">
        O link de recuperação pode expirar.{' '}
        <Link to="/auth/recuperar-senha" className="text-primary hover:underline">
          Solicitar outro
        </Link>
      </p>
    </div>
  )
}
