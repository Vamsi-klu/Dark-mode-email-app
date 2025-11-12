// Label management utilities for email categorization

import type { Label } from '../types/extended'
import type { Email } from '../mockEmails'

/**
 * Get all unique labels from a list of emails
 */
export function extractLabels(emails: Email[]): Label[] {
  const labelMap = new Map<string, Label>()

  emails.forEach(email => {
    if (!email.labels) return
    email.labels.forEach(label => {
      if (!labelMap.has(label.id)) {
        labelMap.set(label.id, { ...label, count: 0 })
      }
      const existing = labelMap.get(label.id)!
      existing.count = (existing.count || 0) + 1
    })
  })

  return Array.from(labelMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Add a label to an email
 */
export function addLabelToEmail(email: Email, label: Label): Email {
  const labels = email.labels || []
  // Don't add duplicate
  if (labels.some(l => l.id === label.id)) {
    return email
  }
  return {
    ...email,
    labels: [...labels, label]
  }
}

/**
 * Remove a label from an email
 */
export function removeLabelFromEmail(email: Email, labelId: string): Email {
  if (!email.labels) return email
  return {
    ...email,
    labels: email.labels.filter(l => l.id !== labelId)
  }
}

/**
 * Filter emails by label
 */
export function filterByLabel(emails: Email[], labelId: string): Email[] {
  return emails.filter(email =>
    email.labels?.some(l => l.id === labelId)
  )
}

/**
 * Create a new label with auto-generated ID
 */
export function createLabel(name: string, color: string): Label {
  return {
    id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    color,
    count: 0
  }
}

/**
 * Validate label name (3-30 chars, no special chars except space, dash, underscore)
 */
export function validateLabelName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: 'Label name cannot be empty' }
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Label name must be at least 3 characters' }
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Label name must be less than 30 characters' }
  }

  if (!/^[a-zA-Z0-9 _-]+$/.test(trimmed)) {
    return { valid: false, error: 'Label name can only contain letters, numbers, spaces, dashes, and underscores' }
  }

  return { valid: true }
}

/**
 * Get label statistics
 */
export function getLabelStats(emails: Email[]): Map<string, { label: Label; emailCount: number; unreadCount: number }> {
  const stats = new Map<string, { label: Label; emailCount: number; unreadCount: number }>()

  emails.forEach(email => {
    if (!email.labels) return
    email.labels.forEach(label => {
      if (!stats.has(label.id)) {
        stats.set(label.id, {
          label,
          emailCount: 0,
          unreadCount: 0
        })
      }
      const stat = stats.get(label.id)!
      stat.emailCount++
      if (email.unread) {
        stat.unreadCount++
      }
    })
  })

  return stats
}
