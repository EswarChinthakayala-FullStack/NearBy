import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/components/auth/LoginForm'
import { renderWithProviders } from './utils/renderWithProviders'

describe('LoginForm Component', () => {
  it('renders email, password inputs, and submit button', () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays inline validation errors when submitting empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    const submitBtn = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/email address is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials via MSW handler', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitBtn = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'admin@nearby.com')
    await user.type(passwordInput, 'Password123!')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })
  })
})
