import { describe, it, expect } from 'vitest'
import {
  executeBulkAction,
  createBulkAction,
  validateBulkAction,
  getBulkActionDescription,
  estimateBulkActionTime,
  isUndoable,
  createUndoAction,
  getAffectedEmails,
  splitIntoBatches,
  mergeSelections,
  toggleSelection,
  selectAll,
  deselectAll,
  isSelected,
  getSelectionCount
} from 'src/lib/bulkActions'
import type { Email } from 'src/mockEmails'

describe('bulkActions utility', () => {
  const mockEmails: Email[] = [
    {
      id: 'e1',
      mailbox: 'inbox',
      unread: true,
      starred: false,
      subject: 'Test 1',
      snippet: 'Snippet 1',
      body: 'Body 1',
      date: '2025-01-01',
      sender: { name: 'Sender 1', email: 'sender1@example.com' },
      recipients: ['you@example.com']
    },
    {
      id: 'e2',
      mailbox: 'inbox',
      unread: false,
      starred: false,
      subject: 'Test 2',
      snippet: 'Snippet 2',
      body: 'Body 2',
      date: '2025-01-02',
      sender: { name: 'Sender 2', email: 'sender2@example.com' },
      recipients: ['you@example.com']
    }
  ]

  describe('executeBulkAction', () => {
    it('marks as read', () => {
      const action = createBulkAction('markRead', ['e1'])
      const result = executeBulkAction(mockEmails, action, mockEmails)
      expect(result.find(e => e.id === 'e1')?.unread).toBe(false)
      expect(result.find(e => e.id === 'e2')?.unread).toBe(false)
    })

    it('marks as unread', () => {
      const action = createBulkAction('markUnread', ['e2'])
      const result = executeBulkAction(mockEmails, action, mockEmails)
      expect(result.find(e => e.id === 'e2')?.unread).toBe(true)
    })

    it('stars emails', () => {
      const action = createBulkAction('star', ['e1', 'e2'])
      const result = executeBulkAction(mockEmails, action, mockEmails)
      expect(result.every(e => e.starred)).toBe(true)
    })

    it('moves to trash', () => {
      const action = createBulkAction('delete', ['e1'])
      const result = executeBulkAction(mockEmails, action, mockEmails)
      expect(result.find(e => e.id === 'e1')?.mailbox).toBe('trash')
    })

    it('moves to folder', () => {
      const action = createBulkAction('move', ['e1'], 'sent')
      const result = executeBulkAction(mockEmails, action, mockEmails)
      expect(result.find(e => e.id === 'e1')?.mailbox).toBe('sent')
    })
  })

  describe('validateBulkAction', () => {
    it('validates correct action', () => {
      const action = createBulkAction('markRead', ['e1'])
      expect(validateBulkAction(action).valid).toBe(true)
    })

    it('rejects empty email list', () => {
      const action = createBulkAction('markRead', [])
      const result = validateBulkAction(action)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('No emails')
    })

    it('requires destination for move', () => {
      const action = createBulkAction('move', ['e1'])
      const result = validateBulkAction(action)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Destination')
    })
  })

  describe('getBulkActionDescription', () => {
    it('describes actions', () => {
      expect(getBulkActionDescription(createBulkAction('markRead', ['e1']))).toContain('Mark 1 email')
      expect(getBulkActionDescription(createBulkAction('star', ['e1', 'e2']))).toContain('Star 2 emails')
      expect(getBulkActionDescription(createBulkAction('delete', ['e1']))).toContain('Delete')
    })
  })

  describe('isUndoable', () => {
    it('checks if action can be undone', () => {
      expect(isUndoable('markRead')).toBe(true)
      expect(isUndoable('star')).toBe(true)
      expect(isUndoable('delete')).toBe(false)
    })
  })

  describe('createUndoAction', () => {
    it('creates undo for markRead', () => {
      const action = createBulkAction('markRead', ['e1'])
      const undo = createUndoAction(action, mockEmails)
      expect(undo?.type).toBe('markUnread')
    })

    it('creates undo for star', () => {
      const action = createBulkAction('star', ['e1'])
      const undo = createUndoAction(action, mockEmails)
      expect(undo?.type).toBe('unstar')
    })

    it('returns null for non-undoable actions', () => {
      const action = createBulkAction('move', ['e1'], 'trash')
      expect(createUndoAction(action, mockEmails)).toBeNull()
    })
  })

  describe('selection management', () => {
    it('toggles selection', () => {
      const selection = ['e1']
      const result1 = toggleSelection(selection, 'e2')
      expect(result1).toEqual(['e1', 'e2'])

      const result2 = toggleSelection(result1, 'e1')
      expect(result2).toEqual(['e2'])
    })

    it('selects all', () => {
      const result = selectAll(mockEmails)
      expect(result).toEqual(['e1', 'e2'])
    })

    it('deselects all', () => {
      expect(deselectAll()).toEqual([])
    })

    it('checks if selected', () => {
      expect(isSelected('e1', ['e1', 'e2'])).toBe(true)
      expect(isSelected('e3', ['e1', 'e2'])).toBe(false)
    })

    it('gets selection count', () => {
      expect(getSelectionCount(['e1', 'e2', 'e3'])).toBe(3)
    })

    it('merges selections', () => {
      const merged = mergeSelections([['e1'], ['e2'], ['e1', 'e3']])
      expect(merged).toHaveLength(3)
      expect(merged).toContain('e1')
      expect(merged).toContain('e2')
      expect(merged).toContain('e3')
    })
  })

  describe('batching', () => {
    it('splits into batches', () => {
      const ids = Array.from({ length: 250 }, (_, i) => `e${i}`)
      const action = createBulkAction('markRead', ids)
      const batches = splitIntoBatches(action, 100)

      expect(batches).toHaveLength(3)
      expect(batches[0].emailIds).toHaveLength(100)
      expect(batches[1].emailIds).toHaveLength(100)
      expect(batches[2].emailIds).toHaveLength(50)
    })

    it('estimates action time', () => {
      const action = createBulkAction('markRead', ['e1', 'e2', 'e3'])
      const time = estimateBulkActionTime(action)
      expect(time).toBe(150) // 3 emails * 50ms
    })
  })

  describe('getAffectedEmails', () => {
    it('returns affected emails', () => {
      const action = createBulkAction('markRead', ['e1'])
      const affected = getAffectedEmails(mockEmails, action)
      expect(affected).toHaveLength(1)
      expect(affected[0].id).toBe('e1')
    })
  })
})
