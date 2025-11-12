// Quick reply suggestions based on email content

import type { QuickReply } from '../types/extended'
import type { Email } from '../mockEmails'

/**
 * Generate quick reply suggestions based on email content
 */
export function generateQuickReplies(email: Email): QuickReply[] {
  const text = `${email.subject} ${email.body}`.toLowerCase()
  const replies: QuickReply[] = []

  // Positive responses
  if (text.includes('thank') || text.includes('appreciate')) {
    replies.push({
      id: 'qr1',
      text: "You're welcome! Happy to help.",
      category: 'positive',
      confidence: 0.9
    })
  }

  if (text.includes('great') || text.includes('excellent') || text.includes('good job')) {
    replies.push({
      id: 'qr2',
      text: 'Thank you! I appreciate your feedback.',
      category: 'positive',
      confidence: 0.85
    })
  }

  // Questions
  if (text.includes('?') || text.includes('when') || text.includes('how') || text.includes('what')) {
    replies.push({
      id: 'qr3',
      text: "Thanks for reaching out! I'll get back to you with more details soon.",
      category: 'question',
      confidence: 0.8
    })

    replies.push({
      id: 'qr4',
      text: "Good question! Let me check and get back to you.",
      category: 'question',
      confidence: 0.75
    })
  }

  // Meeting/Schedule related
  if (text.includes('meeting') || text.includes('schedule') || text.includes('calendar')) {
    replies.push({
      id: 'qr5',
      text: "That works for me! I've added it to my calendar.",
      category: 'neutral',
      confidence: 0.7
    })

    replies.push({
      id: 'qr6',
      text: "Let me check my schedule and get back to you shortly.",
      category: 'neutral',
      confidence: 0.75
    })
  }

  // Busy/Decline
  if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
    replies.push({
      id: 'qr7',
      text: "I'm currently tied up but will prioritize this. Expect a response by end of day.",
      category: 'busy',
      confidence: 0.65
    })
  }

  // Generic responses (always available)
  replies.push({
    id: 'qr8',
    text: 'Thanks for letting me know!',
    category: 'positive',
    confidence: 0.6
  })

  replies.push({
    id: 'qr9',
    text: "I'll look into this and get back to you.",
    category: 'neutral',
    confidence: 0.6
  })

  // Sort by confidence and return top 5
  return replies
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 5)
}

/**
 * Customize quick reply with recipient name
 */
export function personalizeReply(reply: QuickReply, recipientName: string): string {
  // Simple personalization - add recipient name if not already present
  if (reply.text.includes('Hi') || reply.text.includes('Hello')) {
    return reply.text
  }

  return `Hi ${recipientName},\n\n${reply.text}`
}

/**
 * Get category color for quick reply
 */
export function getReplyColor(category: QuickReply['category']): string {
  switch (category) {
    case 'positive':
      return '#10b981' // green
    case 'neutral':
      return '#6b7280' // gray
    case 'question':
      return '#3b82f6' // blue
    case 'busy':
      return '#f59e0b' // orange
    default:
      return '#6b7280'
  }
}

/**
 * Generate reply based on email priority
 */
export function generatePriorityReply(priority: 'low' | 'normal' | 'high' | 'urgent'): string {
  switch (priority) {
    case 'urgent':
      return "I understand this is urgent. I'm prioritizing this and will respond within the hour."
    case 'high':
      return "Thank you for flagging this as high priority. I'll address this today."
    case 'normal':
      return "Thanks for your email. I'll get back to you soon."
    case 'low':
      return "Thanks for reaching out. I'll review this when I have a moment."
    default:
      return "Thanks for your email."
  }
}
