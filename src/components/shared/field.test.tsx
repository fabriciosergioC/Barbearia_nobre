import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Field, PasswordInput } from './field'

describe('Field', () => {
  it('exibe mensagem de erro com role de alerta', () => {
    render(
      <Field label="E-mail" htmlFor="email" error="Informe um e-mail válido.">
        <input id="email" />
      </Field>,
    )

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um e-mail válido.')
  })

  it('não exibe erro quando não há mensagem', () => {
    render(
      <Field label="E-mail" htmlFor="email" hint="Use seu e-mail principal.">
        <input id="email" />
      </Field>,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Use seu e-mail principal.')).toBeInTheDocument()
  })
})

describe('PasswordInput', () => {
  it('alterna a visibilidade da senha', async () => {
    const user = userEvent.setup()
    render(<PasswordInput id="password" />)

    const input = screen.getByLabelText('Mostrar senha')
    expect(input).toBeInTheDocument()

    const password = document.getElementById('password') as HTMLInputElement
    expect(password.type).toBe('password')

    await user.click(input)
    expect(password.type).toBe('text')

    await user.click(screen.getByLabelText('Ocultar senha'))
    expect(password.type).toBe('password')
  })
})
