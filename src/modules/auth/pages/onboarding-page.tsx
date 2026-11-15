import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Building2, Check, Loader2, LogOut, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Field, FormError } from '@/components/shared/field'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useMyContext } from '@/hooks/use-my-context'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'
import { maskPhone, slugify } from '@/lib/format'
import { onboardingSchema, type OnboardingInput } from '@/schemas/auth'
import type { MyContext } from '@/types/app'

export function OnboardingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session, signOut } = useAuth()
  const { data: existingContext, isLoading } = useMyContext()
  const [formError, setFormError] = useState<string | null>(null)
  const [slugEdited, setSlugEdited] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      establishmentName: '',
      slug: '',
      fullName: (session?.user.user_metadata?.full_name as string | undefined) ?? '',
      phone: '',
    },
  })

  const establishmentName = watch('establishmentName')
  const slug = watch('slug')

  useEffect(() => {
    if (existingContext) {
      navigate('/', { replace: true })
    }
  }, [existingContext, navigate])

  useEffect(() => {
    if (!slugEdited && establishmentName) {
      setValue('slug', slugify(establishmentName), { shouldValidate: false })
    }
  }, [establishmentName, slugEdited, setValue])

  async function onSubmit(values: OnboardingInput) {
    setFormError(null)

    const { data, error } = await supabase().rpc('bootstrap_establishment', {
      p_establishment_name: values.establishmentName,
      p_slug: values.slug,
      p_full_name: values.fullName,
      p_phone: values.phone.trim() ? values.phone : null,
    })

    if (error) {
      setFormError(getErrorMessage(error))
      return
    }

    if (data) {
      queryClient.setQueryData<MyContext | null>(['my-context', session?.user.id], data as unknown as MyContext)
    }
    await queryClient.invalidateQueries({ queryKey: ['my-context'] })

    toast.success('Estabelecimento criado. Bem-vindo ao Nobre.')
    navigate('/', { replace: true })
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth/login', { replace: true })
  }

  if (isLoading && !existingContext) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-8">
        <Logo showTagline />
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">{session?.user.email}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="space-y-7">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              <Sparkles className="size-3.5" />
              Primeiro acesso
            </div>
            <h1 className="text-3xl font-bold text-foreground">Vamos configurar sua barbearia</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Esses dados identificam seu estabelecimento no sistema e criam o acesso de
              administrador. Você poderá ajustar tudo depois.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormError message={formError} />

            <Field
              label="Nome da barbearia"
              htmlFor="establishmentName"
              error={errors.establishmentName?.message}
              required
            >
              <Input
                id="establishmentName"
                placeholder="Ex.: Barbearia Nobre"
                autoComplete="organization"
                aria-invalid={Boolean(errors.establishmentName)}
                {...register('establishmentName')}
              />
            </Field>

            <Field
              label="Identificador do estabelecimento"
              htmlFor="slug"
              error={errors.slug?.message}
              hint="Usado internamente e em futuros links públicos. Apenas letras minúsculas, números e hífen."
              required
            >
              <Input
                id="slug"
                placeholder="barbearia-nobre"
                aria-invalid={Boolean(errors.slug)}
                {...register('slug', {
                  onChange: () => setSlugEdited(true),
                })}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Seu nome completo" htmlFor="fullName" error={errors.fullName?.message} required>
                <Input
                  id="fullName"
                  autoComplete="name"
                  placeholder="Seu nome"
                  aria-invalid={Boolean(errors.fullName)}
                  {...register('fullName')}
                />
              </Field>

              <Field label="Telefone" htmlFor="phone" error={errors.phone?.message} hint="Opcional, com DDD.">
                <Input
                  id="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  aria-invalid={Boolean(errors.phone)}
                  {...register('phone', {
                    onChange: (event) => {
                      event.target.value = maskPhone(event.target.value)
                    },
                  })}
                />
              </Field>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              {isSubmitting ? 'Criando estabelecimento…' : 'Concluir configuração'}
            </Button>
          </form>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -inset-6 rounded-[2rem] bg-primary/[0.04] blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0f] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <span className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground/60 uppercase">
                Prévia do estabelecimento
              </span>
              <Building2 className="size-4 text-primary/70" />
            </div>

            <div className="space-y-5 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 font-display text-lg font-bold text-primary">
                  {establishmentName?.trim()?.[0]?.toUpperCase() || 'N'}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-foreground">
                    {establishmentName?.trim() || 'Sua barbearia'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {slug ? `/${slug}` : '/identificador'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" />
                  Acesso de administrador com permissões totais
                </p>
                <p className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" />
                  Isolamento de dados por estabelecimento (RLS)
                </p>
                <p className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" />
                  Estrutura preparada para agenda e financeiro
                </p>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground/60">
                Nas próximas fases você cadastrará serviços, profissionais, clientes e horários de
                funcionamento.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
