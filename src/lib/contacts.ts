// Contact management utilities

import type { Contact } from '../types/extended'
import type { Email } from '../mockEmails'

/**
 * Extract contacts from emails
 */
export function extractContactsFromEmails(emails: Email[]): Contact[] {
  const contactMap = new Map<string, Contact>()

  emails.forEach(email => {
    // Add sender
    const senderEmail = email.sender.email
    if (!contactMap.has(senderEmail)) {
      contactMap.set(senderEmail, {
        id: `contact-${senderEmail}`,
        name: email.sender.name,
        email: senderEmail,
        avatarColor: email.sender.avatarColor,
        frequency: 0,
        lastEmailed: email.date
      })
    }

    const contact = contactMap.get(senderEmail)!
    contact.frequency!++

    // Update last emailed if this email is more recent
    if (new Date(email.date) > new Date(contact.lastEmailed || '1970-01-01')) {
      contact.lastEmailed = email.date
    }

    // Add recipients
    ;[...email.recipients, ...(email.cc || []), ...(email.bcc || [])].forEach(recipient => {
      if (!contactMap.has(recipient) && recipient !== 'you@example.com') {
        contactMap.set(recipient, {
          id: `contact-${recipient}`,
          name: recipient.split('@')[0],
          email: recipient,
          frequency: 1,
          lastEmailed: email.date
        })
      }
    })
  })

  return Array.from(contactMap.values())
}

/**
 * Sort contacts by frequency
 */
export function sortByFrequency(contacts: Contact[], order: 'asc' | 'desc' = 'desc'): Contact[] {
  return [...contacts].sort((a, b) => {
    const freqA = a.frequency || 0
    const freqB = b.frequency || 0
    return order === 'asc' ? freqA - freqB : freqB - freqA
  })
}

/**
 * Get top N contacts by frequency
 */
export function getTopContacts(contacts: Contact[], n: number = 10): Contact[] {
  return sortByFrequency(contacts, 'desc').slice(0, n)
}

/**
 * Search contacts by name or email
 */
export function searchContacts(contacts: Contact[], query: string): Contact[] {
  if (!query.trim()) return contacts

  const q = query.toLowerCase()
  return contacts.filter(contact =>
    contact.name.toLowerCase().includes(q) ||
    contact.email.toLowerCase().includes(q)
  )
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Create contact from email address
 */
export function createContact(email: string, name?: string): Contact | null {
  if (!isValidEmail(email)) return null

  return {
    id: `contact-${email}`,
    name: name || email.split('@')[0],
    email,
    frequency: 0
  }
}

/**
 * Merge duplicate contacts
 */
export function mergeDuplicates(contacts: Contact[]): Contact[] {
  const merged = new Map<string, Contact>()

  contacts.forEach(contact => {
    const existing = merged.get(contact.email)
    if (existing) {
      existing.frequency = (existing.frequency || 0) + (contact.frequency || 0)
      if (contact.lastEmailed && (!existing.lastEmailed || new Date(contact.lastEmailed) > new Date(existing.lastEmailed))) {
        existing.lastEmailed = contact.lastEmailed
      }
    } else {
      merged.set(contact.email, { ...contact })
    }
  })

  return Array.from(merged.values())
}

/**
 * Get contact initials for avatar
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
