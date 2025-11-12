import { describe, it, expect } from 'vitest'
import {
  sortEmails,
  getDefaultSort,
  parseSortString,
  sortToString,
  toggleSortOrder,
  multiSort
} from 'src/lib/sort'
import type { Email } from 'src/mockEmails'
import type { SortOption } from 'src/types/extended'

describe('sort utility', () => {
  const mockEmails: Email[] = [
    {
      id: 'e1',
      mailbox: 'inbox',
      unread: true,
      subject: 'Alpha',
      snippet: 'Test',
      body: 'Body',
      date: '2025-01-01T10:00:00Z',
      sender: { name: 'Alice', email: 'alice@example.com' },
      recipients: ['you@example.com'],
      size: 1000,
      priority: 'high'
    },
    {
      id: 'e2',
      mailbox: 'inbox',
      unread: false,
      subject: 'Zeta',
      snippet: 'Test',
      body: 'Body',
      date: '2025-01-03T10:00:00Z',
      sender: { name: 'Zoe', email: 'zoe@example.com' },
      recipients: ['you@example.com'],
      size: 3000,
      priority: 'low'
    },
    {
      id: 'e3',
      mailbox: 'inbox',
      unread: false,
      subject: 'Beta',
      snippet: 'Test',
      body: 'Body',
      date: '2025-01-02T10:00:00Z',
      sender: { name: 'Bob', email: 'bob@example.com' },
      recipients: ['you@example.com'],
      size: 2000,
      priority: 'urgent'
    }
  ]

  describe('sortEmails', () => {
    it('sorts by date ascending', () => {
      const sorted = sortEmails(mockEmails, { field: 'date', order: 'asc' })
      expect(sorted[0].id).toBe('e1')
      expect(sorted[1].id).toBe('e3')
      expect(sorted[2].id).toBe('e2')
    })

    it('sorts by date descending', () => {
      const sorted = sortEmails(mockEmails, { field: 'date', order: 'desc' })
      expect(sorted[0].id).toBe('e2')
      expect(sorted[1].id).toBe('e3')
      expect(sorted[2].id).toBe('e1')
    })

    it('sorts by sender ascending', () => {
      const sorted = sortEmails(mockEmails, { field: 'sender', order: 'asc' })
      expect(sorted[0].sender.name).toBe('Alice')
      expect(sorted[1].sender.name).toBe('Bob')
      expect(sorted[2].sender.name).toBe('Zoe')
    })

    it('sorts by sender descending', () => {
      const sorted = sortEmails(mockEmails, { field: 'sender', order: 'desc' })
      expect(sorted[0].sender.name).toBe('Zoe')
      expect(sorted[2].sender.name).toBe('Alice')
    })

    it('sorts by subject ascending', () => {
      const sorted = sortEmails(mockEmails, { field: 'subject', order: 'asc' })
      expect(sorted[0].subject).toBe('Alpha')
      expect(sorted[1].subject).toBe('Beta')
      expect(sorted[2].subject).toBe('Zeta')
    })

    it('sorts by subject descending', () => {
      const sorted = sortEmails(mockEmails, { field: 'subject', order: 'desc' })
      expect(sorted[0].subject).toBe('Zeta')
      expect(sorted[2].subject).toBe('Alpha')
    })

    it('sorts by size ascending', () => {
      const sorted = sortEmails(mockEmails, { field: 'size', order: 'asc' })
      expect(sorted[0].size).toBe(1000)
      expect(sorted[1].size).toBe(2000)
      expect(sorted[2].size).toBe(3000)
    })

    it('sorts by size descending', () => {
      const sorted = sortEmails(mockEmails, { field: 'size', order: 'desc' })
      expect(sorted[0].size).toBe(3000)
      expect(sorted[2].size).toBe(1000)
    })

    it('sorts by priority ascending (urgent first)', () => {
      const sorted = sortEmails(mockEmails, { field: 'priority', order: 'asc' })
      expect(sorted[0].priority).toBe('urgent')
      expect(sorted[1].priority).toBe('high')
      expect(sorted[2].priority).toBe('low')
    })

    it('sorts by priority descending (low first)', () => {
      const sorted = sortEmails(mockEmails, { field: 'priority', order: 'desc' })
      expect(sorted[0].priority).toBe('low')
      expect(sorted[2].priority).toBe('urgent')
    })

    it('handles emails without size field', () => {
      const emailsNoSize: Email[] = [
        { ...mockEmails[0], size: undefined },
        { ...mockEmails[1], size: 1000 }
      ]
      const sorted = sortEmails(emailsNoSize, { field: 'size', order: 'asc' })
      expect(sorted[0].size).toBeUndefined()
      expect(sorted[1].size).toBe(1000)
    })

    it('handles emails without priority field', () => {
      const emailsNoPrio: Email[] = [
        { ...mockEmails[0], priority: undefined },
        { ...mockEmails[1], priority: 'high' }
      ]
      const sorted = sortEmails(emailsNoPrio, { field: 'priority', order: 'asc' })
      // Normal (default) should come after high
      expect(sorted[0].priority).toBe('high')
    })

    it('does not mutate original array', () => {
      const original = [...mockEmails]
      sortEmails(mockEmails, { field: 'date', order: 'asc' })
      expect(mockEmails).toEqual(original)
    })

    it('returns empty array for empty input', () => {
      const sorted = sortEmails([], { field: 'date', order: 'asc' })
      expect(sorted).toEqual([])
    })
  })

  describe('getDefaultSort', () => {
    it('returns date descending (newest first)', () => {
      const defaultSort = getDefaultSort()
      expect(defaultSort.field).toBe('date')
      expect(defaultSort.order).toBe('desc')
    })
  })

  describe('parseSortString', () => {
    it('parses valid sort strings', () => {
      expect(parseSortString('date-asc')).toEqual({ field: 'date', order: 'asc' })
      expect(parseSortString('sender-desc')).toEqual({ field: 'sender', order: 'desc' })
      expect(parseSortString('subject-asc')).toEqual({ field: 'subject', order: 'asc' })
      expect(parseSortString('size-desc')).toEqual({ field: 'size', order: 'desc' })
      expect(parseSortString('priority-asc')).toEqual({ field: 'priority', order: 'asc' })
    })

    it('returns null for invalid sort strings', () => {
      expect(parseSortString('invalid')).toBeNull()
      expect(parseSortString('date')).toBeNull()
      expect(parseSortString('date-invalid')).toBeNull()
      expect(parseSortString('invalid-asc')).toBeNull()
      expect(parseSortString('')).toBeNull()
    })

    it('returns null for malformed strings', () => {
      expect(parseSortString('date-asc-extra')).toBeNull()
      expect(parseSortString('date_asc')).toBeNull()
    })
  })

  describe('sortToString', () => {
    it('converts sort option to string', () => {
      expect(sortToString({ field: 'date', order: 'asc' })).toBe('date-asc')
      expect(sortToString({ field: 'sender', order: 'desc' })).toBe('sender-desc')
      expect(sortToString({ field: 'priority', order: 'asc' })).toBe('priority-asc')
    })
  })

  describe('toggleSortOrder', () => {
    it('toggles from asc to desc', () => {
      const toggled = toggleSortOrder({ field: 'date', order: 'asc' })
      expect(toggled.order).toBe('desc')
      expect(toggled.field).toBe('date')
    })

    it('toggles from desc to asc', () => {
      const toggled = toggleSortOrder({ field: 'date', order: 'desc' })
      expect(toggled.order).toBe('asc')
      expect(toggled.field).toBe('date')
    })

    it('preserves the field', () => {
      const toggled = toggleSortOrder({ field: 'sender', order: 'asc' })
      expect(toggled.field).toBe('sender')
    })
  })

  describe('multiSort', () => {
    const emails: Email[] = [
      {
        id: 'e1',
        mailbox: 'inbox',
        unread: true,
        subject: 'Alpha',
        snippet: 'Test',
        body: 'Body',
        date: '2025-01-01T10:00:00Z',
        sender: { name: 'Alice', email: 'alice@example.com' },
        recipients: ['you@example.com'],
        priority: 'high'
      },
      {
        id: 'e2',
        mailbox: 'inbox',
        unread: false,
        subject: 'Beta',
        snippet: 'Test',
        body: 'Body',
        date: '2025-01-01T10:00:00Z', // Same date as e1
        sender: { name: 'Alice', email: 'alice2@example.com' }, // Same name as e1
        recipients: ['you@example.com'],
        priority: 'low'
      },
      {
        id: 'e3',
        mailbox: 'inbox',
        unread: false,
        subject: 'Gamma',
        snippet: 'Test',
        body: 'Body',
        date: '2025-01-02T10:00:00Z',
        sender: { name: 'Bob', email: 'bob@example.com' },
        recipients: ['you@example.com'],
        priority: 'urgent'
      }
    ]

    it('sorts by multiple criteria in order', () => {
      // Sort by date first, then by subject
      const sorted = multiSort(emails, [
        { field: 'date', order: 'asc' },
        { field: 'subject', order: 'asc' }
      ])

      // e1 and e2 have same date, so subject determines order: Alpha < Beta
      expect(sorted[0].id).toBe('e1') // 2025-01-01, Alpha
      expect(sorted[1].id).toBe('e2') // 2025-01-01, Beta
      expect(sorted[2].id).toBe('e3') // 2025-01-02
    })

    it('handles empty sort array', () => {
      const sorted = multiSort(emails, [])
      expect(sorted).toEqual(emails)
    })

    it('uses second criteria only when first is equal', () => {
      const sorted = multiSort(emails, [
        { field: 'sender', order: 'asc' }, // Alice, Alice, Bob
        { field: 'priority', order: 'asc' } // For both Alices: high, low
      ])

      // Both e1 and e2 have sender "Alice", so priority determines order
      expect(sorted[0].id).toBe('e1') // Alice, high
      expect(sorted[1].id).toBe('e2') // Alice, low
      expect(sorted[2].id).toBe('e3') // Bob
    })

    it('does not mutate original array', () => {
      const original = [...emails]
      multiSort(emails, [{ field: 'date', order: 'asc' }])
      expect(emails).toEqual(original)
    })

    it('handles single sort in array', () => {
      const sorted = multiSort(emails, [{ field: 'subject', order: 'asc' }])
      expect(sorted[0].subject).toBe('Alpha')
      expect(sorted[1].subject).toBe('Beta')
      expect(sorted[2].subject).toBe('Gamma')
    })
  })

  describe('edge cases', () => {
    it('handles single email', () => {
      const sorted = sortEmails([mockEmails[0]], { field: 'date', order: 'asc' })
      expect(sorted).toHaveLength(1)
    })

    it('handles already sorted emails', () => {
      const sorted = sortEmails(mockEmails, { field: 'date', order: 'asc' })
      const sortedAgain = sortEmails(sorted, { field: 'date', order: 'asc' })
      expect(sorted).toEqual(sortedAgain)
    })

    it('handles emails with identical values', () => {
      const identical: Email[] = [
        { ...mockEmails[0], id: 'e1' },
        { ...mockEmails[0], id: 'e2' },
        { ...mockEmails[0], id: 'e3' }
      ]
      const sorted = sortEmails(identical, { field: 'date', order: 'asc' })
      expect(sorted).toHaveLength(3)
    })
  })
})
