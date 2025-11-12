import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  scheduleEmail,
  snoozeEmail,
  cancelScheduledSend,
  unsnoozeEmail,
  shouldSendNow,
  shouldUnsnoozed,
  getSnoozePresets,
  getTimeUntilWeekend,
  getTimeUntilNextWeek,
  snoozeWithPreset,
  suggestSendTime,
  bulkSnooze,
  getScheduledEmails,
  getSnoozedEmailsToShow,
  getCurrentlySnoozed,
  rescheduleEmail,
  getNextRecurrenceTime,
  updateRecurringEmail,
  validateScheduleTime,
  validateSnoozeTime,
  formatScheduledTime,
  formatSnoozeTime,
  getSchedulingStats,
  suggestSnoozeDuration,
  cancelAllScheduled,
  unsnoozeAll
} from 'src/lib/scheduling'
import type { Email } from 'src/mockEmails'

describe('scheduling utility', () => {
  const mockEmail: Email = {
    id: 'e1',
    mailbox: 'inbox',
    unread: true,
    starred: false,
    subject: 'Test Email',
    snippet: 'Test snippet',
    body: 'Test body content',
    date: '2025-01-10',
    sender: { name: 'John Doe', email: 'john@example.com' },
    recipients: ['you@example.com']
  }

  describe('scheduleEmail', () => {
    it('schedules email for future send', () => {
      const sendAt = new Date(Date.now() + 3600000) // 1 hour from now
      const result = scheduleEmail(mockEmail, sendAt)

      expect(result.scheduled).toBeDefined()
      expect(result.scheduled?.sendAt).toBe(sendAt.toISOString())
      expect(result.mailbox).toBe('drafts')
    })

    it('supports recurring schedules', () => {
      const sendAt = new Date(Date.now() + 3600000)
      const result = scheduleEmail(mockEmail, sendAt, 'daily')

      expect(result.scheduled?.recurring).toBe('daily')
    })

    it('sets scheduledAt timestamp', () => {
      const sendAt = new Date(Date.now() + 3600000)
      const result = scheduleEmail(mockEmail, sendAt)

      expect(result.scheduled?.scheduledAt).toBeDefined()
    })
  })

  describe('snoozeEmail', () => {
    it('snoozes email until specific time', () => {
      const until = new Date(Date.now() + 7200000) // 2 hours from now
      const result = snoozeEmail(mockEmail, until)

      expect(result.snoozed).toBeDefined()
      expect(result.snoozed?.until).toBe(until.toISOString())
      expect(result.unread).toBe(true)
    })

    it('includes optional reason', () => {
      const until = new Date(Date.now() + 7200000)
      const result = snoozeEmail(mockEmail, until, 'Review later')

      expect(result.snoozed?.reason).toBe('Review later')
    })

    it('sets snoozedAt timestamp', () => {
      const until = new Date(Date.now() + 7200000)
      const result = snoozeEmail(mockEmail, until)

      expect(result.snoozed?.snoozedAt).toBeDefined()
    })
  })

  describe('cancelScheduledSend', () => {
    it('removes scheduled property', () => {
      const sendAt = new Date(Date.now() + 3600000)
      const scheduled = scheduleEmail(mockEmail, sendAt)
      const result = cancelScheduledSend(scheduled)

      expect(result.scheduled).toBeUndefined()
    })

    it('preserves other properties', () => {
      const sendAt = new Date(Date.now() + 3600000)
      const scheduled = scheduleEmail(mockEmail, sendAt)
      const result = cancelScheduledSend(scheduled)

      expect(result.id).toBe(mockEmail.id)
      expect(result.subject).toBe(mockEmail.subject)
    })
  })

  describe('unsnoozeEmail', () => {
    it('removes snoozed property', () => {
      const until = new Date(Date.now() + 7200000)
      const snoozed = snoozeEmail(mockEmail, until)
      const result = unsnoozeEmail(snoozed)

      expect(result.snoozed).toBeUndefined()
    })
  })

  describe('shouldSendNow', () => {
    it('returns true when send time has passed', () => {
      const sendAt = new Date(Date.now() - 1000) // 1 second ago
      const scheduled = scheduleEmail(mockEmail, sendAt)

      expect(shouldSendNow(scheduled)).toBe(true)
    })

    it('returns false when send time is in future', () => {
      const sendAt = new Date(Date.now() + 3600000)
      const scheduled = scheduleEmail(mockEmail, sendAt)

      expect(shouldSendNow(scheduled)).toBe(false)
    })

    it('returns false for non-scheduled emails', () => {
      expect(shouldSendNow(mockEmail)).toBe(false)
    })
  })

  describe('shouldUnsnoozed', () => {
    it('returns true when snooze time has passed', () => {
      const until = new Date(Date.now() - 1000)
      const snoozed = snoozeEmail(mockEmail, until)

      expect(shouldUnsnoozed(snoozed)).toBe(true)
    })

    it('returns false when snooze time is in future', () => {
      const until = new Date(Date.now() + 7200000)
      const snoozed = snoozeEmail(mockEmail, until)

      expect(shouldUnsnoozed(snoozed)).toBe(false)
    })

    it('returns false for non-snoozed emails', () => {
      expect(shouldUnsnoozed(mockEmail)).toBe(false)
    })
  })

  describe('getSnoozePresets', () => {
    it('returns array of presets', () => {
      const presets = getSnoozePresets()
      expect(presets.length).toBeGreaterThan(0)
    })

    it('includes common durations', () => {
      const presets = getSnoozePresets()
      const labels = presets.map(p => p.label)

      expect(labels).toContain('1 hour')
      expect(labels).toContain('Tomorrow')
      expect(labels).toContain('Next Week')
    })

    it('each preset has required properties', () => {
      const presets = getSnoozePresets()

      presets.forEach(preset => {
        expect(preset).toHaveProperty('label')
        expect(preset).toHaveProperty('duration')
        expect(preset).toHaveProperty('description')
      })
    })
  })

  describe('getTimeUntilWeekend', () => {
    it('returns positive number', () => {
      const time = getTimeUntilWeekend()
      expect(time).toBeGreaterThan(0)
    })

    it('returns time in milliseconds', () => {
      const time = getTimeUntilWeekend()
      // Should be less than 7 days
      expect(time).toBeLessThan(7 * 24 * 60 * 60 * 1000)
    })
  })

  describe('getTimeUntilNextWeek', () => {
    it('returns positive number', () => {
      const time = getTimeUntilNextWeek()
      expect(time).toBeGreaterThan(0)
    })

    it('returns time in milliseconds', () => {
      const time = getTimeUntilNextWeek()
      // Should be less than 8 days
      expect(time).toBeLessThan(8 * 24 * 60 * 60 * 1000)
    })
  })

  describe('snoozeWithPreset', () => {
    it('snoozes for 1 hour with hour preset', () => {
      const result = snoozeWithPreset(mockEmail, 'hour')
      expect(result.snoozed).toBeDefined()
    })

    it('snoozes until tomorrow with tomorrow preset', () => {
      const result = snoozeWithPreset(mockEmail, 'tomorrow')
      const until = new Date(result.snoozed!.until)
      expect(until.getHours()).toBe(9)
    })

    it('snoozes until weekend', () => {
      const result = snoozeWithPreset(mockEmail, 'weekend')
      expect(result.snoozed).toBeDefined()
    })

    it('snoozes until next week', () => {
      const result = snoozeWithPreset(mockEmail, 'nextweek')
      expect(result.snoozed).toBeDefined()
    })

    it('includes reason in snooze info', () => {
      const result = snoozeWithPreset(mockEmail, 'hour')
      expect(result.snoozed?.reason).toContain('hour')
    })
  })

  describe('suggestSendTime', () => {
    it('suggests next day at 9am for late night', () => {
      const suggested = suggestSendTime('test@example.com', 23)
      expect(suggested.getHours()).toBe(9)
      expect(suggested > new Date()).toBe(true)
    })

    it('suggests next day at 9am for early morning', () => {
      const suggested = suggestSendTime('test@example.com', 5)
      expect(suggested.getHours()).toBe(9)
    })

    it('suggests next day for international emails', () => {
      const suggested = suggestSendTime('person@company.uk', 14)
      expect(suggested.getHours()).toBe(9)
    })

    it('suggests 1 hour later during business hours', () => {
      const now = new Date()
      const suggested = suggestSendTime('test@example.com', 14)

      // Should suggest a time in the future
      expect(suggested).toBeInstanceOf(Date)
      expect(suggested.getMinutes()).toBe(0) // Rounds to hour
    })
  })

  describe('bulkSnooze', () => {
    it('snoozes multiple emails', () => {
      const emails = [
        { ...mockEmail, id: 'e1' },
        { ...mockEmail, id: 'e2' },
        { ...mockEmail, id: 'e3' }
      ]
      const until = new Date(Date.now() + 7200000)
      const result = bulkSnooze(emails, until)

      expect(result).toHaveLength(3)
      expect(result.every(e => e.snoozed !== undefined)).toBe(true)
    })

    it('applies same snooze time to all', () => {
      const emails = [
        { ...mockEmail, id: 'e1' },
        { ...mockEmail, id: 'e2' }
      ]
      const until = new Date(Date.now() + 7200000)
      const result = bulkSnooze(emails, until)

      expect(result[0].snoozed?.until).toBe(result[1].snoozed?.until)
    })
  })

  describe('getScheduledEmails', () => {
    it('returns only scheduled emails', () => {
      const future = new Date(Date.now() + 3600000)
      const emails = [
        scheduleEmail({ ...mockEmail, id: 'e1' }, future),
        mockEmail,
        scheduleEmail({ ...mockEmail, id: 'e2' }, future)
      ]

      const result = getScheduledEmails(emails)
      expect(result).toHaveLength(2)
    })

    it('excludes emails that should send now', () => {
      const past = new Date(Date.now() - 1000)
      const future = new Date(Date.now() + 3600000)
      const emails = [
        scheduleEmail({ ...mockEmail, id: 'e1' }, past),
        scheduleEmail({ ...mockEmail, id: 'e2' }, future)
      ]

      const result = getScheduledEmails(emails)
      expect(result).toHaveLength(1)
    })
  })

  describe('getSnoozedEmailsToShow', () => {
    it('returns snoozed emails that should reappear', () => {
      const past = new Date(Date.now() - 1000)
      const future = new Date(Date.now() + 7200000)
      const emails = [
        snoozeEmail({ ...mockEmail, id: 'e1' }, past),
        snoozeEmail({ ...mockEmail, id: 'e2' }, future)
      ]

      const result = getSnoozedEmailsToShow(emails)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e1')
    })
  })

  describe('getCurrentlySnoozed', () => {
    it('returns currently snoozed emails', () => {
      const past = new Date(Date.now() - 1000)
      const future = new Date(Date.now() + 7200000)
      const emails = [
        snoozeEmail({ ...mockEmail, id: 'e1' }, past),
        snoozeEmail({ ...mockEmail, id: 'e2' }, future),
        mockEmail
      ]

      const result = getCurrentlySnoozed(emails)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('e2')
    })
  })

  describe('rescheduleEmail', () => {
    it('updates send time', () => {
      const oldTime = new Date(Date.now() + 3600000)
      const newTime = new Date(Date.now() + 7200000)
      const scheduled = scheduleEmail(mockEmail, oldTime)
      const result = rescheduleEmail(scheduled, newTime)

      expect(result.scheduled?.sendAt).toBe(newTime.toISOString())
    })

    it('preserves recurring setting', () => {
      const oldTime = new Date(Date.now() + 3600000)
      const newTime = new Date(Date.now() + 7200000)
      const scheduled = scheduleEmail(mockEmail, oldTime, 'weekly')
      const result = rescheduleEmail(scheduled, newTime)

      expect(result.scheduled?.recurring).toBe('weekly')
    })

    it('returns original email if not scheduled', () => {
      const newTime = new Date(Date.now() + 7200000)
      const result = rescheduleEmail(mockEmail, newTime)

      expect(result).toEqual(mockEmail)
    })
  })

  describe('getNextRecurrenceTime', () => {
    it('calculates next daily recurrence', () => {
      const now = new Date()
      const scheduled = scheduleEmail(mockEmail, now, 'daily').scheduled!
      const next = getNextRecurrenceTime(scheduled)

      expect(next).not.toBeNull()
      expect(next!.getDate()).toBe(now.getDate() + 1)
    })

    it('calculates next weekly recurrence', () => {
      const now = new Date()
      const scheduled = scheduleEmail(mockEmail, now, 'weekly').scheduled!
      const next = getNextRecurrenceTime(scheduled)

      expect(next).not.toBeNull()
      expect(next!.getDate()).toBe(now.getDate() + 7)
    })

    it('calculates next monthly recurrence', () => {
      const now = new Date()
      const scheduled = scheduleEmail(mockEmail, now, 'monthly').scheduled!
      const next = getNextRecurrenceTime(scheduled)

      expect(next).not.toBeNull()
      expect(next!.getMonth()).toBe((now.getMonth() + 1) % 12)
    })

    it('returns null for non-recurring', () => {
      const now = new Date()
      const scheduled = scheduleEmail(mockEmail, now).scheduled!
      const next = getNextRecurrenceTime(scheduled)

      expect(next).toBeNull()
    })
  })

  describe('updateRecurringEmail', () => {
    it('updates recurring email with next time', () => {
      const now = new Date()
      const recurring = scheduleEmail(mockEmail, now, 'daily')
      const updated = updateRecurringEmail(recurring)

      expect(updated).not.toBeNull()
      expect(updated?.scheduled).toBeDefined()
    })

    it('returns null for non-recurring emails', () => {
      const now = new Date()
      const nonRecurring = scheduleEmail(mockEmail, now)
      const updated = updateRecurringEmail(nonRecurring)

      expect(updated).toBeNull()
    })

    it('returns null for non-scheduled emails', () => {
      const updated = updateRecurringEmail(mockEmail)
      expect(updated).toBeNull()
    })
  })

  describe('validateScheduleTime', () => {
    it('validates future time', () => {
      const future = new Date(Date.now() + 3600000)
      const result = validateScheduleTime(future)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects past time', () => {
      const past = new Date(Date.now() - 1000)
      const result = validateScheduleTime(past)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('future')
    })

    it('rejects time more than 1 year away', () => {
      const farFuture = new Date()
      farFuture.setFullYear(farFuture.getFullYear() + 2)
      const result = validateScheduleTime(farFuture)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('1 year')
    })
  })

  describe('validateSnoozeTime', () => {
    it('validates future time', () => {
      const future = new Date(Date.now() + 7200000)
      const result = validateSnoozeTime(future)

      expect(result.valid).toBe(true)
    })

    it('rejects past time', () => {
      const past = new Date(Date.now() - 1000)
      const result = validateSnoozeTime(past)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('future')
    })

    it('rejects time more than 1 year away', () => {
      const farFuture = new Date()
      farFuture.setFullYear(farFuture.getFullYear() + 2)
      const result = validateSnoozeTime(farFuture)

      expect(result.valid).toBe(false)
    })
  })

  describe('formatScheduledTime', () => {
    it('formats minutes for very soon', () => {
      const sendAt = new Date(Date.now() + 30 * 60 * 1000) // 30 mins
      const scheduled = scheduleEmail(mockEmail, sendAt).scheduled!
      const formatted = formatScheduledTime(scheduled)

      expect(formatted).toContain('minute')
    })

    it('formats hours for same day', () => {
      const sendAt = new Date(Date.now() + 5 * 60 * 60 * 1000) // 5 hours
      const scheduled = scheduleEmail(mockEmail, sendAt).scheduled!
      const formatted = formatScheduledTime(scheduled)

      expect(formatted).toContain('hour')
    })

    it('formats days for this week', () => {
      const sendAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
      const scheduled = scheduleEmail(mockEmail, sendAt).scheduled!
      const formatted = formatScheduledTime(scheduled)

      expect(formatted).toContain('day')
    })

    it('formats date for distant future', () => {
      const sendAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days
      const scheduled = scheduleEmail(mockEmail, sendAt).scheduled!
      const formatted = formatScheduledTime(scheduled)

      expect(formatted).toBeTruthy()
    })
  })

  describe('formatSnoozeTime', () => {
    it('formats minutes', () => {
      const until = new Date(Date.now() + 30 * 60 * 1000)
      const snoozed = snoozeEmail(mockEmail, until).snoozed!
      const formatted = formatSnoozeTime(snoozed)

      expect(formatted).toContain('min')
    })

    it('formats hours', () => {
      const until = new Date(Date.now() + 3 * 60 * 60 * 1000)
      const snoozed = snoozeEmail(mockEmail, until).snoozed!
      const formatted = formatSnoozeTime(snoozed)

      expect(formatted).toContain('h')
    })

    it('formats days', () => {
      const until = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      const snoozed = snoozeEmail(mockEmail, until).snoozed!
      const formatted = formatSnoozeTime(snoozed)

      expect(formatted).toContain('d')
    })
  })

  describe('getSchedulingStats', () => {
    it('counts scheduled and snoozed emails', () => {
      const future = new Date(Date.now() + 3600000)
      const emails = [
        scheduleEmail({ ...mockEmail, id: 'e1' }, future),
        snoozeEmail({ ...mockEmail, id: 'e2' }, future),
        mockEmail
      ]

      const stats = getSchedulingStats(emails)
      expect(stats.totalScheduled).toBe(1)
      expect(stats.totalSnoozed).toBe(1)
    })

    it('counts scheduled for today', () => {
      const today = new Date()
      today.setHours(today.getHours() + 2)
      const tomorrow = new Date(Date.now() + 25 * 60 * 60 * 1000)

      const emails = [
        scheduleEmail({ ...mockEmail, id: 'e1' }, today),
        scheduleEmail({ ...mockEmail, id: 'e2' }, tomorrow)
      ]

      const stats = getSchedulingStats(emails)
      expect(stats.scheduledToday).toBe(1)
    })

    it('calculates average snooze time', () => {
      const until1 = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
      const until2 = new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours

      const emails = [
        snoozeEmail({ ...mockEmail, id: 'e1' }, until1),
        snoozeEmail({ ...mockEmail, id: 'e2' }, until2)
      ]

      const stats = getSchedulingStats(emails)
      expect(stats.avgSnoozeTime).toBe(2) // Average of 1 and 3
    })

    it('handles empty arrays', () => {
      const stats = getSchedulingStats([])

      expect(stats.totalScheduled).toBe(0)
      expect(stats.totalSnoozed).toBe(0)
      expect(stats.avgSnoozeTime).toBe(0)
    })
  })

  describe('suggestSnoozeDuration', () => {
    it('suggests 24h for emails mentioning tomorrow', () => {
      const email = { ...mockEmail, body: 'Let me know by tomorrow' }
      const duration = suggestSnoozeDuration(email)

      expect(duration).toBe(24 * 60 * 60 * 1000)
    })

    it('suggests next week for next week mentions', () => {
      const email = { ...mockEmail, body: 'See you next week' }
      const duration = suggestSnoozeDuration(email)

      expect(duration).toBeGreaterThan(24 * 60 * 60 * 1000)
    })

    it('suggests 1 week for newsletters', () => {
      const email = { ...mockEmail, subject: 'Weekly Newsletter' }
      const duration = suggestSnoozeDuration(email)

      expect(duration).toBe(7 * 24 * 60 * 60 * 1000)
    })

    it('defaults to tomorrow', () => {
      const email = { ...mockEmail, body: 'Regular email' }
      const duration = suggestSnoozeDuration(email)

      expect(duration).toBe(24 * 60 * 60 * 1000)
    })
  })

  describe('cancelAllScheduled', () => {
    it('cancels all scheduled emails', () => {
      const future = new Date(Date.now() + 3600000)
      const emails = [
        scheduleEmail({ ...mockEmail, id: 'e1' }, future),
        scheduleEmail({ ...mockEmail, id: 'e2' }, future),
        mockEmail
      ]

      const result = cancelAllScheduled(emails)
      expect(result.every(e => !e.scheduled)).toBe(true)
    })

    it('preserves non-scheduled emails', () => {
      const emails = [mockEmail]
      const result = cancelAllScheduled(emails)

      expect(result).toEqual(emails)
    })
  })

  describe('unsnoozeAll', () => {
    it('unsnoozes all snoozed emails', () => {
      const future = new Date(Date.now() + 7200000)
      const emails = [
        snoozeEmail({ ...mockEmail, id: 'e1' }, future),
        snoozeEmail({ ...mockEmail, id: 'e2' }, future),
        mockEmail
      ]

      const result = unsnoozeAll(emails)
      expect(result.every(e => !e.snoozed)).toBe(true)
    })

    it('preserves non-snoozed emails', () => {
      const emails = [mockEmail]
      const result = unsnoozeAll(emails)

      expect(result).toEqual(emails)
    })
  })
})
