import { describe, it, expect } from 'vitest'
import {
  generateQuickReplies,
  personalizeReply,
  getReplyColor,
  generatePriorityReply
} from 'src/lib/quickReplies'
import type { Email } from 'src/mockEmails'

describe('quickReplies utility', () => {
  const mockEmail: Email = {
    id: 'e1',
    mailbox: 'inbox',
    unread: true,
    subject: 'Question about meeting',
    snippet: 'When is the meeting?',
    body: 'Hi, when is the meeting scheduled?',
    date: '2025-01-15T10:00:00Z',
    sender: { name: 'Alice', email: 'alice@example.com' },
    recipients: ['you@example.com']
  }

  describe('generateQuickReplies', () => {
    it('generates quick replies for questions', () => {
      const replies = generateQuickReplies(mockEmail)
      expect(replies.length).toBeGreaterThan(0)
      expect(replies.length).toBeLessThanOrEqual(5)
    })

    it('generates replies for thank you emails', () => {
      const thankYouEmail: Email = {
        ...mockEmail,
        subject: 'Thank you!',
        body: 'Thank you for your help'
      }
      const replies = generateQuickReplies(thankYouEmail)
      expect(replies.some(r => r.category === 'positive')).toBe(true)
    })

    it('sorts by confidence', () => {
      const replies = generateQuickReplies(mockEmail)
      for (let i = 1; i < replies.length; i++) {
        expect((replies[i - 1].confidence || 0)).toBeGreaterThanOrEqual(replies[i].confidence || 0)
      }
    })
  })

  describe('personalizeReply', () => {
    it('personalizes reply with name', () => {
      const reply = { id: 'qr1', text: "I'll look into this.", category: 'neutral' as const, confidence: 0.8 }
      const personalized = personalizeReply(reply, 'Alice')
      expect(personalized).toContain('Alice')
    })
  })

  describe('getReplyColor', () => {
    it('returns colors for categories', () => {
      expect(getReplyColor('positive')).toBe('#10b981')
      expect(getReplyColor('neutral')).toBe('#6b7280')
      expect(getReplyColor('question')).toBe('#3b82f6')
      expect(getReplyColor('busy')).toBe('#f59e0b')
    })
  })

  describe('generatePriorityReply', () => {
    it('generates replies based on priority', () => {
      expect(generatePriorityReply('urgent')).toContain('urgent')
      expect(generatePriorityReply('high')).toContain('high priority')
      expect(generatePriorityReply('normal')).toContain('soon')
      expect(generatePriorityReply('low')).toContain('moment')
    })
  })
})
