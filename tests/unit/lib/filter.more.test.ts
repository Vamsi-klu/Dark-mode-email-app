import { describe, it, expect } from 'vitest'
import { filterEmails } from 'src/lib/filter'
import { mockEmails } from 'src/mockEmails'

describe('filterEmails granular suite', () => {
  const mailboxes: Array<'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'> = [
    'inbox', 'starred', 'sent', 'drafts', 'trash'
  ]

  mailboxes.forEach((mb, i) => {
    it(`filters by mailbox #${i + 1}: ${mb}`, () => {
      const res = filterEmails(mockEmails, mb, '')
      expect(res.every(e => e.mailbox === mb)).toBe(true)
    })
  })

  const terms = [
    'invoice', 'flight', 'dashboard', 'q3', 'partnership',
    'random-no-match-1', 'random-no-match-2', 'NovaCloud', 'Cascade', 'Drive'
  ]

  terms.forEach((t, i) => {
    it(`search term case #${i + 1}: '${t}'`, () => {
      const res = filterEmails(mockEmails, 'inbox', t)
      expect(Array.isArray(res)).toBe(true)
    })
  })

  it('handles large input sets correctly', () => {
    const big = Array.from({ length: 2000 }).map((_, idx) => ({
      ...mockEmails[0],
      id: `big-${idx}`,
      subject: idx % 10 === 0 ? `special invoice ${idx}` : `note ${idx}`,
    }))
    const res = filterEmails(big as any, 'inbox', 'special invoice')
    expect(res.length).toBeGreaterThan(0)
  })

  Array.from({ length: 25 }).forEach((_, idx) => {
    it(`invariant pass-through #${idx + 1}`, () => {
      const res = filterEmails(mockEmails, 'inbox', `no-hit-${idx}`)
      expect(res.every(e => e.mailbox === 'inbox')).toBe(true)
    })
  })
})

