import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  it('renders brand and compose button', () => {
    render(<Sidebar mailbox="inbox" onSelectMailbox={vi.fn()} onCompose={vi.fn()} />)
    expect(screen.getByText(/NovaMail/i)).toBeInTheDocument()
    expect(screen.getByText(/Compose/i)).toBeInTheDocument()
  })

  it('invokes onCompose when compose clicked', () => {
    const onCompose = vi.fn()
    render(<Sidebar mailbox="inbox" onSelectMailbox={vi.fn()} onCompose={onCompose} />)
    fireEvent.click(screen.getByText(/Compose/i))
    expect(onCompose).toHaveBeenCalled()
  })

  it('changes selected mailbox', () => {
    const onSelect = vi.fn()
    render(<Sidebar mailbox="inbox" onSelectMailbox={onSelect} onCompose={vi.fn()} />)
    fireEvent.click(screen.getByText(/Starred/i))
    expect(onSelect).toHaveBeenCalledWith('starred')
  })
})


