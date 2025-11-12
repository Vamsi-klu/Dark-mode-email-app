import { describe, it, expect } from 'vitest'
import {
  extractContactsFromEmails,
  sortByFrequency,
  getTopContacts,
  searchContacts,
  isValidEmail,
  createContact,
  mergeDuplicates,
  getInitials
} from 'src/lib/contacts'
import type { Email } from 'src/mockEmails'

describe('contacts utility', () => {
  const mockEmails: Email[] = [
    {
      id: 'e1',
      mailbox: 'inbox',
      unread: true,
      subject: 'Test',
      snippet: 'Test',
      body: 'Test',
      date: '2025-01-15T10:00:00Z',
      sender: { name: 'Alice Johnson', email: 'alice@example.com', avatarColor: '#ff0000' },
      recipients: ['you@example.com'],
      cc: ['bob@example.com']
    },
    {
      id: 'e2',
      mailbox: 'inbox',
      unread: false,
      subject: 'Test',
      snippet: 'Test',
      body: 'Test',
      date: '2025-01-20T10:00:00Z',
      sender: { name: 'Alice Johnson', email: 'alice@example.com' },
      recipients: ['you@example.com']
    }
  ]

  describe('extractContactsFromEmails', () => {
    it('extracts unique contacts', () => {
      const contacts = extractContactsFromEmails(mockEmails)
      const alice = contacts.find(c => c.email === 'alice@example.com')
      expect(alice).toBeDefined()
      expect(alice?.frequency).toBe(2)
    })

    it('excludes user email', () => {
      const contacts = extractContactsFromEmails(mockEmails)
      expect(contacts.find(c => c.email === 'you@example.com')).toBeUndefined()
    })

    it('includes CC recipients', () => {
      const contacts = extractContactsFromEmails(mockEmails)
      expect(contacts.find(c => c.email === 'bob@example.com')).toBeDefined()
    })
  })

  describe('sortByFrequency', () => {
    const contacts = extractContactsFromEmails(mockEmails)

    it('sorts descending by default', () => {
      const sorted = sortByFrequency(contacts)
      expect(sorted[0].email).toBe('alice@example.com')
    })
  })

  describe('isValidEmail', () => {
    it('validates correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('getInitials', () => {
    it('extracts initials', () => {
      expect(getInitials('Alice Johnson')).toBe('AJ')
      expect(getInitials('Bob')).toBe('B')
      expect(getInitials('A B C')).toBe('AB')
    })
  })
})
