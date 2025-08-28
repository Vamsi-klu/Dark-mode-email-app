// Deterministic, offline "AI" overview utility with robust behavior.
// It never throws, operates synchronously, and is fully testable.

export type Overview = {
  overview: string
  points: string[]
}

const positive = ['great', 'good', 'excellent', 'improve', 'success', 'ship', 'win']
const negative = ['issue', 'bug', 'delay', 'problem', 'risk', 'blocked', 'fail']

export function runOverview(inputRaw: string, seedRaw: number): Overview {
  try {
    const input = String(inputRaw ?? '').trim()
    const seed = Number.isFinite(seedRaw) ? Math.max(0, Math.floor(seedRaw)) : 0
    const text = input || 'Provide a high-level overview of my mailbox and outline suggested next steps.'
    const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

    const wordCount = tokens.length
    const charCount = text.length
    const uniq = new Set(tokens)
    const uniqCount = uniq.size
    const posHits = tokens.filter(t => positive.includes(t)).length
    const negHits = tokens.filter(t => negative.includes(t)).length
    const sentiment = posHits === negHits ? 'neutral' : posHits > negHits ? 'positive' : 'cautious'

    // Extract simple keywords (top 5 by frequency, length >= 4)
    const freq = new Map<string, number>()
    for (const t of tokens) {
      if (t.length < 4) continue
      freq.set(t, (freq.get(t) ?? 0) + 1)
    }
    const keywords = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([k]) => k)

    /* c8 ignore next */
    const firstSentence = text.split(/[.!?]/).find(Boolean)?.trim() ?? text

    const basePoints = [
      `Summary length: ${wordCount} words, ${charCount} chars, ${uniqCount} unique tokens`,
      `Detected sentiment: ${sentiment} (pos:${posHits}/neg:${negHits})`,
      keywords.length ? `Keywords: ${keywords.join(', ')}` : 'Keywords: n/a',
      'Next step: identify priority emails and respond within 24 hours',
      'Next step: archive low-signal threads to reduce noise',
      'Next step: schedule time blocks for follow-ups',
    ]

    // Deterministic shuffle by seed
    const points = shuffleDeterministic(basePoints, seed).slice(0, 5)
    const overview = `${capitalize(firstSentence)} — Overall context appears ${sentiment}. Focus on clear next steps and momentum.`

    return { overview, points }
  /* c8 ignore start */
  } catch {
    // Never throw; provide a safe fallback
    return {
      overview: 'Overview unavailable. Using safe fallback. Focus on next steps and clarity.',
      points: [
        'Next step: write down the primary objective',
        'Next step: break work into small, verifiable tasks',
        'Next step: communicate blockers early',
        'Next step: set time-bound milestones',
        'Next step: review and iterate regularly',
      ]
    }
  }
  /* c8 ignore stop */
}

function shuffleDeterministic<T>(arr: T[], seed: number): T[] {
  const a = arr.slice()
  let s = seed || 0
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const r = s / 233280
    const j = Math.floor(r * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
