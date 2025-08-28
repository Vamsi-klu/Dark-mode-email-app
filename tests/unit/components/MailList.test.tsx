import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MailList } from 'src/components/MailList'

const sample = [
  {
    id: 'a', mailbox: 'inbox', unread: true, subject: 'Hello', snippet: 'World', body: 'x', date: new Date().toISOString(),
    sender: { name: 'Alice', email: 'a@e.com' }, recipients: []
  }
] as any

describe('MailList', () => {
  it('renders emails and calls onSelect', () => {
    const onSelect = vi.fn()
    render(<MailList emails={sample} selectedId={null} onSelect={onSelect} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Alice'))
    expect(onSelect).toHaveBeenCalledWith('a')
  })
})

