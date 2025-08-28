import { describe, it, expect } from 'vitest'
import { filterEmails, matchesQuery } from 'src/lib/filter'
import { mockEmails } from 'src/mockEmails'

describe('matchesQuery', () => {
  it('returns true when query is empty', () => {
    expect(matchesQuery(mockEmails[0], '')).toBe(true)
  })
  it('matches subject, sender name, or snippet', () => {
    const email = {
      ...mockEmails[0],
      subject: 'Alpha Subject',
      sender: { ...mockEmails[0].sender, name: 'Beta Name' },
      snippet: 'Gamma Snippet'
    }
    expect(matchesQuery(email, 'alpha')).toBe(true)
    expect(matchesQuery(email, 'beta')).toBe(true)
    expect(matchesQuery(email, 'gamma')).toBe(true)
  })
})

describe('filterEmails', () => {
  it('filters by mailbox', () => {
    const inbox = filterEmails(mockEmails, 'inbox', '')
    expect(inbox.every(e => e.mailbox === 'inbox')).toBe(true)
  })

  it('applies search query', () => {
    const result = filterEmails(mockEmails, 'inbox', 'invoice')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some(e => /invoice/i.test(e.subject + e.snippet))).toBe(true)
  })

  const queries = Array.from({ length: 60 }, (_, i) => `q${i}`)
  queries.forEach((q, idx) => {
    it(`query case #${idx + 1} safely handles non-matching term '${q}'`, () => {
      const res = filterEmails(mockEmails, 'inbox', q)
      expect(Array.isArray(res)).toBe(true)
      expect(res.every(e => e.mailbox === 'inbox')).toBe(true)
    })
  })
})

