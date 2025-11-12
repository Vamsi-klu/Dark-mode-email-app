// Notification system for user feedback

import type { Notification, NotificationType } from '../types/extended'

/**
 * Create a notification
 */
export function createNotification(
  type: NotificationType,
  message: string,
  duration?: number,
  action?: { label: string; onClick: () => void }
): Notification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    duration,
    action
  }
}

/**
 * Create success notification
 */
export function notifySuccess(message: string, duration: number = 3000): Notification {
  return createNotification('success', message, duration)
}

/**
 * Create error notification
 */
export function notifyError(message: string, duration: number = 5000): Notification {
  return createNotification('error', message, duration)
}

/**
 * Create warning notification
 */
export function notifyWarning(message: string, duration: number = 4000): Notification {
  return createNotification('warning', message, duration)
}

/**
 * Create info notification
 */
export function notifyInfo(message: string, duration: number = 3000): Notification {
  return createNotification('info', message, duration)
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✗'
    case 'warning':
      return '⚠'
    case 'info':
      return 'ℹ'
    default:
      return 'ℹ'
  }
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case 'success':
      return '#10b981' // green
    case 'error':
      return '#ef4444' // red
    case 'warning':
      return '#f59e0b' // orange
    case 'info':
      return '#3b82f6' // blue
    default:
      return '#6b7280' // gray
  }
}

/**
 * Check if notification should auto-dismiss
 */
export function shouldAutoDismiss(notification: Notification): boolean {
  return notification.duration !== undefined && notification.duration > 0
}

/**
 * Create undo notification with action
 */
export function notifyWithUndo(
  message: string,
  onUndo: () => void,
  duration: number = 5000
): Notification {
  return createNotification('info', message, duration, {
    label: 'Undo',
    onClick: onUndo
  })
}
