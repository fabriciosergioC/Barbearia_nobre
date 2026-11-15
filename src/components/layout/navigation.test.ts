import { describe, expect, it } from 'vitest'

import { navigation, visibleNavigation } from './navigation'

describe('visibleNavigation', () => {
  it('mostra apenas itens permitidos', () => {
    const sections = visibleNavigation(['dashboard.view'])
    const links = sections.flatMap((section) => section.items.map((item) => item.to))
    expect(links).toContain('/')
    expect(links).not.toContain('/equipe')
    expect(links).toContain('/minha-conta')
  })

  it('não mostra itens sem permissão para recepcionista', () => {
    const sections = visibleNavigation([
      'dashboard.view',
      'clients.view',
      'appointments.view',
      'notifications.view',
    ])
    const links = sections.flatMap((section) => section.items.map((item) => item.to))
    expect(links).not.toContain('/configuracoes')
    expect(links).toContain('/minha-conta')
  })

  it('administrador vê todos os itens', () => {
    const sections = visibleNavigation([], true)
    const links = sections.flatMap((section) => section.items.map((item) => item.to))
    const total = navigation.flatMap((section) => section.items).length
    expect(links).toHaveLength(total)
  })
})
