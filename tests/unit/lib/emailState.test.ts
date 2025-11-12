import { describe, it, expect } from 'vitest'
import {
  markAsRead,
  markAsUnread,
  toggleReadStatus,
  markAsStarred,
  markAsUnstarred,
  toggleStarred,
  setPriority,
  clearPriority,
  isHighPriority,
  isLowPriority,
  getPriorityOrder,
  comparePriorities,
  bulkMarkAsRead,
  bulkMarkAsUnread,
  bulkStar,
  bulkUnstar,
  bulkSetPriority,
  getUnreadCount,
  getStarredCount,
  getCountByPriority,
  filterUnread,
  filterRead,
  filterStarred,
  filterByPriority
} from 'src/lib/emailState'
import type { Email } from 'src/mockEmails'

describe('emailState utility', () => {
  const mockEmail: Email = {
    id: 'e1',
    mailbox: 'inbox',
    unread: true,
    starred: false,
    subject: 'Test',
    snippet: 'Test',
    body: 'Test',
    date: '2025-01-01',
    sender: { name: 'Sender', email: 'sender@example.com' },
    recipients: ['you@example.com'],
    priority: 'normal'
  }

  describe('read/unread', () => {
    it('marks as read', () => {
      const result = markAsRead(mockEmail)
      expect(result.unread).toBe(false)
      expect(result.isRead).toBe(true)
    })

    it('marks as unread', () => {
      const readEmail = { ...mockEmail, unread: false }
      const result = markAsUnread(readEmail)
      expect(result.unread).toBe(true)
      expect(result.isRead).toBe(false)
    })

    it('toggles read status', () => {
      const result1 = toggleReadStatus(mockEmail)
      expect(result1.unread).toBe(false)

      const result2 = toggleReadStatus(result1)
      expect(result2.unread).toBe(true)
    })
  })

  describe('starred', () => {
    it('marks as starred', () => {
      const result = markAsStarred(mockEmail)
      expect(result.starred).toBe(true)
    })

    it('marks as unstarred', () => {
      const starred = { ...mockEmail, starred: true }
      const result = markAsUnstarred(starred)
      expect(result.starred).toBe(false)
    })

    it('toggles starred', () => {
      const result1 = toggleStarred(mockEmail)
      expect(result1.starred).toBe(true)

      const result2 = toggleStarred(result1)
      expect(result2.starred).toBe(false)
    })
  })

  describe('priority', () => {
    it('sets priority', () => {
      const result = setPriority(mockEmail, 'high')
      expect(result.priority).toBe('high')
    })

    it('clears priority', () => {
      const highPriority = { ...mockEmail, priority: 'high' as const }
      const result = clearPriority(highPriority)
      expect(result.priority).toBe('normal')
    })

    it('checks high priority', () => {
      expect(isHighPriority({ ...mockEmail, priority: 'urgent' })).toBe(true)
      expect(isHighPriority({ ...mockEmail, priority: 'high' })).toBe(true)
      expect(isHighPriority({ ...mockEmail, priority: 'normal' })).toBe(false)
    })

    it('checks low priority', () => {
      expect(isLowPriority({ ...mockEmail, priority: 'low' })).toBe(true)
      expect(isLowPriority({ ...mockEmail, priority: 'normal' })).toBe(false)
    })

    it('gets priority order', () => {
      expect(getPriorityOrder('urgent')).toBe(0)
      expect(getPriorityOrder('high')).toBe(1)
      expect(getPriorityOrder('normal')).toBe(2)
      expect(getPriorityOrder('low')).toBe(3)
    })

    it('compares priorities', () => {
      expect(comparePriorities('urgent', 'low')).toBeLessThan(0)
      expect(comparePriorities('normal', 'normal')).toBe(0)
      expect(comparePriorities('low', 'high')).toBeGreaterThan(0)
    })
  })

  describe('bulk operations', () => {
    const emails: Email[] = [
      { ...mockEmail, id: 'e1', unread: true },
      { ...mockEmail, id: 'e2', unread: true },
      { ...mockEmail, id: 'e3', unread: false }
    ]

    it('bulk marks as read', () => {
      const result = bulkMarkAsRead(emails)
      expect(result.every(e => !e.unread)).toBe(true)
    })

    it('bulk marks as unread', () => {
      const result = bulkMarkAsUnread(emails)
      expect(result.every(e => e.unread)).toBe(true)
    })

    it('bulk stars', () => {
      const result = bulkStar(emails)
      expect(result.every(e => e.starred)).toBe(true)
    })

    it('bulk unstars', () => {
      const starredEmails = emails.map(e => ({ ...e, starred: true }))
      const result = bulkUnstar(starredEmails)
      expect(result.every(e => !e.starred)).toBe(true)
    })

    it('bulk sets priority', () => {
      const result = bulkSetPriority(emails, 'urgent')
      expect(result.every(e => e.priority === 'urgent')).toBe(true)
    })
  })

  describe('counts and filters', () => {
    const emails: Email[] = [
      { ...mockEmail, id: 'e1', unread: true, starred: true, priority: 'high' },
      { ...mockEmail, id: 'e2', unread: false, starred: false, priority: 'normal' },
      { ...mockEmail, id: 'e3', unread: true, starred: false, priority: 'high' }
    ]

    it('gets unread count', () => {
      expect(getUnreadCount(emails)).toBe(2)
    })

    it('gets starred count', () => {
      expect(getStarredCount(emails)).toBe(1)
    })

    it('gets count by priority', () => {
      expect(getCountByPriority(emails, 'high')).toBe(2)
      expect(getCountByPriority(emails, 'normal')).toBe(1)
    })

    it('filters unread', () => {
      const result = filterUnread(emails)
      expect(result).toHaveLength(2)
    })

    it('filters read', () => {
      const result = filterRead(emails)
      expect(result).toHaveLength(1)
    })

    it('filters starred', () => {
      const result = filterStarred(emails)
      expect(result).toHaveLength(1)
    })

    it('filters by priority', () => {
      const result = filterByPriority(emails, 'high')
      expect(result).toHaveLength(2)
    })
  })
})
