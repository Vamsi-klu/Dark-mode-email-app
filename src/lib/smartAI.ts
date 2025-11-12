// Smart AI Features - 20+ AI-powered productivity features

import type { Email } from '../mockEmails'
import type { QuickReply, SentimentData } from '../types/extended'
import { analyzeSentiment } from './analytics'
import { generateQuickReplies } from './quickReplies'

/**
 * Smart Reply - Generate AI-powered contextual replies
 */
export function generateSmartReplies(email: Email, count: number = 3): QuickReply[] {
  const replies = generateQuickReplies(email)
  return replies.slice(0, count)
}

/**
 * Email Summarization - Create concise summary of email
 */
export function summarizeEmail(email: Email): string {
  const sentences = email.body.split(/[.!?]+/).filter(s => s.trim().length > 10)

  if (sentences.length <= 2) {
    return email.snippet
  }

  // Take first and most important sentences
  const summary = sentences.slice(0, 2).join('. ').trim()
  return summary.length > 150 ? email.snippet : summary + '.'
}

/**
 * Extract Action Items - Find tasks/todos in email
 */
export function extractActionItems(email: Email): string[] {
  const actionWords = ['todo', 'task', 'action', 'need to', 'should', 'must', 'please', 'can you', 'could you']
  const lines = email.body.split('\n')
  const items: string[] = []

  lines.forEach(line => {
    const lower = line.toLowerCase()
    if (actionWords.some(word => lower.includes(word))) {
      const cleaned = line.trim()
      if (cleaned.length > 10 && cleaned.length < 200) {
        items.push(cleaned)
      }
    }
  })

  return items.slice(0, 5) // Max 5 action items
}

/**
 * Detect if email requires response
 */
export function requiresResponse(email: Email): boolean {
  const responseIndicators = ['?', 'please reply', 'let me know', 'get back', 'respond', 'rsvp', 'confirm']
  const text = `${email.subject} ${email.body}`.toLowerCase()

  return responseIndicators.some(indicator => text.includes(indicator))
}

/**
 * Predict email importance (0-1 score)
 */
export function predictImportance(email: Email): number {
  let score = 0.5 // Base score

  // From known contacts
  if (email.sender.email.includes('@company.com')) score += 0.2

  // Has attachments
  if (email.hasAttachment) score += 0.1

  // Marked as priority
  if (email.priority === 'urgent') score += 0.3
  if (email.priority === 'high') score += 0.2

  // In subject: urgent, important, action required
  const urgentWords = ['urgent', 'important', 'asap', 'critical', 'action required']
  if (urgentWords.some(word => email.subject.toLowerCase().includes(word))) {
    score += 0.2
  }

  // CC'd to many people
  if (email.cc && email.cc.length > 3) score -= 0.1

  return Math.min(1, Math.max(0, score))
}

/**
 * Smart Categorization - Auto-categorize emails
 */
export function categorizeEmail(email: Email): string {
  const subject = email.subject.toLowerCase()
  const body = email.body.toLowerCase()
  const text = `${subject} ${body}`

  if (text.includes('invoice') || text.includes('payment') || text.includes('receipt')) {
    return 'Finance'
  }

  if (text.includes('meeting') || text.includes('calendar') || text.includes('schedule')) {
    return 'Meetings'
  }

  if (text.includes('newsletter') || text.includes('unsubscribe')) {
    return 'Newsletters'
  }

  if (text.includes('social') || text.includes('notification') || text.includes('mentioned you')) {
    return 'Social'
  }

  if (text.includes('security') || text.includes('password') || text.includes('verify')) {
    return 'Security'
  }

  if (email.sender.email.includes('noreply') || email.sender.email.includes('no-reply')) {
    return 'Automated'
  }

  return 'General'
}

/**
 * Suggest follow-up time (in hours)
 */
export function suggestFollowUpTime(email: Email): number {
  const importance = predictImportance(email)

  if (importance > 0.8) return 24 // 1 day for very important
  if (importance > 0.6) return 48 // 2 days for important
  if (importance > 0.4) return 72 // 3 days for normal

  return 168 // 1 week for low priority
}

/**
 * Detect if email is a newsletter
 */
export function isNewsletter(email: Email): boolean {
  const indicators = [
    'unsubscribe',
    'newsletter',
    'weekly digest',
    'mailing list',
    'view in browser',
    'update preferences'
  ]

  const text = `${email.subject} ${email.body}`.toLowerCase()
  return indicators.filter(ind => text.includes(ind)).length >= 2
}

/**
 * Detect if email is automated
 */
export function isAutomated(email: Email): boolean {
  const autoSenders = ['noreply', 'no-reply', 'donotreply', 'automated', 'notifications']
  return autoSenders.some(sender => email.sender.email.toLowerCase().includes(sender))
}

/**
 * Smart priority inbox - Sort emails by predicted importance
 */
export function createPriorityInbox(emails: Email[]): {
  important: Email[]
  normal: Email[]
  low: Email[]
} {
  const scored = emails.map(email => ({
    email,
    score: predictImportance(email)
  }))

  return {
    important: scored.filter(s => s.score >= 0.7).map(s => s.email),
    normal: scored.filter(s => s.score >= 0.4 && s.score < 0.7).map(s => s.email),
    low: scored.filter(s => s.score < 0.4).map(s => s.email)
  }
}

/**
 * Suggest email templates based on context
 */
export function suggestTemplates(email: Email): string[] {
  const suggestions: string[] = []
  const subject = email.subject.toLowerCase()

  if (subject.includes('meeting')) {
    suggestions.push('Meeting Confirmation', 'Meeting Decline', 'Reschedule Meeting')
  }

  if (subject.includes('invoice') || subject.includes('payment')) {
    suggestions.push('Payment Confirmation', 'Invoice Query')
  }

  if (requiresResponse(email)) {
    suggestions.push('Quick Acknowledgment', 'Detailed Response')
  }

  return suggestions
}

/**
 * Extract email addresses from body
 */
export function extractEmailAddresses(text: string): string[] {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  const matches = text.match(emailRegex)
  return matches ? Array.from(new Set(matches)) : []
}

/**
 * Extract phone numbers from body
 */
export function extractPhoneNumbers(text: string): string[] {
  const phoneRegex = /(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g
  const matches = text.match(phoneRegex)
  return matches ? Array.from(new Set(matches)) : []
}

/**
 * Extract dates from email
 */
export function extractDates(text: string): string[] {
  const dates: string[] = []

  // Match common date patterns
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/g, // MM/DD/YYYY
    /\d{1,2}-\d{1,2}-\d{2,4}/g, // MM-DD-YYYY
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}/gi // Month DD, YYYY
  ]

  datePatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) dates.push(...matches)
  })

  return Array.from(new Set(dates))
}

/**
 * Detect email language
 */
export function detectLanguage(text: string): string {
  // Simple heuristic - can be enhanced
  const commonWords: Record<string, string[]> = {
    english: ['the', 'is', 'and', 'to', 'of', 'in', 'a'],
    spanish: ['el', 'la', 'de', 'que', 'y', 'a', 'en'],
    french: ['le', 'de', 'un', 'et', 'être', 'à', 'il'],
    german: ['der', 'die', 'und', 'in', 'den', 'von', 'zu']
  }

  const words = text.toLowerCase().split(/\s+/).slice(0, 100)
  const scores: Record<string, number> = {}

  Object.entries(commonWords).forEach(([lang, keywords]) => {
    scores[lang] = words.filter(w => keywords.includes(w)).length
  })

  const detected = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return detected && detected[1] > 2 ? detected[0] : 'english'
}

/**
 * Smart compose suggestions
 */
export function getComposeSuggestions(partialText: string): string[] {
  const suggestions: string[] = []
  const text = partialText.toLowerCase()

  if (text.includes('thank')) {
    suggestions.push('Thank you for your email.', 'Thanks for reaching out.')
  }

  if (text.includes('meet')) {
    suggestions.push('Let me know your availability.', 'Would Tuesday at 2pm work?')
  }

  if (text.includes('attach')) {
    suggestions.push('Please find the attachment.', 'I\'ve attached the document.')
  }

  return suggestions
}

/**
 * Predict best time to send email
 */
export function predictBestSendTime(recipientEmail: string): Date {
  const now = new Date()
  const hour = now.getHours()

  // Don't send late night or very early morning
  if (hour >= 22 || hour < 7) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow
  }

  // Otherwise send within next hour
  const sendTime = new Date(now)
  sendTime.setMinutes(sendTime.getMinutes() + 30)
  return sendTime
}

/**
 * Email thread clustering - Group related emails
 */
export function clusterRelatedEmails(emails: Email[]): Email[][] {
  const clusters: Email[][] = []
  const processed = new Set<string>()

  emails.forEach(email => {
    if (processed.has(email.id)) return

    const cluster: Email[] = [email]
    processed.add(email.id)

    // Find related by thread ID
    if (email.threadId) {
      emails.forEach(other => {
        if (!processed.has(other.id) && other.threadId === email.threadId) {
          cluster.push(other)
          processed.add(other.id)
        }
      })
    }

    // Find related by subject (similar subjects)
    const subjectBase = email.subject.replace(/^(re:|fwd:)\s*/i, '').toLowerCase()
    emails.forEach(other => {
      if (!processed.has(other.id)) {
        const otherSubject = other.subject.replace(/^(re:|fwd:)\s*/i, '').toLowerCase()
        if (subjectBase === otherSubject) {
          cluster.push(other)
          processed.add(other.id)
        }
      }
    })

    clusters.push(cluster)
  })

  return clusters.sort((a, b) => b.length - a.length)
}
