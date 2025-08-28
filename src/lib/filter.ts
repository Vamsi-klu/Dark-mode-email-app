import type { Email } from '../mockEmails'
import type { Mailbox } from '../types/mail'

export function matchesQuery(email: Email, query: string): boolean {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return (
    email.subject.toLowerCase().includes(q) ||
    email.sender.name.toLowerCase().includes(q) ||
    email.snippet.toLowerCase().includes(q)
  )
}

export function filterEmails(
  emails: Email[],
  mailbox: Mailbox,
  query: string
): Email[] {
  return emails.filter((e) => e.mailbox === mailbox).filter((e) => matchesQuery(e, query))
}

