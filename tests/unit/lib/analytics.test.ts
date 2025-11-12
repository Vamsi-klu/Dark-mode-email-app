import { describe, it, expect } from 'vitest'
import {
  analyzeSentiment,
  generateAnalytics,
  getProductivityScore,
  detectSpam
} from 'src/lib/analytics'
import type { Email } from 'src/mockEmails'

describe('analytics utility', () => {
  const mockEmail: Email = {
    id: 'e1',
    mailbox: 'inbox',
    unread: true,
    subject: 'Great work!',
    snippet: 'Test',
    body: 'This is excellent work. Great job!',
    date: '2025-01-15T10:00:00Z',
    sender: { name: 'Alice', email: 'alice@example.com' },
    recipients: ['you@example.com'],
    labels: [{ id: 'l1', name: 'Work', color: '#ff0000' }]
  }

  describe('analyzeSentiment', () => {
    it('detects positive sentiment', () => {
      const result = analyzeSentiment('This is great and excellent')
      expect(result.label).toBe('positive')
      expect(result.score).toBeGreaterThan(0)
    })

    it('detects negative sentiment', () => {
      const result = analyzeSentiment('This is bad and terrible')
      expect(result.label).toBe('negative')
      expect(result.score).toBeLessThan(0)
    })

    it('detects neutral sentiment', () => {
      const result = analyzeSentiment('The meeting is scheduled')
      expect(result.label).toBe('neutral')
    })
  })

  describe('generateAnalytics', () => {
    it('generates analytics for emails', () => {
      const analytics = generateAnalytics([mockEmail])
      expect(analytics.totalEmails).toBe(1)
      expect(analytics.unreadCount).toBe(1)
      expect(analytics.labelDistribution).toHaveLength(1)
    })
  })

  describe('getProductivityScore', () => {
    it('calculates score', () => {
      const score = getProductivityScore([mockEmail])
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('detectSpam', () => {
    it('detects spam keywords', () => {
      const spamEmail: Email = {
        ...mockEmail,
        subject: 'URGENT: You are a WINNER!',
        body: 'Congratulations! Claim your prize now!'
      }
      const result = detectSpam(spamEmail)
      expect(result.isSpam).toBe(true)
      expect(result.reasons.length).toBeGreaterThan(0)
    })

    it('allows legitimate emails', () => {
      const result = detectSpam(mockEmail)
      expect(result.isSpam).toBe(false)
    })
  })
})
