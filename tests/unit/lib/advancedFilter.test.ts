import { describe, it, expect } from 'vitest'
import {
  applyAdvancedFilter,
  createEmptyFilter,
  isFilterEmpty,
  countActiveFilters,
  mergeFilters,
  clearFilterField,
  validateDateRange,
  getFilterSummary
} from 'src/lib/advancedFilter'
import type { Email } from 'src/mockEmails'
import type { SearchFilter } from 'src/types/extended'

describe('advancedFilter utility', () => {
  const mockEmails: Email[] = [
    {
      id: 'e1',
      mailbox: 'inbox',
      unread: true,
      starred: true,
      subject: 'Important Project Update',
      snippet: 'The project is going well',
      body: 'Full details about the project',
      date: '2025-01-15T10:00:00Z',
      sender: { name: 'Alice Johnson', email: 'alice@example.com' },
      recipients: ['you@example.com'],
      hasAttachment: true,
      priority: 'high',
      labels: [{ id: 'l1', name: 'Work', color: '#ff0000' }]
    },
    {
      id: 'e2',
      mailbox: 'inbox',
      unread: false,
      starred: false,
      subject: 'Meeting Notes',
      snippet: 'Notes from yesterday',
      body: 'Here are the notes',
      date: '2025-01-10T10:00:00Z',
      sender: { name: 'Bob Smith', email: 'bob@example.com' },
      recipients: ['you@example.com'],
      cc: ['team@example.com'],
      hasAttachment: false,
      priority: 'normal',
      labels: [{ id: 'l2', name: 'Meeting', color: '#00ff00' }]
    },
    {
      id: 'e3',
      mailbox: 'inbox',
      unread: true,
      starred: false,
      subject: 'Invoice Reminder',
      snippet: 'Payment due soon',
      body: 'Please pay the invoice',
      date: '2025-01-20T10:00:00Z',
      sender: { name: 'Billing Dept', email: 'billing@vendor.com' },
      recipients: ['you@example.com'],
      hasAttachment: true,
      priority: 'urgent',
      labels: [{ id: 'l3', name: 'Finance', color: '#0000ff' }]
    }
  ]

  describe('applyAdvancedFilter', () => {
    it('filters by basic query', () => {
      const filter: SearchFilter = { query: 'project' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e1')
    })

    it('filters by from (name)', () => {
      const filter: SearchFilter = { query: '', from: 'Alice' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].sender.name).toBe('Alice Johnson')
    })

    it('filters by from (email)', () => {
      const filter: SearchFilter = { query: '', from: 'bob@example.com' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e2')
    })

    it('filters by to', () => {
      const filter: SearchFilter = { query: '', to: 'you@example.com' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(3)
    })

    it('filters by cc', () => {
      const filter: SearchFilter = { query: '', to: 'team@example.com' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e2')
    })

    it('filters by subject', () => {
      const filter: SearchFilter = { query: '', subject: 'invoice' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e3')
    })

    it('filters by hasAttachment true', () => {
      const filter: SearchFilter = { query: '', hasAttachment: true }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(2)
      expect(result.every(e => e.hasAttachment)).toBe(true)
    })

    it('filters by hasAttachment false', () => {
      const filter: SearchFilter = { query: '', hasAttachment: false }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].hasAttachment).toBe(false)
    })

    it('filters by isUnread true', () => {
      const filter: SearchFilter = { query: '', isUnread: true }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(2)
      expect(result.every(e => e.unread)).toBe(true)
    })

    it('filters by isUnread false', () => {
      const filter: SearchFilter = { query: '', isUnread: false }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].unread).toBe(false)
    })

    it('filters by isStarred true', () => {
      const filter: SearchFilter = { query: '', isStarred: true }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].starred).toBe(true)
    })

    it('filters by isStarred false', () => {
      const filter: SearchFilter = { query: '', isStarred: false }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(2)
      expect(result.every(e => !e.starred)).toBe(true)
    })

    it('filters by dateFrom', () => {
      const filter: SearchFilter = { query: '', dateFrom: '2025-01-12T00:00:00Z' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(2) // e1 and e3
    })

    it('filters by dateTo', () => {
      const filter: SearchFilter = { query: '', dateTo: '2025-01-12T00:00:00Z' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1) // e2
    })

    it('filters by date range', () => {
      const filter: SearchFilter = {
        query: '',
        dateFrom: '2025-01-01T00:00:00Z',
        dateTo: '2025-01-16T00:00:00Z'
      }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(2) // e2 and e1
    })

    it('filters by labels', () => {
      const filter: SearchFilter = { query: '', labels: ['l1'] }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e1')
    })

    it('filters by multiple labels (OR logic)', () => {
      const filter: SearchFilter = { query: '', labels: ['l1', 'l2'] }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(2) // e1 has l1, e2 has l2
    })

    it('filters by priority', () => {
      const filter: SearchFilter = { query: '', priority: 'high' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
      expect(result[0].priority).toBe('high')
    })

    it('combines multiple filters (AND logic)', () => {
      const filter: SearchFilter = {
        query: '',
        isUnread: true,
        hasAttachment: true
      }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(2) // e1 and e3
    })

    it('returns all emails for empty filter', () => {
      const filter = createEmptyFilter()
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(3)
    })

    it('returns empty array when no matches', () => {
      const filter: SearchFilter = { query: 'nonexistent' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(0)
    })

    it('handles case-insensitive matching', () => {
      const filter: SearchFilter = { query: 'PROJECT' }
      const result = applyAdvancedFilter(mockEmails, filter)
      expect(result).toHaveLength(1)
    })
  })

  describe('createEmptyFilter', () => {
    it('creates empty filter', () => {
      const filter = createEmptyFilter()
      expect(filter.query).toBe('')
      expect(filter.from).toBeUndefined()
      expect(filter.to).toBeUndefined()
    })
  })

  describe('isFilterEmpty', () => {
    it('returns true for empty filter', () => {
      const filter = createEmptyFilter()
      expect(isFilterEmpty(filter)).toBe(true)
    })

    it('returns false when query is set', () => {
      const filter: SearchFilter = { query: 'test' }
      expect(isFilterEmpty(filter)).toBe(false)
    })

    it('returns false when any field is set', () => {
      expect(isFilterEmpty({ query: '', from: 'alice' })).toBe(false)
      expect(isFilterEmpty({ query: '', isUnread: true })).toBe(false)
      expect(isFilterEmpty({ query: '', labels: ['l1'] })).toBe(false)
    })

    it('ignores whitespace in query', () => {
      const filter: SearchFilter = { query: '   ' }
      expect(isFilterEmpty(filter)).toBe(true)
    })
  })

  describe('countActiveFilters', () => {
    it('counts zero for empty filter', () => {
      const filter = createEmptyFilter()
      expect(countActiveFilters(filter)).toBe(0)
    })

    it('counts each active filter', () => {
      const filter: SearchFilter = {
        query: 'test',
        from: 'alice',
        isUnread: true
      }
      expect(countActiveFilters(filter)).toBe(3)
    })

    it('does not count undefined fields', () => {
      const filter: SearchFilter = {
        query: '',
        from: undefined,
        to: undefined
      }
      expect(countActiveFilters(filter)).toBe(0)
    })

    it('counts all fields when set', () => {
      const filter: SearchFilter = {
        query: 'test',
        from: 'alice',
        to: 'bob',
        subject: 'meeting',
        hasAttachment: true,
        isUnread: true,
        isStarred: true,
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31',
        labels: ['l1'],
        priority: 'high'
      }
      expect(countActiveFilters(filter)).toBe(11)
    })
  })

  describe('mergeFilters', () => {
    it('merges two filters', () => {
      const filter1: SearchFilter = { query: 'test', from: 'alice' }
      const filter2: SearchFilter = { query: 'meeting', to: 'bob' }
      const merged = mergeFilters(filter1, filter2)
      expect(merged.query).toBe('meeting') // filter2 takes precedence
      expect(merged.from).toBe('alice')
      expect(merged.to).toBe('bob')
    })

    it('prioritizes second filter values', () => {
      const filter1: SearchFilter = { query: 'old', isUnread: true }
      const filter2: SearchFilter = { query: 'new', isUnread: false }
      const merged = mergeFilters(filter1, filter2)
      expect(merged.query).toBe('new')
      expect(merged.isUnread).toBe(false)
    })

    it('keeps filter1 values when filter2 is undefined', () => {
      const filter1: SearchFilter = { query: 'test', from: 'alice' }
      const filter2: SearchFilter = { query: '' }
      const merged = mergeFilters(filter1, filter2)
      expect(merged.from).toBe('alice')
    })
  })

  describe('clearFilterField', () => {
    it('clears specific field', () => {
      const filter: SearchFilter = { query: 'test', from: 'alice', to: 'bob' }
      const cleared = clearFilterField(filter, 'from')
      expect(cleared.from).toBeUndefined()
      expect(cleared.query).toBe('test')
      expect(cleared.to).toBe('bob')
    })

    it('clears boolean fields', () => {
      const filter: SearchFilter = { query: '', isUnread: true, isStarred: true }
      const cleared = clearFilterField(filter, 'isUnread')
      expect(cleared.isUnread).toBeUndefined()
      expect(cleared.isStarred).toBe(true)
    })

    it('clears labels array', () => {
      const filter: SearchFilter = { query: '', labels: ['l1', 'l2'] }
      const cleared = clearFilterField(filter, 'labels')
      expect(cleared.labels).toEqual([])
    })
  })

  describe('validateDateRange', () => {
    it('validates correct date range', () => {
      const filter: SearchFilter = {
        query: '',
        dateFrom: '2025-01-01',
        dateTo: '2025-01-31'
      }
      const result = validateDateRange(filter)
      expect(result.valid).toBe(true)
    })

    it('rejects invalid from date', () => {
      const filter: SearchFilter = {
        query: '',
        dateFrom: 'invalid',
        dateTo: '2025-01-31'
      }
      const result = validateDateRange(filter)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid from date')
    })

    it('rejects invalid to date', () => {
      const filter: SearchFilter = {
        query: '',
        dateFrom: '2025-01-01',
        dateTo: 'invalid'
      }
      const result = validateDateRange(filter)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid to date')
    })

    it('rejects when from is after to', () => {
      const filter: SearchFilter = {
        query: '',
        dateFrom: '2025-01-31',
        dateTo: '2025-01-01'
      }
      const result = validateDateRange(filter)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('before')
    })

    it('validates when only one date is set', () => {
      const filter1: SearchFilter = { query: '', dateFrom: '2025-01-01' }
      const filter2: SearchFilter = { query: '', dateTo: '2025-01-31' }
      expect(validateDateRange(filter1).valid).toBe(true)
      expect(validateDateRange(filter2).valid).toBe(true)
    })

    it('validates when no dates are set', () => {
      const filter: SearchFilter = { query: '' }
      expect(validateDateRange(filter).valid).toBe(true)
    })
  })

  describe('getFilterSummary', () => {
    it('generates summary for single filter', () => {
      const filter: SearchFilter = { query: 'test' }
      const summary = getFilterSummary(filter)
      expect(summary).toContain('Search: "test"')
    })

    it('generates summary for multiple filters', () => {
      const filter: SearchFilter = {
        query: 'meeting',
        from: 'alice',
        isUnread: true
      }
      const summary = getFilterSummary(filter)
      expect(summary).toContain('Search: "meeting"')
      expect(summary).toContain('From: alice')
      expect(summary).toContain('Unread')
      expect(summary).toContain('•')
    })

    it('returns empty string for empty filter', () => {
      const filter = createEmptyFilter()
      const summary = getFilterSummary(filter)
      expect(summary).toBe('')
    })

    it('includes all filter types', () => {
      const filter: SearchFilter = {
        query: 'test',
        hasAttachment: true,
        priority: 'high'
      }
      const summary = getFilterSummary(filter)
      expect(summary).toContain('Has attachment')
      expect(summary).toContain('Priority: high')
    })
  })
})
