import { describe, expect, it } from 'vitest'

import { formatCurrency, formatPhone, getInitials, maskPhone, slugify } from './format'

describe('formatCurrency', () => {
  it('formata valores em reais', () => {
    expect(formatCurrency(1234.5)).toContain('1.234,50')
    expect(formatCurrency(0)).toContain('0,00')
    expect(formatCurrency(null)).toContain('0,00')
  })
})

describe('formatPhone', () => {
  it('formata celular e telefone fixo', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
    expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
  })

  it('retorna travessão quando vazio', () => {
    expect(formatPhone(null)).toBe('—')
  })
})

describe('maskPhone', () => {
  it('mascara progressivamente', () => {
    expect(maskPhone('11')).toBe('11')
    expect(maskPhone('119876')).toBe('(11) 9876')
    expect(maskPhone('11987654321')).toBe('(11) 98765-4321')
    expect(maskPhone('119876543219999')).toBe('(11) 98765-4321')
  })
})

describe('slugify', () => {
  it('remove acentos e normaliza separadores', () => {
    expect(slugify('Barbearia Nobre & Cia')).toBe('barbearia-nobre-cia')
    expect(slugify('  Ação  ')).toBe('acao')
  })

  it('limita o tamanho a 60 caracteres', () => {
    expect(slugify('a'.repeat(80)).length).toBe(60)
  })
})

describe('getInitials', () => {
  it('usa as duas primeiras iniciais', () => {
    expect(getInitials('João da Silva')).toBe('JD')
    expect(getInitials(null)).toBe('?')
  })
})
