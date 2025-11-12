import { describe, it, expect, vi } from 'vitest'
import {
  createNotification,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  getNotificationIcon,
  getNotificationColor,
  shouldAutoDismiss,
  notifyWithUndo
} from 'src/lib/notifications'

describe('notifications utility', () => {
  describe('createNotification', () => {
    it('creates notification with required fields', () => {
      const notif = createNotification('success', 'Test message')
      expect(notif.type).toBe('success')
      expect(notif.message).toBe('Test message')
      expect(notif.id).toMatch(/^notif-/)
    })

    it('includes optional duration', () => {
      const notif = createNotification('info', 'Test', 5000)
      expect(notif.duration).toBe(5000)
    })

    it('includes optional action', () => {
      const onClick = vi.fn()
      const notif = createNotification('warning', 'Test', 3000, {
        label: 'Action',
        onClick
      })
      expect(notif.action).toBeDefined()
      expect(notif.action?.label).toBe('Action')
      expect(notif.action?.onClick).toBe(onClick)
    })

    it('generates unique IDs', () => {
      const notif1 = createNotification('success', 'Test 1')
      const notif2 = createNotification('success', 'Test 2')
      expect(notif1.id).not.toBe(notif2.id)
    })
  })

  describe('notifySuccess', () => {
    it('creates success notification with default duration', () => {
      const notif = notifySuccess('Success!')
      expect(notif.type).toBe('success')
      expect(notif.message).toBe('Success!')
      expect(notif.duration).toBe(3000)
    })

    it('accepts custom duration', () => {
      const notif = notifySuccess('Success!', 5000)
      expect(notif.duration).toBe(5000)
    })
  })

  describe('notifyError', () => {
    it('creates error notification with default duration', () => {
      const notif = notifyError('Error!')
      expect(notif.type).toBe('error')
      expect(notif.message).toBe('Error!')
      expect(notif.duration).toBe(5000)
    })

    it('accepts custom duration', () => {
      const notif = notifyError('Error!', 10000)
      expect(notif.duration).toBe(10000)
    })
  })

  describe('notifyWarning', () => {
    it('creates warning notification with default duration', () => {
      const notif = notifyWarning('Warning!')
      expect(notif.type).toBe('warning')
      expect(notif.message).toBe('Warning!')
      expect(notif.duration).toBe(4000)
    })

    it('accepts custom duration', () => {
      const notif = notifyWarning('Warning!', 6000)
      expect(notif.duration).toBe(6000)
    })
  })

  describe('notifyInfo', () => {
    it('creates info notification with default duration', () => {
      const notif = notifyInfo('Info!')
      expect(notif.type).toBe('info')
      expect(notif.message).toBe('Info!')
      expect(notif.duration).toBe(3000)
    })

    it('accepts custom duration', () => {
      const notif = notifyInfo('Info!', 7000)
      expect(notif.duration).toBe(7000)
    })
  })

  describe('getNotificationIcon', () => {
    it('returns correct icons for each type', () => {
      expect(getNotificationIcon('success')).toBe('✓')
      expect(getNotificationIcon('error')).toBe('✗')
      expect(getNotificationIcon('warning')).toBe('⚠')
      expect(getNotificationIcon('info')).toBe('ℹ')
    })

    it('returns default icon for unknown type', () => {
      const icon = getNotificationIcon('unknown' as any)
      expect(icon).toBe('ℹ')
    })
  })

  describe('getNotificationColor', () => {
    it('returns correct colors for each type', () => {
      expect(getNotificationColor('success')).toBe('#10b981')
      expect(getNotificationColor('error')).toBe('#ef4444')
      expect(getNotificationColor('warning')).toBe('#f59e0b')
      expect(getNotificationColor('info')).toBe('#3b82f6')
    })

    it('returns default color for unknown type', () => {
      const color = getNotificationColor('unknown' as any)
      expect(color).toBe('#6b7280')
    })
  })

  describe('shouldAutoDismiss', () => {
    it('returns true for notifications with positive duration', () => {
      const notif = notifySuccess('Test', 3000)
      expect(shouldAutoDismiss(notif)).toBe(true)
    })

    it('returns false for notifications with undefined duration', () => {
      const notif = createNotification('info', 'Test')
      expect(shouldAutoDismiss(notif)).toBe(false)
    })

    it('returns false for notifications with zero duration', () => {
      const notif = createNotification('info', 'Test', 0)
      expect(shouldAutoDismiss(notif)).toBe(false)
    })

    it('returns false for notifications with negative duration', () => {
      const notif = createNotification('info', 'Test', -1)
      expect(shouldAutoDismiss(notif)).toBe(false)
    })
  })

  describe('notifyWithUndo', () => {
    it('creates notification with undo action', () => {
      const onUndo = vi.fn()
      const notif = notifyWithUndo('Email deleted', onUndo)

      expect(notif.type).toBe('info')
      expect(notif.message).toBe('Email deleted')
      expect(notif.action).toBeDefined()
      expect(notif.action?.label).toBe('Undo')
      expect(notif.action?.onClick).toBe(onUndo)
    })

    it('accepts custom duration', () => {
      const onUndo = vi.fn()
      const notif = notifyWithUndo('Email deleted', onUndo, 10000)
      expect(notif.duration).toBe(10000)
    })

    it('undo action is callable', () => {
      const onUndo = vi.fn()
      const notif = notifyWithUndo('Email deleted', onUndo)

      notif.action?.onClick()
      expect(onUndo).toHaveBeenCalledTimes(1)
    })
  })
})
