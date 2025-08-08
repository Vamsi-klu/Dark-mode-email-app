import type { Mailbox } from './types/mail'

export type Email = {
  id: string
  mailbox: Mailbox
  unread: boolean
  starred?: boolean
  subject: string
  snippet: string
  body: string
  date: string
  sender: { name: string; email: string; avatarColor?: string }
  recipients: string[]
}

export const mockEmails: Email[] = [
  {
    id: 'm1',
    mailbox: 'inbox',
    unread: true,
    starred: true,
    subject: 'Your NovaCloud invoice for July',
    snippet: 'Hi there, thanks for being a NovaCloud customer. Your invoice is attached... ',
    body: `Hi there,\n\nThanks for being a NovaCloud customer. Your July invoice is attached.\n\nTotal due: $42.00\nDue date: Aug 15\n\nView invoice: https://novacloud.example/invoices/12345\n\n— The NovaCloud Team`,
    date: '2025-07-28T14:21:00Z',
    sender: { name: 'NovaCloud', email: 'billing@novacloud.example', avatarColor: '#3a90ee' },
    recipients: ['you@example.com']
  },
  {
    id: 'm2',
    mailbox: 'inbox',
    unread: false,
    subject: 'Design handoff: v2 Dashboard',
    snippet: 'Pushing the handoff to the Drive folder. There are variants for dark mode and motion states...',
    body: `Hey,\n\nPushing the handoff to the Drive folder. There are variants for dark mode and motion states.\nLet me know if you need animations exported separately.\n\n— Maya`,
    date: '2025-07-27T09:12:00Z',
    sender: { name: 'Maya Patel', email: 'maya@studio.example', avatarColor: '#12ebd8' },
    recipients: ['you@example.com']
  },
  {
    id: 'm3',
    mailbox: 'starred',
    unread: false,
    subject: 'Flight confirmation: SEA → SFO',
    snippet: 'Your flight has been booked. Confirmation code XK9H2. Boarding begins at 07:35...',
    body: `Your flight has been booked. Confirmation code XK9H2. Boarding begins at 07:35.\n\nSeat 12A, Group 3`,
    date: '2025-07-25T17:02:00Z',
    sender: { name: 'Cascade Air', email: 'no-reply@cascadeair.example', avatarColor: '#1b58b3' },
    recipients: ['you@example.com']
  },
  {
    id: 'm4',
    mailbox: 'sent',
    unread: false,
    subject: 'Re: Q3 roadmap',
    snippet: 'I left comments on sections 2 and 5. Biggest risks are around vendor timelines...',
    body: `I left comments on sections 2 and 5. Biggest risks are around vendor timelines.\n\nLet’s review live tomorrow.`,
    date: '2025-07-22T13:45:00Z',
    sender: { name: 'You', email: 'you@example.com', avatarColor: '#93cafa' },
    recipients: ['product@example.com']
  },
  {
    id: 'm5',
    mailbox: 'drafts',
    unread: false,
    subject: '(Draft) Partnership intro',
    snippet: 'Drafting an intro note with value props and next steps...',
    body: `Draft: Partnership intro`,
    date: '2025-07-20T08:00:00Z',
    sender: { name: 'You', email: 'you@example.com', avatarColor: '#61aef6' },
    recipients: ['bizdev@example.com']
  }
]


