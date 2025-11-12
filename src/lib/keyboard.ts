// Keyboard Shortcuts System - 20+ power-user features

export type ShortcutAction =
  | 'compose' | 'reply' | 'replyAll' | 'forward'
  | 'archive' | 'delete' | 'star' | 'markRead' | 'markUnread'
  | 'nextEmail' | 'prevEmail' | 'nextPage' | 'prevPage'
  | 'search' | 'help' | 'escape' | 'selectAll'
  | 'snooze' | 'label' | 'move'
  | 'toggleSidebar' | 'focusInbox' | 'focusSent' | 'focusTrash'
  | 'undo' | 'redo' | 'refresh'

export type ShortcutKey = {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean // Command on Mac, Windows key on Windows
}

export type Shortcut = {
  id: string
  name: string
  description: string
  keys: ShortcutKey[]
  action: ShortcutAction
  context?: 'global' | 'mailList' | 'mailView' | 'composer'
  enabled: boolean
}

export type ShortcutPreset = 'default' | 'gmail' | 'outlook' | 'vim'

// Registered shortcuts store
let shortcuts: Map<string, Shortcut> = new Map()
let enabled = true

/**
 * Register a keyboard shortcut
 */
export function registerShortcut(shortcut: Shortcut): void {
  // Check for conflicts
  const conflict = findConflictingShortcut(shortcut)
  if (conflict) {
    console.warn(`Shortcut conflict: ${shortcut.id} conflicts with ${conflict.id}`)
  }

  shortcuts.set(shortcut.id, shortcut)
}

/**
 * Unregister a shortcut
 */
export function unregisterShortcut(id: string): boolean {
  return shortcuts.delete(id)
}

/**
 * Get a shortcut by ID
 */
export function getShortcut(id: string): Shortcut | undefined {
  return shortcuts.get(id)
}

/**
 * Get all registered shortcuts
 */
export function getAllShortcuts(): Shortcut[] {
  return Array.from(shortcuts.values())
}

/**
 * Get shortcuts by context
 */
export function getShortcutsByContext(context: Shortcut['context']): Shortcut[] {
  return getAllShortcuts().filter(s => s.context === context || s.context === 'global')
}

/**
 * Find shortcut by key combination
 */
export function findShortcutByKey(
  key: string,
  ctrl = false,
  shift = false,
  alt = false,
  meta = false,
  context: Shortcut['context'] = 'global'
): Shortcut | undefined {
  const contextShortcuts = getShortcutsByContext(context)

  return contextShortcuts.find(shortcut => {
    if (!shortcut.enabled) return false

    return shortcut.keys.some(k =>
      k.key.toLowerCase() === key.toLowerCase() &&
      (k.ctrl === ctrl || (!k.ctrl && !ctrl)) &&
      (k.shift === shift || (!k.shift && !shift)) &&
      (k.alt === alt || (!k.alt && !alt)) &&
      (k.meta === meta || (!k.meta && !meta))
    )
  })
}

/**
 * Check if shortcut conflicts with existing ones
 */
export function findConflictingShortcut(newShortcut: Shortcut): Shortcut | null {
  const existing = getAllShortcuts()

  for (const shortcut of existing) {
    if (shortcut.id === newShortcut.id) continue
    if (shortcut.context !== newShortcut.context && shortcut.context !== 'global') continue

    // Check if any keys conflict
    for (const newKey of newShortcut.keys) {
      for (const existingKey of shortcut.keys) {
        if (keysMatch(newKey, existingKey)) {
          return shortcut
        }
      }
    }
  }

  return null
}

/**
 * Check if two shortcut keys match
 */
function keysMatch(a: ShortcutKey, b: ShortcutKey): boolean {
  return (
    a.key.toLowerCase() === b.key.toLowerCase() &&
    !!a.ctrl === !!b.ctrl &&
    !!a.shift === !!b.shift &&
    !!a.alt === !!b.alt &&
    !!a.meta === !!b.meta
  )
}

/**
 * Format shortcut key for display
 */
export function formatShortcut(key: ShortcutKey): string {
  const parts: string[] = []

  if (key.ctrl) parts.push('Ctrl')
  if (key.alt) parts.push('Alt')
  if (key.shift) parts.push('Shift')
  if (key.meta) parts.push(isMac() ? 'Cmd' : 'Win')

  parts.push(key.key.toUpperCase())

  return parts.join('+')
}

/**
 * Format all shortcut keys
 */
export function formatShortcutKeys(shortcut: Shortcut): string {
  return shortcut.keys.map(formatShortcut).join(' or ')
}

/**
 * Check if running on Mac
 */
function isMac(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

/**
 * Enable all shortcuts
 */
export function enableShortcuts(): void {
  enabled = true
}

/**
 * Disable all shortcuts
 */
export function disableShortcuts(): void {
  enabled = false
}

/**
 * Check if shortcuts are enabled
 */
export function areShortcutsEnabled(): boolean {
  return enabled
}

/**
 * Enable a specific shortcut
 */
export function enableShortcut(id: string): void {
  const shortcut = shortcuts.get(id)
  if (shortcut) {
    shortcut.enabled = true
  }
}

/**
 * Disable a specific shortcut
 */
export function disableShortcut(id: string): void {
  const shortcut = shortcuts.get(id)
  if (shortcut) {
    shortcut.enabled = false
  }
}

/**
 * Load shortcut preset
 */
export function loadPreset(preset: ShortcutPreset): void {
  // Clear existing shortcuts
  shortcuts.clear()

  switch (preset) {
    case 'gmail':
      loadGmailPreset()
      break
    case 'outlook':
      loadOutlookPreset()
      break
    case 'vim':
      loadVimPreset()
      break
    default:
      loadDefaultPreset()
  }
}

/**
 * Load default shortcuts
 */
function loadDefaultPreset(): void {
  const defaultShortcuts: Shortcut[] = [
    {
      id: 'compose',
      name: 'Compose',
      description: 'Compose new email',
      keys: [{ key: 'c' }],
      action: 'compose',
      context: 'global',
      enabled: true
    },
    {
      id: 'reply',
      name: 'Reply',
      description: 'Reply to email',
      keys: [{ key: 'r' }],
      action: 'reply',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'archive',
      name: 'Archive',
      description: 'Archive email',
      keys: [{ key: 'e' }],
      action: 'archive',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'delete',
      name: 'Delete',
      description: 'Delete email',
      keys: [{ key: '#' }, { key: 'Delete' }],
      action: 'delete',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'star',
      name: 'Star',
      description: 'Toggle star',
      keys: [{ key: 's' }],
      action: 'star',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'nextEmail',
      name: 'Next Email',
      description: 'Go to next email',
      keys: [{ key: 'j' }, { key: 'ArrowDown' }],
      action: 'nextEmail',
      context: 'mailList',
      enabled: true
    },
    {
      id: 'prevEmail',
      name: 'Previous Email',
      description: 'Go to previous email',
      keys: [{ key: 'k' }, { key: 'ArrowUp' }],
      action: 'prevEmail',
      context: 'mailList',
      enabled: true
    },
    {
      id: 'search',
      name: 'Search',
      description: 'Focus search box',
      keys: [{ key: '/' }, { key: 's', meta: true }],
      action: 'search',
      context: 'global',
      enabled: true
    },
    {
      id: 'help',
      name: 'Help',
      description: 'Show keyboard shortcuts',
      keys: [{ key: '?' }],
      action: 'help',
      context: 'global',
      enabled: true
    },
    {
      id: 'refresh',
      name: 'Refresh',
      description: 'Refresh email list',
      keys: [{ key: 'r', meta: true }],
      action: 'refresh',
      context: 'global',
      enabled: true
    }
  ]

  defaultShortcuts.forEach(registerShortcut)
}

/**
 * Load Gmail-style shortcuts
 */
function loadGmailPreset(): void {
  const gmailShortcuts: Shortcut[] = [
    {
      id: 'compose',
      name: 'Compose',
      description: 'Compose new email',
      keys: [{ key: 'c' }],
      action: 'compose',
      context: 'global',
      enabled: true
    },
    {
      id: 'reply',
      name: 'Reply',
      description: 'Reply to email',
      keys: [{ key: 'r' }],
      action: 'reply',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'replyAll',
      name: 'Reply All',
      description: 'Reply to all',
      keys: [{ key: 'a' }],
      action: 'replyAll',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'forward',
      name: 'Forward',
      description: 'Forward email',
      keys: [{ key: 'f' }],
      action: 'forward',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'archive',
      name: 'Archive',
      description: 'Archive email',
      keys: [{ key: 'e' }],
      action: 'archive',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'delete',
      name: 'Delete',
      description: 'Move to trash',
      keys: [{ key: '#' }],
      action: 'delete',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'star',
      name: 'Star',
      description: 'Toggle star',
      keys: [{ key: 's' }],
      action: 'star',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'nextEmail',
      name: 'Next',
      description: 'Newer email',
      keys: [{ key: 'j' }],
      action: 'nextEmail',
      context: 'mailList',
      enabled: true
    },
    {
      id: 'prevEmail',
      name: 'Previous',
      description: 'Older email',
      keys: [{ key: 'k' }],
      action: 'prevEmail',
      context: 'mailList',
      enabled: true
    },
    {
      id: 'search',
      name: 'Search',
      description: 'Search mail',
      keys: [{ key: '/' }],
      action: 'search',
      context: 'global',
      enabled: true
    },
    {
      id: 'markRead',
      name: 'Mark Read',
      description: 'Mark as read',
      keys: [{ key: 'i', shift: true }],
      action: 'markRead',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'markUnread',
      name: 'Mark Unread',
      description: 'Mark as unread',
      keys: [{ key: 'u', shift: true }],
      action: 'markUnread',
      context: 'mailView',
      enabled: true
    }
  ]

  gmailShortcuts.forEach(registerShortcut)
}

/**
 * Load Outlook-style shortcuts
 */
function loadOutlookPreset(): void {
  const outlookShortcuts: Shortcut[] = [
    {
      id: 'compose',
      name: 'New Email',
      description: 'Create new email',
      keys: [{ key: 'n', ctrl: true }],
      action: 'compose',
      context: 'global',
      enabled: true
    },
    {
      id: 'reply',
      name: 'Reply',
      description: 'Reply to sender',
      keys: [{ key: 'r', ctrl: true }],
      action: 'reply',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'replyAll',
      name: 'Reply All',
      description: 'Reply to all',
      keys: [{ key: 'r', ctrl: true, shift: true }],
      action: 'replyAll',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'forward',
      name: 'Forward',
      description: 'Forward email',
      keys: [{ key: 'f', ctrl: true }],
      action: 'forward',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'delete',
      name: 'Delete',
      description: 'Delete email',
      keys: [{ key: 'Delete' }, { key: 'd', ctrl: true }],
      action: 'delete',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'markRead',
      name: 'Mark Read',
      description: 'Mark as read',
      keys: [{ key: 'q', ctrl: true }],
      action: 'markRead',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'markUnread',
      name: 'Mark Unread',
      description: 'Mark as unread',
      keys: [{ key: 'u', ctrl: true }],
      action: 'markUnread',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'search',
      name: 'Search',
      description: 'Search emails',
      keys: [{ key: 'e', ctrl: true }],
      action: 'search',
      context: 'global',
      enabled: true
    }
  ]

  outlookShortcuts.forEach(registerShortcut)
}

/**
 * Load Vim-style shortcuts
 */
function loadVimPreset(): void {
  const vimShortcuts: Shortcut[] = [
    {
      id: 'nextEmail',
      name: 'Next',
      description: 'Next email',
      keys: [{ key: 'j' }],
      action: 'nextEmail',
      context: 'mailList',
      enabled: true
    },
    {
      id: 'prevEmail',
      name: 'Previous',
      description: 'Previous email',
      keys: [{ key: 'k' }],
      action: 'prevEmail',
      context: 'mailList',
      enabled: true
    },
    {
      id: 'compose',
      name: 'Compose',
      description: 'New email',
      keys: [{ key: 'i' }],
      action: 'compose',
      context: 'global',
      enabled: true
    },
    {
      id: 'delete',
      name: 'Delete',
      description: 'Delete email',
      keys: [{ key: 'd' }, { key: 'd' }], // Note: This is simplified, real vim would require sequence
      action: 'delete',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'archive',
      name: 'Archive',
      description: 'Archive email',
      keys: [{ key: 'e' }],
      action: 'archive',
      context: 'mailView',
      enabled: true
    },
    {
      id: 'search',
      name: 'Search',
      description: 'Search mode',
      keys: [{ key: '/' }],
      action: 'search',
      context: 'global',
      enabled: true
    },
    {
      id: 'escape',
      name: 'Escape',
      description: 'Exit/cancel',
      keys: [{ key: 'Escape' }],
      action: 'escape',
      context: 'global',
      enabled: true
    }
  ]

  vimShortcuts.forEach(registerShortcut)
}

/**
 * Export shortcuts configuration
 */
export function exportShortcuts(): string {
  const config = getAllShortcuts().map(s => ({
    id: s.id,
    keys: s.keys,
    enabled: s.enabled
  }))

  return JSON.stringify(config, null, 2)
}

/**
 * Import shortcuts configuration
 */
export function importShortcuts(json: string): boolean {
  try {
    const config = JSON.parse(json)

    if (!Array.isArray(config)) return false

    config.forEach(item => {
      const existing = shortcuts.get(item.id)
      if (existing) {
        existing.keys = item.keys
        existing.enabled = item.enabled
      }
    })

    return true
  } catch {
    return false
  }
}

/**
 * Get shortcuts grouped by context
 */
export function getShortcutsGrouped(): Record<string, Shortcut[]> {
  const grouped: Record<string, Shortcut[]> = {
    global: [],
    mailList: [],
    mailView: [],
    composer: []
  }

  getAllShortcuts().forEach(shortcut => {
    const context = shortcut.context || 'global'
    if (!grouped[context]) {
      grouped[context] = []
    }
    grouped[context].push(shortcut)
  })

  return grouped
}

/**
 * Create custom shortcut
 */
export function createCustomShortcut(
  id: string,
  name: string,
  description: string,
  keys: ShortcutKey[],
  action: ShortcutAction,
  context: Shortcut['context'] = 'global'
): Shortcut {
  return {
    id,
    name,
    description,
    keys,
    action,
    context,
    enabled: true
  }
}

/**
 * Update shortcut keys
 */
export function updateShortcutKeys(id: string, newKeys: ShortcutKey[]): boolean {
  const shortcut = shortcuts.get(id)
  if (!shortcut) return false

  // Create temporary shortcut to check conflicts
  const temp = { ...shortcut, keys: newKeys }
  const conflict = findConflictingShortcut(temp)

  if (conflict) {
    console.warn(`Cannot update: conflicts with ${conflict.id}`)
    return false
  }

  shortcut.keys = newKeys
  return true
}

/**
 * Reset to default shortcuts
 */
export function resetToDefaults(): void {
  loadPreset('default')
}

/**
 * Clear all shortcuts
 */
export function clearAllShortcuts(): void {
  shortcuts.clear()
}

/**
 * Get shortcut hint for action
 */
export function getShortcutHint(action: ShortcutAction, context?: Shortcut['context']): string {
  const shortcut = getAllShortcuts().find(s => s.action === action && (!context || s.context === context))

  if (!shortcut || shortcut.keys.length === 0) return ''

  return formatShortcut(shortcut.keys[0])
}

/**
 * Check if key event matches any shortcut
 */
export function matchKeyEvent(
  event: KeyboardEvent,
  context: Shortcut['context'] = 'global'
): Shortcut | undefined {
  if (!enabled) return undefined

  // Ignore shortcuts when typing in input fields
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return undefined
  }

  return findShortcutByKey(
    event.key,
    event.ctrlKey,
    event.shiftKey,
    event.altKey,
    event.metaKey,
    context
  )
}

/**
 * Initialize default shortcuts
 */
export function initializeShortcuts(): void {
  if (shortcuts.size === 0) {
    loadDefaultPreset()
  }
}
