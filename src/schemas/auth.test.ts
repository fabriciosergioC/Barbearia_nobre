import { describe, expect, it } from 'vitest'

import {
  establishmentSchema,
  loginSchema,
  onboardingSchema,
  signUpSchema,
} from './auth'

describe('loginSchema', () => {
  it('aceita credenciais preenchidas', () => {
    const result = loginSchema.safeParse({ email: 'dono@barbearia.com', password: 'x' })
    expect(result.success).toBe(true)
  })

  it('rejeita e-mail inválido e senha vazia', () => {
    const result = loginSchema.safeParse({ email: 'invalido', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0])
      expect(fields).toContain('email')
      expect(fields).toContain('password')
    }
  })
})

describe('signUpSchema', () => {
  const valid = {
    fullName: 'Fabricio Almeida',
    email: 'dono@barbearia.com',
    password: 'senha1234',
    confirmPassword: 'senha1234',
  }

  it('aceita cadastro válido', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita senha sem número', () => {
    const result = signUpSchema.safeParse({ ...valid, password: 'somenteletras', confirmPassword: 'somenteletras' })
    expect(result.success).toBe(false)
  })

  it('rejeita senhas diferentes no campo de confirmação', () => {
    const result = signUpSchema.safeParse({ ...valid, confirmPassword: 'outra1234' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'confirmPassword')).toBe(true)
    }
  })
})

describe('onboardingSchema', () => {
  it('aceita slug e telefone válidos', () => {
    const result = onboardingSchema.safeParse({
      establishmentName: 'Barbearia Nobre',
      slug: 'barbearia-nobre',
      fullName: 'Fabricio Almeida',
      phone: '(11) 98765-4321',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita slug com maiúsculas ou espaços', () => {
    expect(
      onboardingSchema.safeParse({
        establishmentName: 'Barbearia Nobre',
        slug: 'Barbearia Nobre',
        fullName: 'Fabricio Almeida',
        phone: '',
      }).success,
    ).toBe(false)
  })
})

describe('establishmentSchema', () => {
  it('exige UF com duas letras e CEP com 8 dígitos', () => {
    const result = establishmentSchema.safeParse({
      name: 'Nobre',
      phone: '',
      email: '',
      document: '',
      address: {
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: 'Sao',
        zip: '123',
      },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'))
      expect(paths).toContain('address.state')
      expect(paths).toContain('address.zip')
    }
  })
})
