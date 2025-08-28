import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MailView } from 'src/components/MailView'

const email: any = {
  id: '1', mailbox: 'inbox', unread: false, subject: 'Subj', snippet: 'Snippet', body: 'Body', date: new Date().toISOString(),
  sender: { name: 'S', email: 's@e.com' }, recipients: []
}

describe('MailView', () => {
  it('renders subject and triggers reply', () => {
    const onReply = vi.fn()
    render(<MailView email={email} onReply={onReply} />)
    expect(screen.getByText('Subj')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Reply/i))
    expect(onReply).toHaveBeenCalled()
  })
})

