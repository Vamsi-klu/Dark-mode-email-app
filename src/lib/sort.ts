// Email sorting utilities

import type { Email } from '../mockEmails'
import type { SortOption } from '../types/extended'

/**
 * Sort emails by specified field and order
 */
export function sortEmails(emails: Email[], sort: SortOption): Email[] {
  return [...emails].sort((a, b) => {
    let comparison = 0

    switch (sort.field) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break

      case 'sender':
        comparison = a.sender.name.localeCompare(b.sender.name)
        break

      case 'subject':
        comparison = a.subject.localeCompare(b.subject)
        break

      case 'size':
        const sizeA = a.size || 0
        const sizeB = b.size || 0
        comparison = sizeA - sizeB
        break

      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
        const prioA = priorityOrder[a.priority || 'normal']
        const prioB = priorityOrder[b.priority || 'normal']
        comparison = prioA - prioB
        break
    }

    return sort.order === 'asc' ? comparison : -comparison
  })
}

/**
 * Get default sort option (newest first)
 */
export function getDefaultSort(): SortOption {
  return { field: 'date', order: 'desc' }
}

/**
 * Create sort option from string (e.g., "date-desc")
 */
export function parseSortString(sortStr: string): SortOption | null {
  const parts = sortStr.split('-')
  if (parts.length !== 2) return null

  const field = parts[0] as SortOption['field']
  const order = parts[1] as SortOption['order']

  const validFields: SortOption['field'][] = ['date', 'sender', 'subject', 'size', 'priority']
  const validOrders: SortOption['order'][] = ['asc', 'desc']

  if (!validFields.includes(field) || !validOrders.includes(order)) {
    return null
  }

  return { field, order }
}

/**
 * Convert sort option to string (e.g., "date-desc")
 */
export function sortToString(sort: SortOption): string {
  return `${sort.field}-${sort.order}`
}

/**
 * Toggle sort order (asc <-> desc)
 */
export function toggleSortOrder(sort: SortOption): SortOption {
  return {
    ...sort,
    order: sort.order === 'asc' ? 'desc' : 'asc'
  }
}

/**
 * Multi-level sort (sort by multiple fields)
 */
export function multiSort(emails: Email[], sorts: SortOption[]): Email[] {
  if (sorts.length === 0) return emails

  return [...emails].sort((a, b) => {
    for (const sort of sorts) {
      let comparison = 0

      switch (sort.field) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'sender':
          comparison = a.sender.name.localeCompare(b.sender.name)
          break
        case 'subject':
          comparison = a.subject.localeCompare(b.subject)
          break
        case 'size':
          comparison = (a.size || 0) - (b.size || 0)
          break
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
          const prioA = priorityOrder[a.priority || 'normal']
          const prioB = priorityOrder[b.priority || 'normal']
          comparison = prioA - prioB
          break
      }

      const result = sort.order === 'asc' ? comparison : -comparison

      if (result !== 0) {
        return result
      }
      // If equal, continue to next sort criteria
    }

    return 0
  })
}
