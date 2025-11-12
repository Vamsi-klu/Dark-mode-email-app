// Bulk actions for email management

import type { Email } from '../mockEmails'
import type { Mailbox } from '../types/mail'
import type { BulkAction, Label, Priority } from '../types/extended'
import { addLabelToEmail, removeLabelFromEmail } from './labels'
import { markAsRead, markAsUnread, markAsStarred, markAsUnstarred, setPriority } from './emailState'

/**
 * Execute bulk action on emails
 */
export function executeBulkAction(
  emails: Email[],
  action: BulkAction,
  allEmails: Email[]
): Email[] {
  const targetIds = new Set(action.emailIds)

  return allEmails.map(email => {
    if (!targetIds.has(email.id)) return email

    switch (action.type) {
      case 'markRead':
        return markAsRead(email)

      case 'markUnread':
        return markAsUnread(email)

      case 'star':
        return markAsStarred(email)

      case 'unstar':
        return markAsUnstarred(email)

      case 'delete':
        return { ...email, mailbox: 'trash' as Mailbox }

      case 'archive':
        return { ...email, mailbox: 'archive' as Mailbox }

      case 'move':
        return action.value ? { ...email, mailbox: action.value as Mailbox } : email

      case 'label':
        if (!action.value) return email
        try {
          const label: Label = JSON.parse(action.value)
          return addLabelToEmail(email, label)
        } catch {
          return email
        }

      default:
        return email
    }
  })
}

/**
 * Create bulk action object
 */
export function createBulkAction(
  type: BulkAction['type'],
  emailIds: string[],
  value?: string
): BulkAction {
  return { type, emailIds, value }
}

/**
 * Validate bulk action
 */
export function validateBulkAction(action: BulkAction): { valid: boolean; error?: string } {
  if (!action.emailIds || action.emailIds.length === 0) {
    return { valid: false, error: 'No emails selected' }
  }

  if (action.type === 'move' && !action.value) {
    return { valid: false, error: 'Destination mailbox required for move action' }
  }

  if (action.type === 'label' && !action.value) {
    return { valid: false, error: 'Label required for label action' }
  }

  return { valid: true }
}

/**
 * Get action description for UI
 */
export function getBulkActionDescription(action: BulkAction): string {
  const count = action.emailIds.length
  const plural = count === 1 ? 'email' : 'emails'

  switch (action.type) {
    case 'markRead':
      return `Mark ${count} ${plural} as read`
    case 'markUnread':
      return `Mark ${count} ${plural} as unread`
    case 'star':
      return `Star ${count} ${plural}`
    case 'unstar':
      return `Unstar ${count} ${plural}`
    case 'delete':
      return `Delete ${count} ${plural}`
    case 'archive':
      return `Archive ${count} ${plural}`
    case 'move':
      return `Move ${count} ${plural} to ${action.value || 'folder'}`
    case 'label':
      return `Label ${count} ${plural}`
    default:
      return `Action on ${count} ${plural}`
  }
}

/**
 * Estimate time for bulk action (in ms)
 */
export function estimateBulkActionTime(action: BulkAction): number {
  const baseTime = 50 // ms per email
  return action.emailIds.length * baseTime
}

/**
 * Check if action can be undone
 */
export function isUndoable(actionType: BulkAction['type']): boolean {
  // Delete is not easily undoable
  return actionType !== 'delete'
}

/**
 * Create undo action
 */
export function createUndoAction(
  originalAction: BulkAction,
  originalEmails: Email[]
): BulkAction | null {
  switch (originalAction.type) {
    case 'markRead':
      return createBulkAction('markUnread', originalAction.emailIds)
    case 'markUnread':
      return createBulkAction('markRead', originalAction.emailIds)
    case 'star':
      return createBulkAction('unstar', originalAction.emailIds)
    case 'unstar':
      return createBulkAction('star', originalAction.emailIds)
    case 'move':
      // Restore to original mailboxes (requires tracking)
      return null
    default:
      return null
  }
}

/**
 * Get affected emails from action
 */
export function getAffectedEmails(emails: Email[], action: BulkAction): Email[] {
  const targetIds = new Set(action.emailIds)
  return emails.filter(email => targetIds.has(email.id))
}

/**
 * Split bulk action into batches
 */
export function splitIntoBatches(action: BulkAction, batchSize: number = 100): BulkAction[] {
  const batches: BulkAction[] = []

  for (let i = 0; i < action.emailIds.length; i += batchSize) {
    const batchIds = action.emailIds.slice(i, i + batchSize)
    batches.push(createBulkAction(action.type, batchIds, action.value))
  }

  return batches
}

/**
 * Merge multiple selections
 */
export function mergeSelections(selections: string[][]): string[] {
  const merged = new Set<string>()
  selections.forEach(selection => {
    selection.forEach(id => merged.add(id))
  })
  return Array.from(merged)
}

/**
 * Toggle selection
 */
export function toggleSelection(currentSelection: string[], emailId: string): string[] {
  const index = currentSelection.indexOf(emailId)
  if (index === -1) {
    return [...currentSelection, emailId]
  }
  return currentSelection.filter(id => id !== emailId)
}

/**
 * Select all emails
 */
export function selectAll(emails: Email[]): string[] {
  return emails.map(e => e.id)
}

/**
 * Deselect all
 */
export function deselectAll(): string[] {
  return []
}

/**
 * Check if email is selected
 */
export function isSelected(emailId: string, selection: string[]): boolean {
  return selection.includes(emailId)
}

/**
 * Get selection count
 */
export function getSelectionCount(selection: string[]): number {
  return selection.length
}
