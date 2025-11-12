import { describe, it, expect, beforeEach } from 'vitest'
import {
  createRule,
  registerRule,
  unregisterRule,
  getRule,
  getAllRules,
  getEnabledRules,
  enableRule,
  disableRule,
  matchesCondition,
  matchesRule,
  applyAction,
  applyRule,
  applyRules,
  applyRulesToEmails,
  validateRule,
  testRule,
  getMatchingRules,
  exportRules,
  importRules,
  clearAllRules,
  getRuleStats,
  duplicateRule,
  updateRulePriority,
  createPresetRule,
  type Rule,
  type RuleCondition,
  type RuleAction
} from 'src/lib/rules'
import type { Email } from 'src/mockEmails'

describe('rules engine utility', () => {
  const mockEmail: Email = {
    id: 'e1',
    mailbox: 'inbox',
    unread: true,
    starred: false,
    subject: 'Important Meeting Tomorrow',
    snippet: 'Please attend the meeting',
    body: 'Hi team, please attend the important meeting tomorrow at 10am.',
    date: '2025-01-10',
    sender: { name: 'Boss', email: 'boss@company.com' },
    recipients: ['you@company.com'],
    hasAttachment: false,
    size: 1024
  }

  beforeEach(() => {
    clearAllRules()
  })

  describe('createRule', () => {
    it('creates a rule with required fields', () => {
      const conditions: RuleCondition[] = [
        { type: 'from', operator: 'contains', value: 'test' }
      ]
      const actions: RuleAction[] = [
        { type: 'markRead' }
      ]

      const rule = createRule('Test Rule', conditions, actions)

      expect(rule.id).toBeDefined()
      expect(rule.name).toBe('Test Rule')
      expect(rule.enabled).toBe(true)
      expect(rule.conditions).toEqual(conditions)
      expect(rule.actions).toEqual(actions)
    })

    it('defaults to AND logic', () => {
      const rule = createRule('Test', [], [])
      expect(rule.conditionLogic).toBe('and')
    })

    it('allows OR logic', () => {
      const rule = createRule('Test', [], [], 'or')
      expect(rule.conditionLogic).toBe('or')
    })
  })

  describe('register/unregister rules', () => {
    it('registers a rule', () => {
      const rule = createRule('Test', [], [])
      registerRule(rule)

      expect(getRule(rule.id)).toEqual(rule)
    })

    it('unregisters a rule', () => {
      const rule = createRule('Test', [], [])
      registerRule(rule)

      expect(unregisterRule(rule.id)).toBe(true)
      expect(getRule(rule.id)).toBeUndefined()
    })

    it('returns false for non-existent rule', () => {
      expect(unregisterRule('non-existent')).toBe(false)
    })
  })

  describe('getAllRules', () => {
    it('returns all rules sorted by priority', () => {
      const rule1 = createRule('Low', [], [])
      const rule2 = createRule('High', [], [])
      rule1.priority = 100
      rule2.priority = 50

      registerRule(rule1)
      registerRule(rule2)

      const all = getAllRules()
      expect(all[0].id).toBe(rule2.id) // High priority first
    })
  })

  describe('enable/disable rules', () => {
    it('enables and disables rules', () => {
      const rule = createRule('Test', [], [])
      registerRule(rule)

      disableRule(rule.id)
      expect(getRule(rule.id)?.enabled).toBe(false)

      enableRule(rule.id)
      expect(getRule(rule.id)?.enabled).toBe(true)
    })

    it('getEnabledRules filters correctly', () => {
      const rule1 = createRule('Enabled', [], [])
      const rule2 = createRule('Disabled', [], [])

      registerRule(rule1)
      registerRule(rule2)
      disableRule(rule2.id)

      expect(getEnabledRules()).toHaveLength(1)
      expect(getEnabledRules()[0].id).toBe(rule1.id)
    })
  })

  describe('matchesCondition', () => {
    describe('string conditions', () => {
      it('matches from contains', () => {
        const cond: RuleCondition = { type: 'from', operator: 'contains', value: 'boss' }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches subject contains', () => {
        const cond: RuleCondition = { type: 'subject', operator: 'contains', value: 'meeting' }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches body contains', () => {
        const cond: RuleCondition = { type: 'body', operator: 'contains', value: 'important' }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches equals', () => {
        const cond: RuleCondition = { type: 'mailbox', operator: 'equals', value: 'inbox' }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches notEquals', () => {
        const cond: RuleCondition = { type: 'mailbox', operator: 'notEquals', value: 'trash' }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches startsWith', () => {
        const cond: RuleCondition = { type: 'from', operator: 'startsWith', value: 'boss' }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches endsWith', () => {
        const cond: RuleCondition = { type: 'from', operator: 'endsWith', value: '.com' }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches regex', () => {
        const cond: RuleCondition = { type: 'subject', operator: 'matches', value: 'important.*tomorrow' }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })
    })

    describe('boolean conditions', () => {
      it('matches isUnread', () => {
        const cond: RuleCondition = { type: 'isUnread', operator: 'is', value: true }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches isStarred', () => {
        const cond: RuleCondition = { type: 'isStarred', operator: 'is', value: false }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches hasAttachment', () => {
        const cond: RuleCondition = { type: 'hasAttachment', operator: 'is', value: false }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })
    })

    describe('number conditions', () => {
      it('matches size greaterThan', () => {
        const cond: RuleCondition = { type: 'size', operator: 'greaterThan', value: 500 }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })

      it('matches size lessThan', () => {
        const cond: RuleCondition = { type: 'size', operator: 'lessThan', value: 2000 }
        expect(matchesCondition(mockEmail, cond)).toBe(true)
      })
    })
  })

  describe('matchesRule', () => {
    it('matches with AND logic when all conditions true', () => {
      const rule = createRule(
        'Test',
        [
          { type: 'from', operator: 'contains', value: 'boss' },
          { type: 'subject', operator: 'contains', value: 'meeting' }
        ],
        [],
        'and'
      )

      expect(matchesRule(mockEmail, rule)).toBe(true)
    })

    it('does not match with AND logic when any condition false', () => {
      const rule = createRule(
        'Test',
        [
          { type: 'from', operator: 'contains', value: 'boss' },
          { type: 'subject', operator: 'contains', value: 'invoice' }
        ],
        [],
        'and'
      )

      expect(matchesRule(mockEmail, rule)).toBe(false)
    })

    it('matches with OR logic when any condition true', () => {
      const rule = createRule(
        'Test',
        [
          { type: 'from', operator: 'contains', value: 'unknown' },
          { type: 'subject', operator: 'contains', value: 'meeting' }
        ],
        [],
        'or'
      )

      expect(matchesRule(mockEmail, rule)).toBe(true)
    })

    it('does not match disabled rules', () => {
      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'boss' }],
        []
      )
      rule.enabled = false

      expect(matchesRule(mockEmail, rule)).toBe(false)
    })

    it('does not match with no conditions', () => {
      const rule = createRule('Test', [], [])
      expect(matchesRule(mockEmail, rule)).toBe(false)
    })
  })

  describe('applyAction', () => {
    it('moves email', () => {
      const action: RuleAction = { type: 'move', value: 'archive' }
      const result = applyAction(mockEmail, action)
      expect(result.mailbox).toBe('archive')
    })

    it('deletes email', () => {
      const action: RuleAction = { type: 'delete' }
      const result = applyAction(mockEmail, action)
      expect(result.mailbox).toBe('trash')
    })

    it('archives email', () => {
      const action: RuleAction = { type: 'archive' }
      const result = applyAction(mockEmail, action)
      expect(result.mailbox).toBe('archive')
    })

    it('marks as read', () => {
      const action: RuleAction = { type: 'markRead' }
      const result = applyAction(mockEmail, action)
      expect(result.unread).toBe(false)
      expect(result.isRead).toBe(true)
    })

    it('marks as unread', () => {
      const email = { ...mockEmail, unread: false }
      const action: RuleAction = { type: 'markUnread' }
      const result = applyAction(email, action)
      expect(result.unread).toBe(true)
    })

    it('stars email', () => {
      const action: RuleAction = { type: 'star' }
      const result = applyAction(mockEmail, action)
      expect(result.starred).toBe(true)
    })

    it('unstars email', () => {
      const email = { ...mockEmail, starred: true }
      const action: RuleAction = { type: 'unstar' }
      const result = applyAction(email, action)
      expect(result.starred).toBe(false)
    })

    it('sets priority', () => {
      const action: RuleAction = { type: 'setPriority', value: 'high' }
      const result = applyAction(mockEmail, action)
      expect(result.priority).toBe('high')
    })

    it('adds label', () => {
      const label = JSON.stringify({ id: 'l1', name: 'Work', color: '#blue' })
      const action: RuleAction = { type: 'addLabel', value: label }
      const result = applyAction(mockEmail, action)
      expect(result.labels).toHaveLength(1)
      expect(result.labels![0].name).toBe('Work')
    })

    it('removes label', () => {
      const email = {
        ...mockEmail,
        labels: [{ id: 'l1', name: 'Work', color: '#blue' }]
      }
      const action: RuleAction = { type: 'removeLabel', value: 'Work' }
      const result = applyAction(email, action)
      expect(result.labels).toHaveLength(0)
    })
  })

  describe('applyRule', () => {
    it('applies all actions when rule matches', () => {
      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'boss' }],
        [
          { type: 'star' },
          { type: 'markRead' }
        ]
      )

      const result = applyRule(mockEmail, rule)
      expect(result.starred).toBe(true)
      expect(result.unread).toBe(false)
    })

    it('does not apply when rule does not match', () => {
      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'unknown' }],
        [{ type: 'star' }]
      )

      const result = applyRule(mockEmail, rule)
      expect(result).toEqual(mockEmail)
    })

    it('updates rule statistics', () => {
      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'boss' }],
        [{ type: 'star' }]
      )

      expect(rule.matchCount).toBe(0)
      applyRule(mockEmail, rule)
      expect(rule.matchCount).toBe(1)
      expect(rule.lastRun).toBeDefined()
    })
  })

  describe('applyRules', () => {
    it('applies multiple rules in priority order', () => {
      const rule1 = createRule(
        'Rule 1',
        [{ type: 'from', operator: 'contains', value: 'boss' }],
        [{ type: 'star' }]
      )
      rule1.priority = 100

      const rule2 = createRule(
        'Rule 2',
        [{ type: 'subject', operator: 'contains', value: 'meeting' }],
        [{ type: 'markRead' }]
      )
      rule2.priority = 50

      registerRule(rule1)
      registerRule(rule2)

      const result = applyRules(mockEmail)
      expect(result.starred).toBe(true)
      expect(result.unread).toBe(false)
    })

    it('stops processing when stopProcessing is true', () => {
      const rule1 = createRule(
        'Stop Rule',
        [{ type: 'from', operator: 'contains', value: 'boss' }],
        [{ type: 'star' }]
      )
      rule1.priority = 50
      rule1.stopProcessing = true

      const rule2 = createRule(
        'After Rule',
        [{ type: 'subject', operator: 'contains', value: 'meeting' }],
        [{ type: 'markRead' }]
      )
      rule2.priority = 100

      registerRule(rule1)
      registerRule(rule2)

      const result = applyRules(mockEmail)
      expect(result.starred).toBe(true)
      expect(result.unread).toBe(true) // Should not be marked read
    })
  })

  describe('applyRulesToEmails', () => {
    it('applies rules to multiple emails', () => {
      const emails = [
        { ...mockEmail, id: 'e1' },
        { ...mockEmail, id: 'e2' }
      ]

      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'boss' }],
        [{ type: 'star' }]
      )
      registerRule(rule)

      const result = applyRulesToEmails(emails)
      expect(result.every(e => e.starred)).toBe(true)
    })
  })

  describe('validateRule', () => {
    it('validates correct rule', () => {
      const rule = createRule(
        'Valid',
        [{ type: 'from', operator: 'contains', value: 'test' }],
        [{ type: 'star' }]
      )

      const result = validateRule(rule)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('requires rule name', () => {
      const rule = createRule('', [], [])
      const result = validateRule(rule)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('name'))).toBe(true)
    })

    it('requires conditions', () => {
      const rule = createRule('Test', [], [{ type: 'star' }])
      const result = validateRule(rule)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('condition'))).toBe(true)
    })

    it('requires actions', () => {
      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'test' }],
        []
      )
      const result = validateRule(rule)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('action'))).toBe(true)
    })

    it('validates action values', () => {
      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'test' }],
        [{ type: 'move' }] // Missing value
      )
      const result = validateRule(rule)
      expect(result.valid).toBe(false)
    })
  })

  describe('testRule', () => {
    it('returns matching and processed emails', () => {
      const emails = [
        { ...mockEmail, id: 'e1', sender: { name: 'Boss', email: 'boss@company.com' } },
        { ...mockEmail, id: 'e2', sender: { name: 'Friend', email: 'friend@example.com' } }
      ]

      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'boss' }],
        [{ type: 'star' }]
      )

      const result = testRule(rule, emails)
      expect(result.matches).toHaveLength(1)
      expect(result.processed).toHaveLength(1)
      expect(result.processed[0].starred).toBe(true)
    })
  })

  describe('getMatchingRules', () => {
    it('returns all rules that match email', () => {
      const rule1 = createRule(
        'Rule 1',
        [{ type: 'from', operator: 'contains', value: 'boss' }],
        [{ type: 'star' }]
      )

      const rule2 = createRule(
        'Rule 2',
        [{ type: 'subject', operator: 'contains', value: 'meeting' }],
        [{ type: 'markRead' }]
      )

      registerRule(rule1)
      registerRule(rule2)

      const matching = getMatchingRules(mockEmail)
      expect(matching).toHaveLength(2)
    })
  })

  describe('export/import rules', () => {
    it('exports rules as JSON', () => {
      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'test' }],
        [{ type: 'star' }]
      )
      registerRule(rule)

      const exported = exportRules()
      expect(() => JSON.parse(exported)).not.toThrow()
    })

    it('imports rules from JSON', () => {
      const rule = createRule(
        'Test',
        [{ type: 'from', operator: 'contains', value: 'test' }],
        [{ type: 'star' }]
      )
      registerRule(rule)

      const exported = exportRules()
      clearAllRules()

      const success = importRules(exported)
      expect(success).toBe(true)
      expect(getAllRules()).toHaveLength(1)
    })

    it('returns false for invalid JSON', () => {
      expect(importRules('invalid')).toBe(false)
    })
  })

  describe('getRuleStats', () => {
    it('returns statistics', () => {
      const rule1 = createRule('R1', [], [])
      const rule2 = createRule('R2', [], [])
      rule1.matchCount = 5
      rule2.matchCount = 10

      registerRule(rule1)
      registerRule(rule2)
      disableRule(rule2.id)

      const stats = getRuleStats()
      expect(stats.total).toBe(2)
      expect(stats.enabled).toBe(1)
      expect(stats.disabled).toBe(1)
      expect(stats.totalMatches).toBe(15)
      expect(stats.mostUsedRule?.id).toBe(rule2.id)
    })
  })

  describe('duplicateRule', () => {
    it('duplicates a rule', () => {
      const rule = createRule(
        'Original',
        [{ type: 'from', operator: 'contains', value: 'test' }],
        [{ type: 'star' }]
      )
      registerRule(rule)

      const duplicate = duplicateRule(rule.id)
      expect(duplicate).not.toBeNull()
      expect(duplicate!.id).not.toBe(rule.id)
      expect(duplicate!.name).toContain('Copy')
      expect(duplicate!.conditions).toEqual(rule.conditions)
      expect(duplicate!.matchCount).toBe(0)
    })

    it('returns null for non-existent rule', () => {
      expect(duplicateRule('non-existent')).toBeNull()
    })
  })

  describe('updateRulePriority', () => {
    it('updates priority', () => {
      const rule = createRule('Test', [], [])
      registerRule(rule)

      expect(updateRulePriority(rule.id, 50)).toBe(true)
      expect(getRule(rule.id)?.priority).toBe(50)
    })

    it('returns false for non-existent rule', () => {
      expect(updateRulePriority('non-existent', 50)).toBe(false)
    })
  })

  describe('createPresetRule', () => {
    it('creates newsletter preset', () => {
      const rule = createPresetRule('newsletter')
      expect(rule.name).toContain('newsletter')
      expect(rule.actions.some(a => a.type === 'archive')).toBe(true)
    })

    it('creates spam preset', () => {
      const rule = createPresetRule('spam')
      expect(rule.actions.some(a => a.type === 'delete')).toBe(true)
    })

    it('creates important preset', () => {
      const rule = createPresetRule('important')
      expect(rule.actions.some(a => a.type === 'star')).toBe(true)
    })

    it('creates auto-archive preset', () => {
      const rule = createPresetRule('auto-archive')
      expect(rule.conditions.some(c => c.type === 'olderThan')).toBe(true)
    })
  })
})
