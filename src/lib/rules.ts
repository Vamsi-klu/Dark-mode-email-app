// Smart Rules Engine - 15+ automation features

import type { Email } from '../mockEmails'
import type { Mailbox } from '../types/mail'
import type { Label, Priority } from '../types/extended'

export type RuleConditionType =
  | 'from' | 'to' | 'subject' | 'body'
  | 'hasAttachment' | 'isUnread' | 'isStarred'
  | 'olderThan' | 'newerThan' | 'size'
  | 'hasLabel' | 'priority' | 'mailbox'

export type RuleOperator =
  | 'contains' | 'notContains' | 'equals' | 'notEquals'
  | 'startsWith' | 'endsWith' | 'matches' // regex
  | 'greaterThan' | 'lessThan'
  | 'is' | 'isNot'

export type RuleActionType =
  | 'move' | 'copy' | 'delete' | 'archive'
  | 'markRead' | 'markUnread' | 'star' | 'unstar'
  | 'addLabel' | 'removeLabel' | 'setPriority'
  | 'forward' | 'autoReply' | 'snooze'

export type RuleCondition = {
  type: RuleConditionType
  operator: RuleOperator
  value: string | number | boolean
}

export type RuleAction = {
  type: RuleActionType
  value?: string // For move, addLabel, forward, etc.
}

export type Rule = {
  id: string
  name: string
  description?: string
  enabled: boolean
  conditions: RuleCondition[]
  conditionLogic: 'and' | 'or' // How to combine multiple conditions
  actions: RuleAction[]
  priority: number // Lower number = higher priority
  stopProcessing: boolean // Stop executing other rules if this matches
  createdAt: string
  lastRun?: string
  matchCount: number
}

// Registered rules store
const rules: Map<string, Rule> = new Map()

/**
 * Create a new rule
 */
export function createRule(
  name: string,
  conditions: RuleCondition[],
  actions: RuleAction[],
  conditionLogic: 'and' | 'or' = 'and'
): Rule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    enabled: true,
    conditions,
    conditionLogic,
    actions,
    priority: 100,
    stopProcessing: false,
    createdAt: new Date().toISOString(),
    matchCount: 0
  }
}

/**
 * Register a rule
 */
export function registerRule(rule: Rule): void {
  rules.set(rule.id, rule)
}

/**
 * Unregister a rule
 */
export function unregisterRule(id: string): boolean {
  return rules.delete(id)
}

/**
 * Get a rule by ID
 */
export function getRule(id: string): Rule | undefined {
  return rules.get(id)
}

/**
 * Get all rules
 */
export function getAllRules(): Rule[] {
  return Array.from(rules.values()).sort((a, b) => a.priority - b.priority)
}

/**
 * Get enabled rules
 */
export function getEnabledRules(): Rule[] {
  return getAllRules().filter(r => r.enabled)
}

/**
 * Enable a rule
 */
export function enableRule(id: string): void {
  const rule = rules.get(id)
  if (rule) rule.enabled = true
}

/**
 * Disable a rule
 */
export function disableRule(id: string): void {
  const rule = rules.get(id)
  if (rule) rule.enabled = false
}

/**
 * Check if email matches a condition
 */
export function matchesCondition(email: Email, condition: RuleCondition): boolean {
  const { type, operator, value } = condition

  switch (type) {
    case 'from':
      return matchString(email.sender.email, operator, value as string)

    case 'to':
      return email.recipients.some(r => matchString(r, operator, value as string))

    case 'subject':
      return matchString(email.subject, operator, value as string)

    case 'body':
      return matchString(email.body, operator, value as string)

    case 'hasAttachment':
      return matchBoolean(!!email.hasAttachment, operator, value as boolean)

    case 'isUnread':
      return matchBoolean(!!email.unread, operator, value as boolean)

    case 'isStarred':
      return matchBoolean(!!email.starred, operator, value as boolean)

    case 'olderThan': {
      const emailDate = new Date(email.date)
      const daysOld = (Date.now() - emailDate.getTime()) / (1000 * 60 * 60 * 24)
      return matchNumber(daysOld, operator, value as number)
    }

    case 'newerThan': {
      const emailDate = new Date(email.date)
      const daysOld = (Date.now() - emailDate.getTime()) / (1000 * 60 * 60 * 24)
      return matchNumber(daysOld, operator, value as number)
    }

    case 'size':
      return matchNumber(email.size || 0, operator, value as number)

    case 'hasLabel':
      if (!email.labels) return false
      return email.labels.some(l => l.name === value)

    case 'priority':
      return matchString(email.priority || 'normal', operator, value as string)

    case 'mailbox':
      return matchString(email.mailbox, operator, value as string)

    default:
      return false
  }
}

/**
 * Match string value with operator
 */
function matchString(str: string, operator: RuleOperator, value: string): boolean {
  const strLower = str.toLowerCase()
  const valueLower = value.toLowerCase()

  switch (operator) {
    case 'contains':
      return strLower.includes(valueLower)
    case 'notContains':
      return !strLower.includes(valueLower)
    case 'equals':
      return strLower === valueLower
    case 'notEquals':
      return strLower !== valueLower
    case 'startsWith':
      return strLower.startsWith(valueLower)
    case 'endsWith':
      return strLower.endsWith(valueLower)
    case 'matches':
      try {
        return new RegExp(value, 'i').test(str)
      } catch {
        return false
      }
    default:
      return false
  }
}

/**
 * Match number value with operator
 */
function matchNumber(num: number, operator: RuleOperator, value: number): boolean {
  switch (operator) {
    case 'equals':
      return num === value
    case 'notEquals':
      return num !== value
    case 'greaterThan':
      return num > value
    case 'lessThan':
      return num < value
    default:
      return false
  }
}

/**
 * Match boolean value with operator
 */
function matchBoolean(bool: boolean, operator: RuleOperator, value: boolean): boolean {
  switch (operator) {
    case 'is':
      return bool === value
    case 'isNot':
      return bool !== value
    default:
      return false
  }
}

/**
 * Check if email matches all rule conditions
 */
export function matchesRule(email: Email, rule: Rule): boolean {
  if (!rule.enabled) return false
  if (rule.conditions.length === 0) return false

  if (rule.conditionLogic === 'and') {
    return rule.conditions.every(c => matchesCondition(email, c))
  } else {
    return rule.conditions.some(c => matchesCondition(email, c))
  }
}

/**
 * Apply a rule action to an email
 */
export function applyAction(email: Email, action: RuleAction): Email {
  switch (action.type) {
    case 'move':
      return { ...email, mailbox: (action.value as Mailbox) || 'inbox' }

    case 'delete':
      return { ...email, mailbox: 'trash' }

    case 'archive':
      return { ...email, mailbox: 'archive' }

    case 'markRead':
      return { ...email, unread: false, isRead: true }

    case 'markUnread':
      return { ...email, unread: true, isRead: false }

    case 'star':
      return { ...email, starred: true }

    case 'unstar':
      return { ...email, starred: false }

    case 'addLabel':
      if (!action.value) return email
      const label: Label = JSON.parse(action.value)
      return {
        ...email,
        labels: [...(email.labels || []), label]
      }

    case 'removeLabel':
      if (!action.value) return email
      return {
        ...email,
        labels: (email.labels || []).filter(l => l.name !== action.value)
      }

    case 'setPriority':
      return { ...email, priority: action.value as Priority }

    default:
      return email
  }
}

/**
 * Apply a rule to an email
 */
export function applyRule(email: Email, rule: Rule): Email {
  if (!matchesRule(email, rule)) return email

  let result = email

  // Apply all actions in sequence
  for (const action of rule.actions) {
    result = applyAction(result, action)
  }

  // Update rule stats
  rule.lastRun = new Date().toISOString()
  rule.matchCount++

  return result
}

/**
 * Apply all rules to an email
 */
export function applyRules(email: Email): Email {
  let result = email
  const enabledRules = getEnabledRules()

  for (const rule of enabledRules) {
    const before = result
    result = applyRule(result, rule)

    // Check if email matched and rule wants to stop processing
    if (result !== before && rule.stopProcessing) {
      break
    }
  }

  return result
}

/**
 * Apply rules to multiple emails
 */
export function applyRulesToEmails(emails: Email[]): Email[] {
  return emails.map(email => applyRules(email))
}

/**
 * Validate rule conditions
 */
export function validateRule(rule: Rule): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!rule.name || rule.name.trim().length === 0) {
    errors.push('Rule name is required')
  }

  if (rule.conditions.length === 0) {
    errors.push('At least one condition is required')
  }

  if (rule.actions.length === 0) {
    errors.push('At least one action is required')
  }

  // Validate each condition has a value
  rule.conditions.forEach((cond, i) => {
    if (cond.value === undefined || cond.value === null) {
      errors.push(`Condition ${i + 1} is missing a value`)
    }
  })

  // Validate actions that require values
  rule.actions.forEach((action, i) => {
    if (['move', 'addLabel', 'setPriority', 'forward'].includes(action.type)) {
      if (!action.value) {
        errors.push(`Action ${i + 1} (${action.type}) requires a value`)
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Test a rule against sample emails
 */
export function testRule(rule: Rule, emails: Email[]): {
  matches: Email[]
  processed: Email[]
} {
  const matches: Email[] = []
  const processed: Email[] = []

  emails.forEach(email => {
    if (matchesRule(email, rule)) {
      matches.push(email)
      processed.push(applyRule(email, rule))
    }
  })

  return { matches, processed }
}

/**
 * Get rules that match an email
 */
export function getMatchingRules(email: Email): Rule[] {
  return getEnabledRules().filter(rule => matchesRule(email, rule))
}

/**
 * Export rules as JSON
 */
export function exportRules(): string {
  return JSON.stringify(getAllRules(), null, 2)
}

/**
 * Import rules from JSON
 */
export function importRules(json: string): boolean {
  try {
    const imported = JSON.parse(json)

    if (!Array.isArray(imported)) return false

    imported.forEach((rule: Rule) => {
      const validation = validateRule(rule)
      if (validation.valid) {
        registerRule(rule)
      }
    })

    return true
  } catch {
    return false
  }
}

/**
 * Clear all rules
 */
export function clearAllRules(): void {
  rules.clear()
}

/**
 * Get rule statistics
 */
export function getRuleStats(): {
  total: number
  enabled: number
  disabled: number
  totalMatches: number
  mostUsedRule?: Rule
} {
  const allRules = getAllRules()
  const enabled = allRules.filter(r => r.enabled).length
  const totalMatches = allRules.reduce((sum, r) => sum + r.matchCount, 0)
  const mostUsed = allRules.reduce((max, r) =>
    r.matchCount > max.matchCount ? r : max
  , allRules[0])

  return {
    total: allRules.length,
    enabled,
    disabled: allRules.length - enabled,
    totalMatches,
    mostUsedRule: mostUsed
  }
}

/**
 * Duplicate a rule
 */
export function duplicateRule(id: string): Rule | null {
  const original = rules.get(id)
  if (!original) return null

  const duplicate: Rule = {
    ...original,
    id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${original.name} (Copy)`,
    createdAt: new Date().toISOString(),
    matchCount: 0,
    lastRun: undefined
  }

  registerRule(duplicate)
  return duplicate
}

/**
 * Update rule priority
 */
export function updateRulePriority(id: string, priority: number): boolean {
  const rule = rules.get(id)
  if (!rule) return false

  rule.priority = priority
  return true
}

/**
 * Create common rule presets
 */
export function createPresetRule(preset: 'newsletter' | 'spam' | 'important' | 'auto-archive'): Rule {
  switch (preset) {
    case 'newsletter':
      return createRule(
        'Auto-archive newsletters',
        [
          { type: 'body', operator: 'contains', value: 'unsubscribe' },
          { type: 'body', operator: 'contains', value: 'newsletter' }
        ],
        [{ type: 'archive' }],
        'and'
      )

    case 'spam':
      return createRule(
        'Delete spam',
        [
          { type: 'subject', operator: 'contains', value: 'congratulations you won' }
        ],
        [{ type: 'delete' }]
      )

    case 'important':
      return createRule(
        'Star important emails',
        [
          { type: 'from', operator: 'contains', value: 'boss@' },
          { type: 'subject', operator: 'contains', value: 'urgent' }
        ],
        [
          { type: 'star' },
          { type: 'setPriority', value: 'high' }
        ],
        'or'
      )

    case 'auto-archive':
      return createRule(
        'Auto-archive old emails',
        [
          { type: 'olderThan', operator: 'greaterThan', value: 30 },
          { type: 'isUnread', operator: 'is', value: false }
        ],
        [{ type: 'archive' }],
        'and'
      )

    default:
      return createRule('New Rule', [], [])
  }
}
