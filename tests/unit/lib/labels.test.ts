import { describe, it, expect } from 'vitest'
import {
  extractLabels,
  addLabelToEmail,
  removeLabelFromEmail,
  filterByLabel,
  createLabel,
  validateLabelName,
  getLabelStats
} from 'src/lib/labels'
import type { Email } from 'src/mockEmails'
import type { Label } from 'src/types/extended'

describe('labels utility', () => {
  const mockLabel1: Label = { id: 'l1', name: 'Work', color: '#ff0000' }
  const mockLabel2: Label = { id: 'l2', name: 'Personal', color: '#00ff00' }
  const mockLabel3: Label = { id: 'l3', name: 'Urgent', color: '#0000ff' }

  const mockEmail1: Email = {
    id: 'e1',
    mailbox: 'inbox',
    unread: true,
    subject: 'Test 1',
    snippet: 'Snippet 1',
    body: 'Body 1',
    date: '2025-01-01T00:00:00Z',
    sender: { name: 'Sender 1', email: 'sender1@example.com' },
    recipients: ['you@example.com'],
    labels: [mockLabel1, mockLabel2]
  }

  const mockEmail2: Email = {
    id: 'e2',
    mailbox: 'inbox',
    unread: false,
    subject: 'Test 2',
    snippet: 'Snippet 2',
    body: 'Body 2',
    date: '2025-01-02T00:00:00Z',
    sender: { name: 'Sender 2', email: 'sender2@example.com' },
    recipients: ['you@example.com'],
    labels: [mockLabel1]
  }

  const mockEmail3: Email = {
    id: 'e3',
    mailbox: 'inbox',
    unread: true,
    subject: 'Test 3',
    snippet: 'Snippet 3',
    body: 'Body 3',
    date: '2025-01-03T00:00:00Z',
    sender: { name: 'Sender 3', email: 'sender3@example.com' },
    recipients: ['you@example.com']
  }

  describe('extractLabels', () => {
    it('extracts all unique labels from emails', () => {
      const labels = extractLabels([mockEmail1, mockEmail2])
      expect(labels).toHaveLength(2)
      expect(labels.some(l => l.id === 'l1')).toBe(true)
      expect(labels.some(l => l.id === 'l2')).toBe(true)
    })

    it('counts label occurrences', () => {
      const labels = extractLabels([mockEmail1, mockEmail2])
      const workLabel = labels.find(l => l.id === 'l1')
      expect(workLabel?.count).toBe(2)
      const personalLabel = labels.find(l => l.id === 'l2')
      expect(personalLabel?.count).toBe(1)
    })

    it('returns empty array for emails without labels', () => {
      const labels = extractLabels([mockEmail3])
      expect(labels).toHaveLength(0)
    })

    it('returns empty array for empty email list', () => {
      const labels = extractLabels([])
      expect(labels).toHaveLength(0)
    })

    it('sorts labels alphabetically by name', () => {
      const emailWithMultiple: Email = {
        ...mockEmail1,
        labels: [
          { id: 'l3', name: 'Zebra', color: '#000' },
          { id: 'l4', name: 'Alpha', color: '#000' },
          { id: 'l5', name: 'Beta', color: '#000' }
        ]
      }
      const labels = extractLabels([emailWithMultiple])
      expect(labels[0].name).toBe('Alpha')
      expect(labels[1].name).toBe('Beta')
      expect(labels[2].name).toBe('Zebra')
    })
  })

  describe('addLabelToEmail', () => {
    it('adds a label to an email', () => {
      const result = addLabelToEmail(mockEmail3, mockLabel1)
      expect(result.labels).toHaveLength(1)
      expect(result.labels![0].id).toBe('l1')
    })

    it('does not add duplicate labels', () => {
      const result = addLabelToEmail(mockEmail1, mockLabel1)
      expect(result.labels).toHaveLength(2) // should still be 2, not 3
    })

    it('preserves existing labels', () => {
      const result = addLabelToEmail(mockEmail1, mockLabel3)
      expect(result.labels).toHaveLength(3)
      expect(result.labels!.some(l => l.id === 'l1')).toBe(true)
      expect(result.labels!.some(l => l.id === 'l2')).toBe(true)
      expect(result.labels!.some(l => l.id === 'l3')).toBe(true)
    })

    it('handles emails without labels array', () => {
      const result = addLabelToEmail(mockEmail3, mockLabel1)
      expect(result.labels).toHaveLength(1)
    })
  })

  describe('removeLabelFromEmail', () => {
    it('removes a label from an email', () => {
      const result = removeLabelFromEmail(mockEmail1, 'l1')
      expect(result.labels).toHaveLength(1)
      expect(result.labels![0].id).toBe('l2')
    })

    it('returns email unchanged if label not found', () => {
      const result = removeLabelFromEmail(mockEmail1, 'non-existent')
      expect(result.labels).toHaveLength(2)
    })

    it('handles emails without labels', () => {
      const result = removeLabelFromEmail(mockEmail3, 'l1')
      expect(result).toEqual(mockEmail3)
    })

    it('removes all occurrences of a label', () => {
      const emailWithDupes: Email = {
        ...mockEmail1,
        labels: [mockLabel1, mockLabel2, mockLabel1] // duplicate for test
      }
      const result = removeLabelFromEmail(emailWithDupes, 'l1')
      expect(result.labels).toHaveLength(1)
      expect(result.labels![0].id).toBe('l2')
    })
  })

  describe('filterByLabel', () => {
    it('filters emails by label ID', () => {
      const emails = [mockEmail1, mockEmail2, mockEmail3]
      const result = filterByLabel(emails, 'l1')
      expect(result).toHaveLength(2)
      expect(result.every(e => e.labels?.some(l => l.id === 'l1'))).toBe(true)
    })

    it('returns empty array if no matches', () => {
      const emails = [mockEmail3]
      const result = filterByLabel(emails, 'l1')
      expect(result).toHaveLength(0)
    })

    it('returns empty array for empty input', () => {
      const result = filterByLabel([], 'l1')
      expect(result).toHaveLength(0)
    })

    it('handles emails without labels', () => {
      const emails = [mockEmail1, mockEmail3]
      const result = filterByLabel(emails, 'l1')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e1')
    })
  })

  describe('createLabel', () => {
    it('creates a label with generated ID', () => {
      const label = createLabel('Test Label', '#123456')
      expect(label.name).toBe('Test Label')
      expect(label.color).toBe('#123456')
      expect(label.id).toMatch(/^label-/)
      expect(label.count).toBe(0)
    })

    it('generates unique IDs', () => {
      const label1 = createLabel('Label 1', '#111')
      const label2 = createLabel('Label 2', '#222')
      expect(label1.id).not.toBe(label2.id)
    })

    it('handles empty name', () => {
      const label = createLabel('', '#000')
      expect(label.name).toBe('')
    })

    it('handles special characters in name', () => {
      const label = createLabel('Test @ Label #1', '#000')
      expect(label.name).toBe('Test @ Label #1')
    })
  })

  describe('validateLabelName', () => {
    it('validates correct label names', () => {
      expect(validateLabelName('Work').valid).toBe(true)
      expect(validateLabelName('Work-Home').valid).toBe(true)
      expect(validateLabelName('Work_Tasks').valid).toBe(true)
      expect(validateLabelName('Work Tasks 123').valid).toBe(true)
    })

    it('rejects empty names', () => {
      const result = validateLabelName('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('rejects whitespace-only names', () => {
      const result = validateLabelName('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('rejects names shorter than 3 characters', () => {
      const result = validateLabelName('ab')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('at least 3')
    })

    it('rejects names longer than 30 characters', () => {
      const result = validateLabelName('a'.repeat(31))
      expect(result.valid).toBe(false)
      expect(result.error).toContain('less than 30')
    })

    it('rejects names with invalid characters', () => {
      expect(validateLabelName('Work@Home').valid).toBe(false)
      expect(validateLabelName('Work#Tag').valid).toBe(false)
      expect(validateLabelName('Work!').valid).toBe(false)
      expect(validateLabelName('Work$').valid).toBe(false)
    })

    it('trims whitespace before validation', () => {
      const result = validateLabelName('  Work  ')
      expect(result.valid).toBe(true)
    })
  })

  describe('getLabelStats', () => {
    it('calculates stats for all labels', () => {
      const emails = [mockEmail1, mockEmail2, mockEmail3]
      const stats = getLabelStats(emails)

      const workStats = stats.get('l1')
      expect(workStats?.emailCount).toBe(2)
      expect(workStats?.unreadCount).toBe(1)

      const personalStats = stats.get('l2')
      expect(personalStats?.emailCount).toBe(1)
      expect(personalStats?.unreadCount).toBe(1)
    })

    it('handles emails without labels', () => {
      const stats = getLabelStats([mockEmail3])
      expect(stats.size).toBe(0)
    })

    it('returns empty map for empty email list', () => {
      const stats = getLabelStats([])
      expect(stats.size).toBe(0)
    })

    it('counts unread emails correctly', () => {
      const unreadEmail: Email = {
        ...mockEmail1,
        unread: true,
        labels: [mockLabel1]
      }
      const readEmail: Email = {
        ...mockEmail2,
        unread: false,
        labels: [mockLabel1]
      }
      const stats = getLabelStats([unreadEmail, readEmail])
      const workStats = stats.get('l1')
      expect(workStats?.emailCount).toBe(2)
      expect(workStats?.unreadCount).toBe(1)
    })

    it('preserves label information in stats', () => {
      const stats = getLabelStats([mockEmail1])
      const workStats = stats.get('l1')
      expect(workStats?.label.name).toBe('Work')
      expect(workStats?.label.color).toBe('#ff0000')
    })
  })

  describe('edge cases', () => {
    it('handles emails with empty labels array', () => {
      const email: Email = { ...mockEmail1, labels: [] }
      const labels = extractLabels([email])
      expect(labels).toHaveLength(0)
    })

    it('handles adding label to email without labels property', () => {
      const email: Email = { ...mockEmail3 }
      delete (email as any).labels
      const result = addLabelToEmail(email, mockLabel1)
      expect(result.labels).toHaveLength(1)
    })

    it('handles large number of labels', () => {
      const manyLabels: Label[] = Array.from({ length: 100 }, (_, i) => ({
        id: `l${i}`,
        name: `Label ${i}`,
        color: `#${i.toString(16).padStart(6, '0')}`
      }))
      const email: Email = { ...mockEmail1, labels: manyLabels }
      const labels = extractLabels([email])
      expect(labels).toHaveLength(100)
    })

    it('handles large number of emails', () => {
      const manyEmails: Email[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockEmail1,
        id: `e${i}`,
        labels: i % 2 === 0 ? [mockLabel1] : [mockLabel2]
      }))
      const stats = getLabelStats(manyEmails)
      expect(stats.get('l1')?.emailCount).toBe(500)
      expect(stats.get('l2')?.emailCount).toBe(500)
    })
  })
})
