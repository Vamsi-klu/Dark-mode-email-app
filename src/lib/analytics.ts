// Enhanced AI analytics for email insights

import type { Email } from '../mockEmails'
import type { AIAnalytics, SentimentData } from '../types/extended'

/**
 * Analyze sentiment of text
 */
export function analyzeSentiment(text: string): SentimentData {
  const positive = ['great', 'good', 'excellent', 'happy', 'love', 'awesome', 'perfect', 'thanks', 'wonderful']
  const negative = ['bad', 'issue', 'problem', 'error', 'fail', 'wrong', 'terrible', 'hate', 'awful']

  const tokens = text.toLowerCase().split(/\s+/)
  const posCount = tokens.filter(t => positive.some(p => t.includes(p))).length
  const negCount = tokens.filter(t => negative.some(n => t.includes(n))).length

  const total = posCount + negCount
  const score = total === 0 ? 0 : (posCount - negCount) / total

  let label: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral'
  if (score > 0.3) label = 'positive'
  else if (score < -0.3) label = 'negative'
  else if (posCount > 0 && negCount > 0) label = 'mixed'

  const keywords = tokens
    .filter(t => t.length >= 4)
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, weight: count / tokens.length }))

  return {
    score: Math.max(-1, Math.min(1, score)),
    label,
    confidence: Math.min(1, total / 10),
    keywords: topKeywords
  }
}

/**
 * Generate comprehensive email analytics
 */
export function generateAnalytics(emails: Email[]): AIAnalytics {
  const unreadCount = emails.filter(e => e.unread).length

  // Calculate average response time (mock data)
  const averageResponseTime = 2.5

  // Top senders
  const senderCounts = new Map<string, number>()
  emails.forEach(email => {
    const sender = email.sender.email
    senderCounts.set(sender, (senderCounts.get(sender) || 0) + 1)
  })

  const topSenders = Array.from(senderCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([email, count]) => ({ email, count }))

  // Sentiment trend (last 30 days)
  const now = new Date()
  const sentimentTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (29 - i))

    const dayEmails = emails.filter(e => {
      const emailDate = new Date(e.date)
      return emailDate.toDateString() === date.toDateString()
    })

    const avgSentiment = dayEmails.length > 0
      ? dayEmails.reduce((sum, e) => sum + analyzeSentiment(e.body).score, 0) / dayEmails.length
      : 0

    return {
      date: date.toISOString().split('T')[0],
      score: avgSentiment
    }
  })

  // Busy hours (0-23)
  const hourCounts = new Array(24).fill(0)
  emails.forEach(email => {
    const hour = new Date(email.date).getHours()
    hourCounts[hour]++
  })

  const busyHours = hourCounts.map((count, hour) => ({ hour, count }))

  // Label distribution
  const labelCounts = new Map<string, number>()
  emails.forEach(email => {
    email.labels?.forEach(label => {
      labelCounts.set(label.name, (labelCounts.get(label.name) || 0) + 1)
    })
  })

  const labelDistribution = Array.from(labelCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalEmails: emails.length,
    unreadCount,
    averageResponseTime,
    topSenders,
    sentimentTrend,
    busyHours,
    labelDistribution
  }
}

/**
 * Get email productivity score (0-100)
 */
export function getProductivityScore(emails: Email[]): number {
  const total = emails.length
  if (total === 0) return 0

  const read = emails.filter(e => !e.unread).length
  const responded = emails.filter(e => e.mailbox === 'sent').length

  const readRate = read / total
  const responseRate = responded / total

  return Math.round((readRate * 0.4 + responseRate * 0.6) * 100)
}

/**
 * Detect spam indicators in email
 */
export function detectSpam(email: Email): { isSpam: boolean; confidence: number; reasons: string[] } {
  const reasons: string[] = []
  let score = 0

  // Check for spam keywords
  const spamWords = ['winner', 'congratulations', 'claim', 'urgent', 'act now', 'limited time']
  const text = `${email.subject} ${email.body}`.toLowerCase()

  spamWords.forEach(word => {
    if (text.includes(word)) {
      score += 0.2
      reasons.push(`Contains spam keyword: "${word}"`)
    }
  })

  // Check for excessive caps
  const capsRatio = (email.subject.match(/[A-Z]/g) || []).length / email.subject.length
  if (capsRatio > 0.5) {
    score += 0.3
    reasons.push('Excessive capital letters')
  }

  // Check for suspicious sender
  if (email.sender.email.includes('noreply') || email.sender.email.includes('no-reply')) {
    score += 0.1
    reasons.push('No-reply sender')
  }

  return {
    isSpam: score >= 0.5,
    confidence: Math.min(1, score),
    reasons
  }
}
