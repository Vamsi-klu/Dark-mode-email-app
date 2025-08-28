import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from 'src/App'

describe('App integration', () => {
  it('renders sidebar brand and conversations', () => {
    render(<App />)
    expect(screen.getByText(/NovaMail/i)).toBeInTheDocument()
    expect(screen.getByText(/Conversations/i)).toBeInTheDocument()
  })

  it('switches mailboxes and filters via search', () => {
    render(<App />)

    fireEvent.click(screen.getByText(/Starred/i))
    expect(screen.getByText(/Conversations/i)).toBeInTheDocument()

    const input = screen.getByPlaceholderText(/Search mail/i)
    fireEvent.change(input, { target: { value: 'invoice' } })
    expect(screen.getByText(/Conversations/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Inbox/i))
    expect(screen.getAllByText(/invoice/i, { exact: false }).length).toBeGreaterThan(0)
  })

  it('selects a mail and opens composer, AI panel', () => {
    render(<App />)
    fireEvent.click(screen.getByText(/Conversations/i))

    fireEvent.click(screen.getByText(/Compose/i))
    expect(screen.getByText(/New message/i)).toBeInTheDocument()
    fireEvent.click(screen.getByTitle(/Close/i))

    fireEvent.click(screen.getByRole('button', { name: /AI Overview/i }))
    expect(screen.getByTitle(/Deterministic Seed/i)).toBeInTheDocument()

    // Change theme via the toggle
    const btnLight = screen.getByRole('button', { name: /^light$/i })
    fireEvent.click(btnLight)
    expect(document.documentElement.classList.contains('theme-light')).toBe(true)
    const btnWhite = screen.getByRole('button', { name: /^white$/i })
    fireEvent.click(btnWhite)
    expect(document.documentElement.classList.contains('theme-white')).toBe(true)
    const btnDark = screen.getByRole('button', { name: /^dark$/i })
    fireEvent.click(btnDark)
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
  })
})
