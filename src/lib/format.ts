import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value ?? 0))
}

export function formatDate(value: string | Date | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? parseISO(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return format(date, pattern, { locale: ptBR })
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, "dd/MM/yyyy 'às' HH:mm")
}

export function formatPhone(value: string | null | undefined): string {
  if (!value) return '—'
  const digits = value.replace(/\D/g, '')

  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  }
  return value
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d+)$/, '($1) $2')
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d+)$/, '($1) $2-$3')
  return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}
