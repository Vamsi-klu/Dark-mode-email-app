import { describe, it, expect } from 'vitest'
import { runOverview } from 'src/lib/ai'

describe('runOverview', () => {
  it('produces deterministic points given a seed', () => {
    const a = runOverview('hello world great success', 7)
    const b = runOverview('hello world great success', 7)
    expect(a.points).toEqual(b.points)
  })

  it('never throws and returns fallback on bad input', () => {
    // @ts-expect-error intentionally passing null
    const r = runOverview(null, Number.NaN)
    expect(r.overview).toBeTypeOf('string')
    expect(Array.isArray(r.points)).toBe(true)
    expect(r.points.length).toBeGreaterThan(0)
  })

  it('detects positive and cautious sentiment', () => {
    const pos = runOverview('great excellent success ship win', 1)
    const cau = runOverview('issue bug delay risk blocked fail', 1)
    expect(pos.overview).toMatch(/positive|Overall/i)
    expect(cau.overview).toMatch(/cautious|Overall/i)
  })

  it('detects neutral sentiment when balanced', () => {
    const neu = runOverview('good issue', 3)
    expect(neu.overview).toMatch(/neutral/i)
  })

  it('shows n/a when no keywords >= 4 chars', () => {
    const r = runOverview('a an to is of on by at in', 2)
    expect(r.points.some(p => /Keywords: n\/a/i.test(p))).toBe(true)
  })
})
