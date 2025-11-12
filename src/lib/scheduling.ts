// Email Scheduling & Snooze - 10+ productivity features

import type { Email } from '../mockEmails'
import type { ScheduledSend, SnoozeInfo } from '../types/extended'

/**
 * Schedule email to send at specific time
 */
export function scheduleEmail(
  email: Email,
  sendAt: Date,
  recurring?: 'daily' | 'weekly' | 'monthly'
): Email {
  const scheduled: ScheduledSend = {
    scheduledAt: new Date().toISOString(),
    sendAt: sendAt.toISOString(),
    recurring
  }

  return {
    ...email,
    scheduled,
    mailbox: 'drafts'
  }
}

/**
 * Snooze email until specific time
 */
export function snoozeEmail(email: Email, until: Date, reason?: string): Email {
  const snooze: SnoozeInfo = {
    snoozedAt: new Date().toISOString(),
    until: until.toISOString(),
    reason
  }

  return {
    ...email,
    snoozed: snooze,
    unread: true // Make it unread when it comes back
  }
}

/**
 * Cancel scheduled send
 */
export function cancelScheduledSend(email: Email): Email {
  const { scheduled, ...rest } = email
  return rest
}

/**
 * Unsnooze email immediately
 */
export function unsnoozeEmail(email: Email): Email {
  const { snoozed, ...rest } = email
  return rest
}

/**
 * Check if email should be sent now
 */
export function shouldSendNow(email: Email): boolean {
  if (!email.scheduled) return false

  const sendAtStr = email.scheduled.sendAt || email.scheduled.scheduledFor
  if (!sendAtStr) return false

  const sendAt = new Date(sendAtStr)
  const now = new Date()

  return sendAt <= now
}

/**
 * Check if snoozed email should reappear
 */
export function shouldUnsnoozed(email: Email): boolean {
  if (!email.snoozed) return false

  const untilStr = email.snoozed.until || email.snoozed.snoozedUntil
  if (!untilStr) return false

  const until = new Date(untilStr)
  const now = new Date()

  return until <= now
}

/**
 * Get snooze presets (quick snooze options)
 */
export function getSnoozePresets(): Array<{
  label: string
  duration: number // milliseconds
  description: string
}> {
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  return [
    { label: '1 hour', duration: hour, description: 'Snooze for 1 hour' },
    { label: '3 hours', duration: 3 * hour, description: 'Snooze for 3 hours' },
    { label: 'Tomorrow', duration: day, description: 'Snooze until tomorrow' },
    { label: 'This Weekend', duration: getTimeUntilWeekend(), description: 'Snooze until Saturday' },
    { label: 'Next Week', duration: getTimeUntilNextWeek(), description: 'Snooze until Monday' },
    { label: 'Next Month', duration: 30 * day, description: 'Snooze for 30 days' }
  ]
}

/**
 * Calculate time until weekend (Saturday 9am)
 */
export function getTimeUntilWeekend(): number {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday
  const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek

  const saturday = new Date(now)
  saturday.setDate(saturday.getDate() + daysUntilSaturday)
  saturday.setHours(9, 0, 0, 0)

  return saturday.getTime() - now.getTime()
}

/**
 * Calculate time until next Monday 9am
 */
export function getTimeUntilNextWeek(): number {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek

  const monday = new Date(now)
  monday.setDate(monday.getDate() + daysUntilMonday)
  monday.setHours(9, 0, 0, 0)

  return monday.getTime() - now.getTime()
}

/**
 * Snooze with preset duration
 */
export function snoozeWithPreset(
  email: Email,
  preset: 'hour' | 'tomorrow' | 'weekend' | 'nextweek'
): Email {
  const now = new Date()
  let until: Date

  switch (preset) {
    case 'hour':
      until = new Date(now.getTime() + 60 * 60 * 1000)
      break
    case 'tomorrow':
      until = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      until.setHours(9, 0, 0, 0)
      break
    case 'weekend':
      until = new Date(now.getTime() + getTimeUntilWeekend())
      break
    case 'nextweek':
      until = new Date(now.getTime() + getTimeUntilNextWeek())
      break
    default:
      until = new Date(now.getTime() + 60 * 60 * 1000)
  }

  return snoozeEmail(email, until, `Snoozed until ${preset}`)
}

/**
 * Smart schedule suggestion based on recipient
 */
export function suggestSendTime(recipientEmail: string, currentHour: number = new Date().getHours()): Date {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Don't send late at night or very early morning
  if (currentHour >= 22 || currentHour < 7) {
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow
  }

  // For international emails, suggest next business day
  if (recipientEmail.includes('.uk') || recipientEmail.includes('.au')) {
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow
  }

  // Otherwise suggest current time + 1 hour
  const suggested = new Date()
  suggested.setHours(suggested.getHours() + 1, 0, 0, 0)
  return suggested
}

/**
 * Batch snooze multiple emails
 */
export function bulkSnooze(emails: Email[], until: Date, reason?: string): Email[] {
  return emails.map(email => snoozeEmail(email, until, reason))
}

/**
 * Get all scheduled emails
 */
export function getScheduledEmails(emails: Email[]): Email[] {
  return emails.filter(email => email.scheduled && !shouldSendNow(email))
}

/**
 * Get all snoozed emails that should reappear
 */
export function getSnoozedEmailsToShow(emails: Email[]): Email[] {
  return emails.filter(email => email.snoozed && shouldUnsnoozed(email))
}

/**
 * Get all currently snoozed emails
 */
export function getCurrentlySnoozed(emails: Email[]): Email[] {
  return emails.filter(email => email.snoozed && !shouldUnsnoozed(email))
}

/**
 * Reschedule email to new time
 */
export function rescheduleEmail(email: Email, newSendAt: Date): Email {
  if (!email.scheduled) return email

  return {
    ...email,
    scheduled: {
      ...email.scheduled,
      sendAt: newSendAt.toISOString()
    }
  }
}

/**
 * Get next recurring send time
 */
export function getNextRecurrenceTime(scheduled: ScheduledSend): Date | null {
  if (!scheduled.recurring) return null

  const sendAtStr = scheduled.sendAt || scheduled.scheduledFor
  if (!sendAtStr) return null

  const lastSend = new Date(sendAtStr)

  switch (scheduled.recurring) {
    case 'daily':
      lastSend.setDate(lastSend.getDate() + 1)
      break
    case 'weekly':
      lastSend.setDate(lastSend.getDate() + 7)
      break
    case 'monthly':
      lastSend.setMonth(lastSend.getMonth() + 1)
      break
  }

  return lastSend
}

/**
 * Update recurring email after send
 */
export function updateRecurringEmail(email: Email): Email | null {
  if (!email.scheduled || !email.scheduled.recurring) return null

  const nextTime = getNextRecurrenceTime(email.scheduled)
  if (!nextTime) return null

  return rescheduleEmail(email, nextTime)
}

/**
 * Validate schedule time
 */
export function validateScheduleTime(sendAt: Date): { valid: boolean; error?: string } {
  const now = new Date()

  if (sendAt <= now) {
    return { valid: false, error: 'Schedule time must be in the future' }
  }

  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

  if (sendAt > oneYearFromNow) {
    return { valid: false, error: 'Cannot schedule more than 1 year in advance' }
  }

  return { valid: true }
}

/**
 * Validate snooze time
 */
export function validateSnoozeTime(until: Date): { valid: boolean; error?: string } {
  const now = new Date()

  if (until <= now) {
    return { valid: false, error: 'Snooze time must be in the future' }
  }

  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

  if (until > oneYearFromNow) {
    return { valid: false, error: 'Cannot snooze more than 1 year' }
  }

  return { valid: true }
}

/**
 * Format scheduled time for display
 */
export function formatScheduledTime(scheduled: ScheduledSend): string {
  const sendAtStr = scheduled.sendAt || scheduled.scheduledFor
  if (!sendAtStr) return 'Not scheduled'

  const sendAt = new Date(sendAtStr)
  const now = new Date()
  const diffMs = sendAt.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`
  }

  if (diffHours < 24) {
    return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`
  }

  if (diffDays < 7) {
    return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
  }

  return sendAt.toLocaleDateString()
}

/**
 * Format snooze time for display
 */
export function formatSnoozeTime(snooze: SnoozeInfo): string {
  const untilStr = snooze.until || snooze.snoozedUntil
  if (!untilStr) return 'Snoozed'

  const until = new Date(untilStr)
  const now = new Date()
  const diffMs = until.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `Snoozed for ${diffMins} min`
  }

  if (diffHours < 24) {
    return `Snoozed for ${diffHours}h`
  }

  if (diffDays < 7) {
    return `Snoozed for ${diffDays}d`
  }

  return `Until ${until.toLocaleDateString()}`
}

/**
 * Get scheduling analytics
 */
export function getSchedulingStats(emails: Email[]): {
  totalScheduled: number
  totalSnoozed: number
  scheduledToday: number
  scheduledThisWeek: number
  avgSnoozeTime: number // hours
} {
  const scheduled = getScheduledEmails(emails)
  const snoozed = getCurrentlySnoozed(emails)

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const scheduledToday = scheduled.filter(e => {
    const sendAtStr = e.scheduled!.sendAt || e.scheduled!.scheduledFor
    if (!sendAtStr) return false
    const sendAt = new Date(sendAtStr)
    return sendAt >= today && sendAt < new Date(today.getTime() + 24 * 60 * 60 * 1000)
  }).length

  const scheduledThisWeek = scheduled.filter(e => {
    const sendAtStr = e.scheduled!.sendAt || e.scheduled!.scheduledFor
    if (!sendAtStr) return false
    const sendAt = new Date(sendAtStr)
    return sendAt >= today && sendAt < nextWeek
  }).length

  const snoozeTimes = snoozed.map(e => {
    const untilStr = e.snoozed!.until || e.snoozed!.snoozedUntil
    if (!untilStr) return 0
    const until = new Date(untilStr)
    const snoozedAt = new Date(e.snoozed!.snoozedAt)
    return (until.getTime() - snoozedAt.getTime()) / (1000 * 60 * 60)
  })

  const avgSnoozeTime = snoozeTimes.length > 0
    ? snoozeTimes.reduce((sum, t) => sum + t, 0) / snoozeTimes.length
    : 0

  return {
    totalScheduled: scheduled.length,
    totalSnoozed: snoozed.length,
    scheduledToday,
    scheduledThisWeek,
    avgSnoozeTime: Math.round(avgSnoozeTime)
  }
}

/**
 * Smart snooze suggestion based on email content
 */
export function suggestSnoozeDuration(email: Email): number {
  const text = `${email.subject} ${email.body}`.toLowerCase()

  // If mentions specific time frames
  if (text.includes('tomorrow')) return 24 * 60 * 60 * 1000
  if (text.includes('next week')) return getTimeUntilNextWeek()
  if (text.includes('monday')) return getTimeUntilNextWeek()

  // If it's a newsletter, snooze longer
  if (text.includes('newsletter') || text.includes('digest')) {
    return 7 * 24 * 60 * 60 * 1000 // 1 week
  }

  // Default: tomorrow morning
  return 24 * 60 * 60 * 1000
}

/**
 * Cancel all scheduled sends
 */
export function cancelAllScheduled(emails: Email[]): Email[] {
  return emails.map(email => email.scheduled ? cancelScheduledSend(email) : email)
}

/**
 * Unsnooze all emails
 */
export function unsnoozeAll(emails: Email[]): Email[] {
  return emails.map(email => email.snoozed ? unsnoozeEmail(email) : email)
}
