import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Loader2, MapPin, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Field, FormError } from '@/components/shared/field'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useMyContext } from '@/hooks/use-my-context'
import { getErrorMessage } from '@/lib/errors'
import { maskPhone } from '@/lib/format'
import { supabase } from '@/lib/supabase'
import { establishmentSchema, type EstablishmentInput } from '@/schemas/auth'
import type { Json } from '@/types/database'
import type { EstablishmentAddress, MyEstablishment } from '@/types/app'

export function SettingsPage() {
  const { data: context } = useMyContext()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const establishment = context?.establishment

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EstablishmentInput>({
    resolver: zodResolver(establishmentSchema),
    defaultValues: toFormValues(establishment),
  })

  useEffect(() => {
    if (establishment) reset(toFormValues(establishment))
  }, [establishment, reset])

  async function onSubmit(values: EstablishmentInput) {
    if (!establishment) return
    setFormError(null)

    const address: EstablishmentAddress = {
      street: values.address.street || undefined,
      number: values.address.number || undefined,
      complement: values.address.complement || undefined,
      district: values.address.district || undefined,
      city: values.address.city || undefined,
      state: values.address.state.toUpperCase() || undefined,
      zip: values.address.zip || undefined,
    }

    const { error } = await supabase()
      .from('establishments')
      .update({
        name: values.name,
        phone: values.phone || null,
        email: values.email || null,
        document: values.document || null,
        address: address as unknown as Json,
      })
      .eq('id', establishment.id)

    if (error) {
      setFormError(getErrorMessage(error))
      return
    }

    await queryClient.invalidateQueries({ queryKey: ['my-context'] })
    reset(values)
    toast.success('Dados do estabelecimento atualizados.')
  }

  async function copySlug() {
    if (!establishment) return
    await navigator.clipboard.writeText(establishment.slug)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  if (!establishment) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estabelecimento"
        description="Dados de identificação e contato da sua barbearia."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <Card>
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
              <CardDescription>Informações exibidas no sistema e nos documentos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormError message={formError} />

              <Field label="Nome da barbearia" htmlFor="name" error={errors.name?.message} required>
                <Input id="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Telefone"
                  htmlFor="phone"
                  error={errors.phone?.message}
                  hint="Telefone de contato do estabelecimento."
                >
                  <Input
                    id="phone"
                    inputMode="tel"
                    placeholder="(11) 99999-9999"
                    aria-invalid={Boolean(errors.phone)}
                    {...register('phone', {
                      onChange: (event) => {
                        event.target.value = maskPhone(event.target.value)
                      },
                    })}
                  />
                </Field>

                <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@barbearia.com"
                    aria-invalid={Boolean(errors.email)}
                    {...register('email')}
                  />
                </Field>
              </div>

              <Field
                label="CPF ou CNPJ"
                htmlFor="document"
                error={errors.document?.message}
                hint="Opcional. Usado apenas para identificação."
              >
                <Input
                  id="document"
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  aria-invalid={Boolean(errors.document)}
                  {...register('document')}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4 text-primary/80" />
                Endereço
              </CardTitle>
              <CardDescription>Opcional, mas útil para o cliente localizar a barbearia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-[1.6fr_0.4fr]">
                <Field label="Rua" htmlFor="street" error={errors.address?.street?.message}>
                  <Input id="street" autoComplete="address-line1" {...register('address.street')} />
                </Field>
                <Field label="Número" htmlFor="number" error={errors.address?.number?.message}>
                  <Input id="number" {...register('address.number')} />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Complemento" htmlFor="complement" error={errors.address?.complement?.message}>
                  <Input id="complement" {...register('address.complement')} />
                </Field>
                <Field label="Bairro" htmlFor="district" error={errors.address?.district?.message}>
                  <Input id="district" {...register('address.district')} />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-[1.4fr_0.6fr_0.7fr]">
                <Field label="Cidade" htmlFor="city" error={errors.address?.city?.message}>
                  <Input id="city" autoComplete="address-level2" {...register('address.city')} />
                </Field>
                <Field label="UF" htmlFor="state" error={errors.address?.state?.message}>
                  <Input id="state" maxLength={2} className="uppercase" {...register('address.state')} />
                </Field>
                <Field label="CEP" htmlFor="zip" error={errors.address?.zip?.message}>
                  <Input id="zip" inputMode="numeric" {...register('address.zip')} />
                </Field>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={!isDirty || isSubmitting}
              onClick={() => reset(toFormValues(establishment))}
            >
              Descartar alterações
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
              Salvar alterações
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identificador</CardTitle>
              <CardDescription>Chave única do estabelecimento no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <code className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {establishment.slug}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void copySlug()}
                  aria-label="Copiar identificador"
                >
                  {copied ? <Check className="text-primary" /> : <Copy />}
                </Button>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                O identificador não pode ser alterado por enquanto, para preservar a consistência
                dos futuros links públicos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Isolamento de dados</CardTitle>
              <CardDescription>Segurança aplicada no banco de dados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 text-[11px] leading-relaxed text-muted-foreground">
              <p>Todos os registros são vinculados ao estabelecimento e protegidos por Row Level Security.</p>
              <p>Nenhum usuário acessa dados de outra barbearia, mesmo com chamadas diretas à API.</p>
              <p>Operações sensíveis exigem permissão específica do perfil.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function toFormValues(establishment: MyEstablishment | undefined): EstablishmentInput {
  return {
    name: establishment?.name ?? '',
    phone: establishment?.phone ?? '',
    email: establishment?.email ?? '',
    document: establishment?.document ?? '',
    address: {
      street: establishment?.address?.street ?? '',
      number: establishment?.address?.number ?? '',
      complement: establishment?.address?.complement ?? '',
      district: establishment?.address?.district ?? '',
      city: establishment?.address?.city ?? '',
      state: establishment?.address?.state ?? '',
      zip: establishment?.address?.zip ?? '',
    },
  }
}
