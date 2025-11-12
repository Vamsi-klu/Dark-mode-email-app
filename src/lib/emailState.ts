// Email state management (read/unread, priority, starred, etc.)

import type { Email } from '../mockEmails'
import type { Priority } from '../types/extended'

/**
 * Mark email as read
 */
export function markAsRead(email: Email): Email {
  return {
    ...email,
    unread: false,
    isRead: true
  }
}

/**
 * Mark email as unread
 */
export function markAsUnread(email: Email): Email {
  return {
    ...email,
    unread: true,
    isRead: false
  }
}

/**
 * Toggle read/unread status
 */
export function toggleReadStatus(email: Email): Email {
  return email.unread ? markAsRead(email) : markAsUnread(email)
}

/**
 * Mark email as starred
 */
export function markAsStarred(email: Email): Email {
  return {
    ...email,
    starred: true
  }
}

/**
 * Mark email as unstarred
 */
export function markAsUnstarred(email: Email): Email {
  return {
    ...email,
    starred: false
  }
}

/**
 * Toggle starred status
 */
export function toggleStarred(email: Email): Email {
  return {
    ...email,
    starred: !email.starred
  }
}

/**
 * Set email priority
 */
export function setPriority(email: Email, priority: Priority): Email {
  return {
    ...email,
    priority
  }
}

/**
 * Clear email priority (set to normal)
 */
export function clearPriority(email: Email): Email {
  return {
    ...email,
    priority: 'normal'
  }
}

/**
 * Check if email is high priority
 */
export function isHighPriority(email: Email): boolean {
  return email.priority === 'high' || email.priority === 'urgent'
}

/**
 * Check if email is low priority
 */
export function isLowPriority(email: Email): boolean {
  return email.priority === 'low'
}

/**
 * Get priority order value (for sorting)
 */
export function getPriorityOrder(priority: Priority = 'normal'): number {
  const order = { urgent: 0, high: 1, normal: 2, low: 3 }
  return order[priority]
}

/**
 * Compare priorities
 */
export function comparePriorities(p1: Priority, p2: Priority): number {
  return getPriorityOrder(p1) - getPriorityOrder(p2)
}

/**
 * Bulk mark as read
 */
export function bulkMarkAsRead(emails: Email[]): Email[] {
  return emails.map(markAsRead)
}

/**
 * Bulk mark as unread
 */
export function bulkMarkAsUnread(emails: Email[]): Email[] {
  return emails.map(markAsUnread)
}

/**
 * Bulk star
 */
export function bulkStar(emails: Email[]): Email[] {
  return emails.map(markAsStarred)
}

/**
 * Bulk unstar
 */
export function bulkUnstar(emails: Email[]): Email[] {
  return emails.map(markAsUnstarred)
}

/**
 * Bulk set priority
 */
export function bulkSetPriority(emails: Email[], priority: Priority): Email[] {
  return emails.map(email => setPriority(email, priority))
}

/**
 * Get unread count
 */
export function getUnreadCount(emails: Email[]): number {
  return emails.filter(e => e.unread).length
}

/**
 * Get starred count
 */
export function getStarredCount(emails: Email[]): number {
  return emails.filter(e => e.starred).length
}

/**
 * Get count by priority
 */
export function getCountByPriority(emails: Email[], priority: Priority): number {
  return emails.filter(e => e.priority === priority).length
}

/**
 * Filter unread emails
 */
export function filterUnread(emails: Email[]): Email[] {
  return emails.filter(e => e.unread)
}

/**
 * Filter read emails
 */
export function filterRead(emails: Email[]): Email[] {
  return emails.filter(e => !e.unread)
}

/**
 * Filter starred emails
 */
export function filterStarred(emails: Email[]): Email[] {
  return emails.filter(e => e.starred)
}

/**
 * Filter by priority
 */
export function filterByPriority(emails: Email[], priority: Priority): Email[] {
  return emails.filter(e => e.priority === priority)
}
