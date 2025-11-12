// Advanced search and filtering utilities

import type { Email } from '../mockEmails'
import type { SearchFilter } from '../types/extended'

/**
 * Apply advanced search filter to emails
 */
export function applyAdvancedFilter(emails: Email[], filter: SearchFilter): Email[] {
  return emails.filter(email => {
    // Basic query match (subject, sender, snippet)
    if (filter.query && filter.query.trim()) {
      const q = filter.query.toLowerCase()
      const matches =
        email.subject.toLowerCase().includes(q) ||
        email.sender.name.toLowerCase().includes(q) ||
        email.sender.email.toLowerCase().includes(q) ||
        email.snippet.toLowerCase().includes(q) ||
        email.body.toLowerCase().includes(q)

      if (!matches) return false
    }

    // From filter
    if (filter.from && filter.from.trim()) {
      const from = filter.from.toLowerCase()
      const matches =
        email.sender.name.toLowerCase().includes(from) ||
        email.sender.email.toLowerCase().includes(from)

      if (!matches) return false
    }

    // To filter
    if (filter.to && filter.to.trim()) {
      const to = filter.to.toLowerCase()
      const matches = email.recipients.some(r => r.toLowerCase().includes(to)) ||
                     (email.cc?.some(c => c.toLowerCase().includes(to))) ||
                     (email.bcc?.some(b => b.toLowerCase().includes(to)))

      if (!matches) return false
    }

    // Subject filter
    if (filter.subject && filter.subject.trim()) {
      if (!email.subject.toLowerCase().includes(filter.subject.toLowerCase())) {
        return false
      }
    }

    // Has attachment filter
    if (filter.hasAttachment !== undefined) {
      if (filter.hasAttachment && !email.hasAttachment) return false
      if (!filter.hasAttachment && email.hasAttachment) return false
    }

    // Unread filter
    if (filter.isUnread !== undefined) {
      if (filter.isUnread !== email.unread) return false
    }

    // Starred filter
    if (filter.isStarred !== undefined) {
      if (filter.isStarred !== (email.starred || false)) return false
    }

    // Date range filter
    if (filter.dateFrom) {
      const emailDate = new Date(email.date)
      const fromDate = new Date(filter.dateFrom)
      if (emailDate < fromDate) return false
    }

    if (filter.dateTo) {
      const emailDate = new Date(email.date)
      const toDate = new Date(filter.dateTo)
      if (emailDate > toDate) return false
    }

    // Labels filter
    if (filter.labels && filter.labels.length > 0) {
      if (!email.labels || email.labels.length === 0) return false

      const hasMatchingLabel = filter.labels.some(filterLabelId =>
        email.labels!.some(emailLabel => emailLabel.id === filterLabelId)
      )

      if (!hasMatchingLabel) return false
    }

    // Priority filter
    if (filter.priority) {
      if (email.priority !== filter.priority) return false
    }

    return true
  })
}

/**
 * Create empty search filter
 */
export function createEmptyFilter(): SearchFilter {
  return {
    query: ''
  }
}

/**
 * Check if filter is empty (no criteria set)
 */
export function isFilterEmpty(filter: SearchFilter): boolean {
  return !filter.query.trim() &&
         !filter.from &&
         !filter.to &&
         !filter.subject &&
         filter.hasAttachment === undefined &&
         filter.isUnread === undefined &&
         filter.isStarred === undefined &&
         !filter.dateFrom &&
         !filter.dateTo &&
         (!filter.labels || filter.labels.length === 0) &&
         !filter.priority
}

/**
 * Count active filter criteria
 */
export function countActiveFilters(filter: SearchFilter): number {
  let count = 0

  if (filter.query && filter.query.trim()) count++
  if (filter.from && filter.from.trim()) count++
  if (filter.to && filter.to.trim()) count++
  if (filter.subject && filter.subject.trim()) count++
  if (filter.hasAttachment !== undefined) count++
  if (filter.isUnread !== undefined) count++
  if (filter.isStarred !== undefined) count++
  if (filter.dateFrom) count++
  if (filter.dateTo) count++
  if (filter.labels && filter.labels.length > 0) count++
  if (filter.priority) count++

  return count
}

/**
 * Merge two filters (combine criteria)
 */
export function mergeFilters(filter1: SearchFilter, filter2: SearchFilter): SearchFilter {
  return {
    query: filter2.query || filter1.query,
    from: filter2.from || filter1.from,
    to: filter2.to || filter1.to,
    subject: filter2.subject || filter1.subject,
    hasAttachment: filter2.hasAttachment !== undefined ? filter2.hasAttachment : filter1.hasAttachment,
    isUnread: filter2.isUnread !== undefined ? filter2.isUnread : filter1.isUnread,
    isStarred: filter2.isStarred !== undefined ? filter2.isStarred : filter1.isStarred,
    dateFrom: filter2.dateFrom || filter1.dateFrom,
    dateTo: filter2.dateTo || filter1.dateTo,
    labels: filter2.labels || filter1.labels,
    priority: filter2.priority || filter1.priority
  }
}

/**
 * Clear specific filter field
 */
export function clearFilterField(filter: SearchFilter, field: keyof SearchFilter): SearchFilter {
  const newFilter = { ...filter }

  if (field === 'hasAttachment' || field === 'isUnread' || field === 'isStarred') {
    newFilter[field] = undefined
  } else if (field === 'labels') {
    newFilter.labels = []
  } else {
    newFilter[field] = undefined as any
  }

  return newFilter
}

/**
 * Validate date range in filter
 */
export function validateDateRange(filter: SearchFilter): { valid: boolean; error?: string } {
  if (!filter.dateFrom || !filter.dateTo) {
    return { valid: true } // No range to validate
  }

  const fromDate = new Date(filter.dateFrom)
  const toDate = new Date(filter.dateTo)

  if (isNaN(fromDate.getTime())) {
    return { valid: false, error: 'Invalid from date' }
  }

  if (isNaN(toDate.getTime())) {
    return { valid: false, error: 'Invalid to date' }
  }

  if (fromDate > toDate) {
    return { valid: false, error: 'From date must be before to date' }
  }

  return { valid: true }
}

/**
 * Get filter summary as human-readable string
 */
export function getFilterSummary(filter: SearchFilter): string {
  const parts: string[] = []

  if (filter.query) parts.push(`Search: "${filter.query}"`)
  if (filter.from) parts.push(`From: ${filter.from}`)
  if (filter.to) parts.push(`To: ${filter.to}`)
  if (filter.subject) parts.push(`Subject: ${filter.subject}`)
  if (filter.hasAttachment !== undefined) parts.push(filter.hasAttachment ? 'Has attachment' : 'No attachment')
  if (filter.isUnread !== undefined) parts.push(filter.isUnread ? 'Unread' : 'Read')
  if (filter.isStarred !== undefined) parts.push(filter.isStarred ? 'Starred' : 'Not starred')
  if (filter.dateFrom) parts.push(`From: ${filter.dateFrom}`)
  if (filter.dateTo) parts.push(`To: ${filter.dateTo}`)
  if (filter.labels && filter.labels.length > 0) parts.push(`Labels: ${filter.labels.join(', ')}`)
  if (filter.priority) parts.push(`Priority: ${filter.priority}`)

  return parts.join(' • ')
}
