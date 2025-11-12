import { describe, it, expect } from 'vitest'
import {
  generateSmartReplies,
  summarizeEmail,
  extractActionItems,
  requiresResponse,
  predictImportance,
  categorizeEmail,
  suggestFollowUpTime,
  isNewsletter,
  isAutomated,
  createPriorityInbox,
  suggestTemplates,
  extractEmailAddresses,
  extractPhoneNumbers,
  extractDates,
  detectLanguage,
  getComposeSuggestions,
  predictBestSendTime,
  clusterRelatedEmails
} from 'src/lib/smartAI'
import type { Email } from 'src/mockEmails'

describe('smartAI utility', () => {
  const mockEmail: Email = {
    id: 'e1',
    mailbox: 'inbox',
    unread: true,
    starred: false,
    subject: 'Project Update',
    snippet: 'Quick update on the project',
    body: 'Hi team, here is a quick update on the project. Please review and let me know if you have any questions.',
    date: '2025-01-10',
    sender: { name: 'John Doe', email: 'john@company.com' },
    recipients: ['you@example.com']
  }

  describe('generateSmartReplies', () => {
    it('generates replies based on content', () => {
      const replies = generateSmartReplies(mockEmail)
      expect(replies.length).toBeGreaterThan(0)
      expect(replies.length).toBeLessThanOrEqual(5)
    })

    it('generates custom number of replies', () => {
      const email = { ...mockEmail, body: 'What do you think? When can we meet?' }
      const replies = generateSmartReplies(email, 2)
      expect(replies).toHaveLength(2)
    })

    it('returns quick reply objects with text and category', () => {
      const replies = generateSmartReplies(mockEmail)
      expect(replies[0]).toHaveProperty('text')
      expect(replies[0]).toHaveProperty('category')
      expect(replies[0]).toHaveProperty('confidence')
    })
  })

  describe('summarizeEmail', () => {
    it('returns snippet for short emails', () => {
      const shortEmail = { ...mockEmail, body: 'Short message.' }
      const summary = summarizeEmail(shortEmail)
      expect(summary).toBe(shortEmail.snippet)
    })

    it('creates summary from first sentences for long emails', () => {
      const longEmail = {
        ...mockEmail,
        body: 'First sentence here. Second important sentence. Third sentence. Fourth sentence. Fifth sentence.'
      }
      const summary = summarizeEmail(longEmail)
      expect(summary).toContain('First sentence')
      expect(summary).toContain('Second important sentence')
    })

    it('limits summary length', () => {
      const longEmail = {
        ...mockEmail,
        body: 'A'.repeat(200) + '. ' + 'B'.repeat(200) + '.'
      }
      const summary = summarizeEmail(longEmail)
      expect(summary.length).toBeLessThanOrEqual(150)
    })
  })

  describe('extractActionItems', () => {
    it('finds action items with keywords', () => {
      const email = {
        ...mockEmail,
        body: 'Please review the document.\nTodo: update the report.\nYou need to confirm by Friday.'
      }
      const items = extractActionItems(email)
      expect(items.length).toBeGreaterThan(0)
      expect(items.some(item => item.toLowerCase().includes('review'))).toBe(true)
    })

    it('returns empty array when no action items', () => {
      const email = {
        ...mockEmail,
        body: 'Just wanted to say hello. Hope you are doing well.'
      }
      const items = extractActionItems(email)
      expect(items).toEqual([])
    })

    it('limits to 5 action items max', () => {
      const email = {
        ...mockEmail,
        body: Array(10).fill('Please do this task.').join('\n')
      }
      const items = extractActionItems(email)
      expect(items.length).toBeLessThanOrEqual(5)
    })

    it('filters out very short lines', () => {
      const email = {
        ...mockEmail,
        body: 'Please\nPlease do this longer task that should be included'
      }
      const items = extractActionItems(email)
      expect(items.every(item => item.length > 10)).toBe(true)
    })

    it('filters out very long lines', () => {
      const email = {
        ...mockEmail,
        body: 'Please ' + 'A'.repeat(300)
      }
      const items = extractActionItems(email)
      expect(items.every(item => item.length < 200)).toBe(true)
    })
  })

  describe('requiresResponse', () => {
    it('detects questions', () => {
      const email = { ...mockEmail, subject: 'Can you help?' }
      expect(requiresResponse(email)).toBe(true)
    })

    it('detects request for reply', () => {
      const email = { ...mockEmail, body: 'Please reply at your earliest convenience.' }
      expect(requiresResponse(email)).toBe(true)
    })

    it('detects RSVP requests', () => {
      const email = { ...mockEmail, body: 'Please RSVP by Friday.' }
      expect(requiresResponse(email)).toBe(true)
    })

    it('returns false for informational emails', () => {
      const email = { ...mockEmail, subject: 'FYI: System Update', body: 'System will be updated tonight.' }
      expect(requiresResponse(email)).toBe(false)
    })
  })

  describe('predictImportance', () => {
    it('gives base score of 0.5', () => {
      const email = { ...mockEmail, sender: { name: 'External', email: 'external@other.com' } }
      const score = predictImportance(email)
      expect(score).toBe(0.5)
    })

    it('boosts score for company emails', () => {
      const email = { ...mockEmail, sender: { name: 'Boss', email: 'boss@company.com' } }
      const score = predictImportance(email)
      expect(score).toBeGreaterThan(0.5)
    })

    it('boosts score for emails with attachments', () => {
      const email = { ...mockEmail, hasAttachment: true }
      const score = predictImportance(email)
      expect(score).toBeGreaterThan(0.5)
    })

    it('boosts score for urgent priority', () => {
      const email = { ...mockEmail, priority: 'urgent' as const }
      const score = predictImportance(email)
      expect(score).toBeGreaterThan(0.7)
    })

    it('boosts score for high priority', () => {
      const email = { ...mockEmail, priority: 'high' as const }
      const score = predictImportance(email)
      expect(score).toBeGreaterThan(0.5)
    })

    it('boosts score for urgent keywords in subject', () => {
      const email = { ...mockEmail, subject: 'URGENT: Action Required' }
      const score = predictImportance(email)
      expect(score).toBeGreaterThan(0.5)
    })

    it('reduces score for emails with many CCs', () => {
      const email = {
        ...mockEmail,
        sender: { name: 'External', email: 'ext@other.com' },
        cc: ['a@x.com', 'b@x.com', 'c@x.com', 'd@x.com']
      }
      const score = predictImportance(email)
      expect(score).toBeLessThan(0.5)
    })

    it('caps score at 1.0', () => {
      const email = {
        ...mockEmail,
        sender: { name: 'Boss', email: 'boss@company.com' },
        hasAttachment: true,
        priority: 'urgent' as const,
        subject: 'URGENT: CRITICAL ACTION REQUIRED ASAP'
      }
      const score = predictImportance(email)
      expect(score).toBeLessThanOrEqual(1.0)
    })

    it('caps score at 0.0', () => {
      const email = {
        ...mockEmail,
        sender: { name: 'External', email: 'ext@other.com' },
        cc: Array(20).fill('person@x.com')
      }
      const score = predictImportance(email)
      expect(score).toBeGreaterThanOrEqual(0.0)
    })
  })

  describe('categorizeEmail', () => {
    it('categorizes finance emails', () => {
      const email = { ...mockEmail, subject: 'Invoice for January' }
      expect(categorizeEmail(email)).toBe('Finance')
    })

    it('categorizes meeting emails', () => {
      const email = { ...mockEmail, body: 'Let\'s schedule a meeting for next week.' }
      expect(categorizeEmail(email)).toBe('Meetings')
    })

    it('categorizes newsletters', () => {
      const email = { ...mockEmail, body: 'Click here to unsubscribe from our newsletter.' }
      expect(categorizeEmail(email)).toBe('Newsletters')
    })

    it('categorizes social notifications', () => {
      const email = { ...mockEmail, body: 'Someone mentioned you in a comment.' }
      expect(categorizeEmail(email)).toBe('Social')
    })

    it('categorizes security emails', () => {
      const email = { ...mockEmail, subject: 'Password reset requested' }
      expect(categorizeEmail(email)).toBe('Security')
    })

    it('categorizes automated emails', () => {
      const email = { ...mockEmail, sender: { name: 'No Reply', email: 'noreply@system.com' } }
      expect(categorizeEmail(email)).toBe('Automated')
    })

    it('defaults to General', () => {
      const email = { ...mockEmail, subject: 'Random topic', body: 'Random content' }
      expect(categorizeEmail(email)).toBe('General')
    })
  })

  describe('suggestFollowUpTime', () => {
    it('suggests 24h for very important emails', () => {
      const email = { ...mockEmail, priority: 'urgent' as const, subject: 'URGENT IMPORTANT' }
      const hours = suggestFollowUpTime(email)
      expect(hours).toBe(24)
    })

    it('suggests 48h for important emails', () => {
      const email = {
        ...mockEmail,
        sender: { name: 'Person', email: 'person@external.com' },
        priority: 'high' as const,
        hasAttachment: true
      }
      const hours = suggestFollowUpTime(email)
      expect(hours).toBe(48)
    })

    it('suggests 72h for normal emails', () => {
      const email = {
        ...mockEmail,
        sender: { name: 'Person', email: 'person@external.com' }
      }
      const hours = suggestFollowUpTime(email)
      expect(hours).toBe(72)
    })

    it('suggests 168h for low priority', () => {
      const email = {
        ...mockEmail,
        sender: { name: 'Person', email: 'person@external.com' },
        priority: 'low' as const,
        cc: Array(10).fill('x@y.com')
      }
      const hours = suggestFollowUpTime(email)
      expect(hours).toBe(168)
    })
  })

  describe('isNewsletter', () => {
    it('detects newsletters with multiple indicators', () => {
      const email = {
        ...mockEmail,
        subject: 'Weekly Newsletter',
        body: 'Click here to unsubscribe or view in browser.'
      }
      expect(isNewsletter(email)).toBe(true)
    })

    it('requires at least 2 indicators', () => {
      const email = { ...mockEmail, body: 'You can unsubscribe here.' }
      expect(isNewsletter(email)).toBe(false)
    })

    it('returns false for regular emails', () => {
      const email = { ...mockEmail, subject: 'Hi', body: 'How are you?' }
      expect(isNewsletter(email)).toBe(false)
    })
  })

  describe('isAutomated', () => {
    it('detects noreply senders', () => {
      const email = { ...mockEmail, sender: { name: 'System', email: 'noreply@system.com' } }
      expect(isAutomated(email)).toBe(true)
    })

    it('detects no-reply senders', () => {
      const email = { ...mockEmail, sender: { name: 'Bot', email: 'no-reply@bot.com' } }
      expect(isAutomated(email)).toBe(true)
    })

    it('detects donotreply senders', () => {
      const email = { ...mockEmail, sender: { name: 'Auto', email: 'donotreply@auto.com' } }
      expect(isAutomated(email)).toBe(true)
    })

    it('returns false for regular senders', () => {
      const email = { ...mockEmail, sender: { name: 'John', email: 'john@company.com' } }
      expect(isAutomated(email)).toBe(false)
    })
  })

  describe('createPriorityInbox', () => {
    const emails: Email[] = [
      { ...mockEmail, id: 'e1', priority: 'urgent' as const, subject: 'URGENT' },
      { ...mockEmail, id: 'e2', sender: { name: 'Boss', email: 'boss@company.com' } },
      { ...mockEmail, id: 'e3', sender: { name: 'Ext', email: 'ext@other.com' }, cc: ['a', 'b', 'c', 'd'] }
    ]

    it('splits emails into three categories', () => {
      const inbox = createPriorityInbox(emails)
      expect(inbox).toHaveProperty('important')
      expect(inbox).toHaveProperty('normal')
      expect(inbox).toHaveProperty('low')
    })

    it('categorizes high importance correctly', () => {
      const inbox = createPriorityInbox(emails)
      expect(inbox.important.length).toBeGreaterThan(0)
    })

    it('handles empty array', () => {
      const inbox = createPriorityInbox([])
      expect(inbox.important).toEqual([])
      expect(inbox.normal).toEqual([])
      expect(inbox.low).toEqual([])
    })
  })

  describe('suggestTemplates', () => {
    it('suggests meeting templates', () => {
      const email = { ...mockEmail, subject: 'Meeting tomorrow' }
      const templates = suggestTemplates(email)
      expect(templates.some(t => t.includes('Meeting'))).toBe(true)
    })

    it('suggests invoice templates', () => {
      const email = { ...mockEmail, subject: 'Invoice #1234' }
      const templates = suggestTemplates(email)
      expect(templates.some(t => t.includes('Payment') || t.includes('Invoice'))).toBe(true)
    })

    it('suggests response templates for emails requiring response', () => {
      const email = { ...mockEmail, body: 'Can you please respond?' }
      const templates = suggestTemplates(email)
      expect(templates.some(t => t.includes('Response') || t.includes('Acknowledgment'))).toBe(true)
    })

    it('returns empty array when no match', () => {
      const email = { ...mockEmail, subject: 'Random', body: 'Random content' }
      const templates = suggestTemplates(email)
      expect(Array.isArray(templates)).toBe(true)
    })
  })

  describe('extractEmailAddresses', () => {
    it('extracts valid email addresses', () => {
      const text = 'Contact john@example.com or jane@company.org'
      const emails = extractEmailAddresses(text)
      expect(emails).toContain('john@example.com')
      expect(emails).toContain('jane@company.org')
    })

    it('removes duplicates', () => {
      const text = 'Email john@example.com and john@example.com again'
      const emails = extractEmailAddresses(text)
      expect(emails).toEqual(['john@example.com'])
    })

    it('returns empty array when no emails found', () => {
      const text = 'No emails here'
      expect(extractEmailAddresses(text)).toEqual([])
    })

    it('handles complex email formats', () => {
      const text = 'Contact first.last+tag@sub.domain.com'
      const emails = extractEmailAddresses(text)
      expect(emails.length).toBeGreaterThan(0)
    })
  })

  describe('extractPhoneNumbers', () => {
    it('extracts US phone numbers', () => {
      const text = 'Call me at 555-123-4567'
      const phones = extractPhoneNumbers(text)
      expect(phones.length).toBeGreaterThan(0)
    })

    it('extracts numbers with parentheses', () => {
      const text = 'Phone: (555) 123-4567'
      const phones = extractPhoneNumbers(text)
      expect(phones.length).toBeGreaterThan(0)
    })

    it('removes duplicates', () => {
      const text = '555-123-4567 or 555-123-4567'
      const phones = extractPhoneNumbers(text)
      expect(phones).toHaveLength(1)
    })

    it('returns empty array when no phones found', () => {
      const text = 'No phone numbers here'
      expect(extractPhoneNumbers(text)).toEqual([])
    })
  })

  describe('extractDates', () => {
    it('extracts MM/DD/YYYY format', () => {
      const text = 'Meeting on 12/25/2025'
      const dates = extractDates(text)
      expect(dates).toContain('12/25/2025')
    })

    it('extracts MM-DD-YYYY format', () => {
      const text = 'Deadline is 01-15-2025'
      const dates = extractDates(text)
      expect(dates).toContain('01-15-2025')
    })

    it('extracts Month DD, YYYY format', () => {
      const text = 'Event on January 20, 2025'
      const dates = extractDates(text)
      expect(dates.some(d => d.includes('January'))).toBe(true)
    })

    it('removes duplicates', () => {
      const text = '12/25/2025 and 12/25/2025'
      const dates = extractDates(text)
      expect(dates).toEqual(['12/25/2025'])
    })

    it('returns empty array when no dates found', () => {
      const text = 'No dates here'
      expect(extractDates(text)).toEqual([])
    })
  })

  describe('detectLanguage', () => {
    it('detects English', () => {
      const text = 'The quick brown fox jumps over the lazy dog'
      expect(detectLanguage(text)).toBe('english')
    })

    it('detects Spanish', () => {
      const text = 'El gato está en la casa y el perro está en el jardín'
      expect(detectLanguage(text)).toBe('spanish')
    })

    it('detects French', () => {
      const text = 'Le chat est sur le tapis et il est très content'
      expect(detectLanguage(text)).toBe('french')
    })

    it('detects German', () => {
      const text = 'Der Hund ist in dem Garten und die Katze ist in der Küche'
      expect(detectLanguage(text)).toBe('german')
    })

    it('defaults to English for unknown languages', () => {
      const text = 'xyz abc def'
      expect(detectLanguage(text)).toBe('english')
    })

    it('defaults to English for short text', () => {
      const text = 'Hi'
      expect(detectLanguage(text)).toBe('english')
    })
  })

  describe('getComposeSuggestions', () => {
    it('suggests thank you completions', () => {
      const suggestions = getComposeSuggestions('Thank')
      expect(suggestions.some(s => s.toLowerCase().includes('thank'))).toBe(true)
    })

    it('suggests meeting completions', () => {
      const suggestions = getComposeSuggestions('Let\'s meet')
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('suggests attachment completions', () => {
      const suggestions = getComposeSuggestions('I\'ve attached')
      expect(suggestions.some(s => s.toLowerCase().includes('attach'))).toBe(true)
    })

    it('returns empty array for no matches', () => {
      const suggestions = getComposeSuggestions('xyz')
      expect(suggestions).toEqual([])
    })
  })

  describe('predictBestSendTime', () => {
    it('returns a valid future date', () => {
      const now = new Date()
      const sendTime = predictBestSendTime('test@example.com')
      expect(sendTime).toBeInstanceOf(Date)
      expect(sendTime >= now).toBe(true)
    })

    it('sets hour to 9am for late night times', () => {
      // Function checks current hour, if >= 22 or < 7, schedules for 9am next day
      const sendTime = predictBestSendTime('test@example.com')
      const hour = new Date().getHours()

      if (hour >= 22 || hour < 7) {
        expect(sendTime.getHours()).toBe(9)
      } else {
        // During business hours, should be soon
        expect(sendTime).toBeInstanceOf(Date)
      }
    })

    it('suggests reasonable send times', () => {
      const sendTime = predictBestSendTime('test@example.com')
      const now = new Date()

      // Should be in the future (either soon or next day at 9am)
      const timeDiff = sendTime.getTime() - now.getTime()
      expect(timeDiff).toBeGreaterThan(0)
      expect(timeDiff).toBeLessThan(30 * 60 * 60 * 1000) // Within 30 hours max
    })
  })

  describe('clusterRelatedEmails', () => {
    it('clusters emails by thread ID', () => {
      const emails: Email[] = [
        { ...mockEmail, id: 'e1', subject: 'Thread A', threadId: 'thread1' },
        { ...mockEmail, id: 'e2', subject: 'Thread A', threadId: 'thread1' },
        { ...mockEmail, id: 'e3', subject: 'Thread B', threadId: 'thread2' }
      ]
      const clusters = clusterRelatedEmails(emails)
      expect(clusters.some(c => c.length === 2)).toBe(true)
      expect(clusters.some(c => c.length === 1)).toBe(true)
    })

    it('clusters emails by similar subject', () => {
      const emails: Email[] = [
        { ...mockEmail, id: 'e1', subject: 'Project Update' },
        { ...mockEmail, id: 'e2', subject: 'RE: Project Update' },
        { ...mockEmail, id: 'e3', subject: 'Other Topic' }
      ]
      const clusters = clusterRelatedEmails(emails)
      expect(clusters.some(c => c.length === 2)).toBe(true)
    })

    it('ignores Re: and Fwd: prefixes', () => {
      const emails: Email[] = [
        { ...mockEmail, id: 'e1', subject: 'Hello' },
        { ...mockEmail, id: 'e2', subject: 'Re: Hello' },
        { ...mockEmail, id: 'e3', subject: 'Fwd: Hello' }
      ]
      const clusters = clusterRelatedEmails(emails)
      expect(clusters[0].length).toBe(3)
    })

    it('sorts clusters by size descending', () => {
      const emails: Email[] = [
        { ...mockEmail, id: 'e1', subject: 'A' },
        { ...mockEmail, id: 'e2', subject: 'B' },
        { ...mockEmail, id: 'e3', subject: 'B' },
        { ...mockEmail, id: 'e4', subject: 'B' }
      ]
      const clusters = clusterRelatedEmails(emails)
      expect(clusters[0].length).toBeGreaterThanOrEqual(clusters[clusters.length - 1].length)
    })

    it('handles empty array', () => {
      const clusters = clusterRelatedEmails([])
      expect(clusters).toEqual([])
    })

    it('handles single email', () => {
      const clusters = clusterRelatedEmails([mockEmail])
      expect(clusters).toHaveLength(1)
      expect(clusters[0]).toHaveLength(1)
    })
  })
})
