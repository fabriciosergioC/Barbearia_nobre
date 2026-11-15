import { z } from 'zod'

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Informe o e-mail.')
  .max(254, 'E-mail muito longo.')
  .email('Informe um e-mail válido.')

export const passwordSchema = z
  .string()
  .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
  .max(72, 'A senha pode ter no máximo 72 caracteres.')
  .regex(/[A-Za-z]/, 'Inclua ao menos uma letra.')
  .regex(/\d/, 'Inclua ao menos um número.')

export const phoneSchema = z
  .string()
  .trim()
  .max(20, 'Telefone muito longo.')
  .refine((value) => value === '' || value.replace(/\D/g, '').length >= 10, 'Informe um telefone válido com DDD.')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe a senha.').max(72, 'Senha muito longa.'),
})

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Informe seu nome completo.').max(120, 'Nome muito longo.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  })

export const onboardingSchema = z.object({
  establishmentName: z
    .string()
    .trim()
    .min(2, 'Informe o nome da barbearia.')
    .max(120, 'Nome muito longo.'),
  slug: z
    .string()
    .trim()
    .min(3, 'O identificador precisa ter pelo menos 3 caracteres.')
    .max(60, 'Identificador muito longo.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use apenas letras minúsculas, números e hífen.'),
  fullName: z.string().trim().min(3, 'Informe seu nome completo.').max(120, 'Nome muito longo.'),
  phone: phoneSchema,
})

export const establishmentSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da barbearia.').max(120, 'Nome muito longo.'),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .max(254, 'E-mail muito longo.')
    .refine((value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Informe um e-mail válido.'),
  document: z
    .string()
    .trim()
    .max(20, 'Documento muito longo.')
    .refine((value) => value === '' || [11, 14].includes(value.replace(/\D/g, '').length), 'Informe um CPF ou CNPJ válido.'),
  address: z.object({
    street: z.string().trim().max(160, 'Endereço muito longo.'),
    number: z.string().trim().max(20, 'Número muito longo.'),
    complement: z.string().trim().max(80, 'Complemento muito longo.'),
    district: z.string().trim().max(80, 'Bairro muito longo.'),
    city: z.string().trim().max(80, 'Cidade muito longa.'),
    state: z
      .string()
      .trim()
      .max(2, 'Use a sigla do estado.')
      .refine((value) => value === '' || /^[A-Za-z]{2}$/.test(value), 'Use a sigla com 2 letras.'),
    zip: z
      .string()
      .trim()
      .max(9, 'CEP inválido.')
      .refine((value) => value === '' || value.replace(/\D/g, '').length === 8, 'Informe um CEP válido.'),
  }),
})

export const profileSchema = z.object({
  fullName: z.string().trim().min(3, 'Informe seu nome completo.').max(120, 'Nome muito longo.'),
  phone: phoneSchema,
})

export const inviteMemberSchema = z.object({
  fullName: z.string().trim().min(3, 'Informe o nome completo.').max(120, 'Nome muito longo.'),
  email: emailSchema,
  role: z.enum(['admin', 'gerente', 'recepcionista', 'barbeiro'], 'Selecione um perfil.'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type OnboardingInput = z.infer<typeof onboardingSchema>
export type EstablishmentInput = z.infer<typeof establishmentSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
