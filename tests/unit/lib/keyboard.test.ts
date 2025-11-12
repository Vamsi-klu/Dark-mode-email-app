import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerShortcut,
  unregisterShortcut,
  getShortcut,
  getAllShortcuts,
  getShortcutsByContext,
  findShortcutByKey,
  findConflictingShortcut,
  formatShortcut,
  formatShortcutKeys,
  enableShortcuts,
  disableShortcuts,
  areShortcutsEnabled,
  enableShortcut,
  disableShortcut,
  loadPreset,
  exportShortcuts,
  importShortcuts,
  getShortcutsGrouped,
  createCustomShortcut,
  updateShortcutKeys,
  resetToDefaults,
  clearAllShortcuts,
  getShortcutHint,
  initializeShortcuts,
  type Shortcut,
  type ShortcutKey
} from 'src/lib/keyboard'

describe('keyboard shortcuts utility', () => {
  beforeEach(() => {
    clearAllShortcuts()
    enableShortcuts()
  })

  describe('registerShortcut', () => {
    it('registers a new shortcut', () => {
      const shortcut: Shortcut = {
        id: 'test',
        name: 'Test',
        description: 'Test shortcut',
        keys: [{ key: 't' }],
        action: 'compose',
        enabled: true
      }

      registerShortcut(shortcut)
      expect(getShortcut('test')).toEqual(shortcut)
    })

    it('allows multiple shortcuts', () => {
      registerShortcut({
        id: 's1',
        name: 'S1',
        description: 'First',
        keys: [{ key: 'a' }],
        action: 'compose',
        enabled: true
      })

      registerShortcut({
        id: 's2',
        name: 'S2',
        description: 'Second',
        keys: [{ key: 'b' }],
        action: 'reply',
        enabled: true
      })

      expect(getAllShortcuts()).toHaveLength(2)
    })
  })

  describe('unregisterShortcut', () => {
    it('removes a shortcut', () => {
      const shortcut: Shortcut = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: [{ key: 't' }],
        action: 'compose',
        enabled: true
      }

      registerShortcut(shortcut)
      expect(unregisterShortcut('test')).toBe(true)
      expect(getShortcut('test')).toBeUndefined()
    })

    it('returns false for non-existent shortcut', () => {
      expect(unregisterShortcut('non-existent')).toBe(false)
    })
  })

  describe('getShortcutsByContext', () => {
    it('filters shortcuts by context', () => {
      registerShortcut({
        id: 's1',
        name: 'S1',
        description: 'Global',
        keys: [{ key: 'a' }],
        action: 'compose',
        context: 'global',
        enabled: true
      })

      registerShortcut({
        id: 's2',
        name: 'S2',
        description: 'Mail view',
        keys: [{ key: 'b' }],
        action: 'reply',
        context: 'mailView',
        enabled: true
      })

      const mailViewShortcuts = getShortcutsByContext('mailView')
      expect(mailViewShortcuts).toHaveLength(2) // Includes global
    })

    it('includes global shortcuts in all contexts', () => {
      registerShortcut({
        id: 'global',
        name: 'Global',
        description: 'Global',
        keys: [{ key: 'g' }],
        action: 'help',
        context: 'global',
        enabled: true
      })

      expect(getShortcutsByContext('mailList')).toHaveLength(1)
      expect(getShortcutsByContext('mailView')).toHaveLength(1)
      expect(getShortcutsByContext('composer')).toHaveLength(1)
    })
  })

  describe('findShortcutByKey', () => {
    beforeEach(() => {
      registerShortcut({
        id: 'compose',
        name: 'Compose',
        description: 'Compose email',
        keys: [{ key: 'c' }],
        action: 'compose',
        context: 'global',
        enabled: true
      })

      registerShortcut({
        id: 'reply',
        name: 'Reply',
        description: 'Reply',
        keys: [{ key: 'r', ctrl: true }],
        action: 'reply',
        context: 'mailView',
        enabled: true
      })
    })

    it('finds shortcut by simple key', () => {
      const found = findShortcutByKey('c')
      expect(found?.id).toBe('compose')
    })

    it('finds shortcut with modifiers', () => {
      const found = findShortcutByKey('r', true, false, false, false, 'mailView')
      expect(found?.id).toBe('reply')
    })

    it('returns undefined for non-existent key', () => {
      const found = findShortcutByKey('z')
      expect(found).toBeUndefined()
    })

    it('respects enabled flag', () => {
      disableShortcut('compose')
      const found = findShortcutByKey('c')
      expect(found).toBeUndefined()
    })

    it('is case insensitive', () => {
      const found1 = findShortcutByKey('C')
      const found2 = findShortcutByKey('c')
      expect(found1?.id).toBe(found2?.id)
    })
  })

  describe('findConflictingShortcut', () => {
    it('detects conflicting shortcuts', () => {
      registerShortcut({
        id: 'existing',
        name: 'Existing',
        description: 'Existing',
        keys: [{ key: 'a' }],
        action: 'compose',
        context: 'global',
        enabled: true
      })

      const newShortcut: Shortcut = {
        id: 'new',
        name: 'New',
        description: 'New',
        keys: [{ key: 'a' }],
        action: 'reply',
        context: 'global',
        enabled: true
      }

      const conflict = findConflictingShortcut(newShortcut)
      expect(conflict?.id).toBe('existing')
    })

    it('allows same key in different contexts', () => {
      registerShortcut({
        id: 'existing',
        name: 'Existing',
        description: 'Existing',
        keys: [{ key: 'a' }],
        action: 'compose',
        context: 'mailList',
        enabled: true
      })

      const newShortcut: Shortcut = {
        id: 'new',
        name: 'New',
        description: 'New',
        keys: [{ key: 'a' }],
        action: 'reply',
        context: 'mailView',
        enabled: true
      }

      const conflict = findConflictingShortcut(newShortcut)
      expect(conflict).toBeNull()
    })

    it('returns null when no conflict', () => {
      const shortcut: Shortcut = {
        id: 'unique',
        name: 'Unique',
        description: 'Unique',
        keys: [{ key: 'u' }],
        action: 'compose',
        enabled: true
      }

      expect(findConflictingShortcut(shortcut)).toBeNull()
    })
  })

  describe('formatShortcut', () => {
    it('formats simple key', () => {
      const key: ShortcutKey = { key: 'a' }
      expect(formatShortcut(key)).toBe('A')
    })

    it('formats key with ctrl', () => {
      const key: ShortcutKey = { key: 'a', ctrl: true }
      expect(formatShortcut(key)).toBe('Ctrl+A')
    })

    it('formats key with multiple modifiers', () => {
      const key: ShortcutKey = { key: 'a', ctrl: true, shift: true }
      expect(formatShortcut(key)).toBe('Ctrl+Shift+A')
    })

    it('formats key with alt', () => {
      const key: ShortcutKey = { key: 'a', alt: true }
      expect(formatShortcut(key)).toBe('Alt+A')
    })

    it('formats special keys', () => {
      const key: ShortcutKey = { key: 'Escape' }
      expect(formatShortcut(key)).toBe('ESCAPE')
    })
  })

  describe('formatShortcutKeys', () => {
    it('formats single key', () => {
      const shortcut: Shortcut = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: [{ key: 'a' }],
        action: 'compose',
        enabled: true
      }

      expect(formatShortcutKeys(shortcut)).toBe('A')
    })

    it('formats multiple keys with or', () => {
      const shortcut: Shortcut = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: [{ key: 'a' }, { key: 'b' }],
        action: 'compose',
        enabled: true
      }

      expect(formatShortcutKeys(shortcut)).toBe('A or B')
    })
  })

  describe('enable/disable shortcuts', () => {
    it('enables and disables all shortcuts', () => {
      expect(areShortcutsEnabled()).toBe(true)

      disableShortcuts()
      expect(areShortcutsEnabled()).toBe(false)

      enableShortcuts()
      expect(areShortcutsEnabled()).toBe(true)
    })

    it('enables and disables specific shortcuts', () => {
      const shortcut: Shortcut = {
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: [{ key: 't' }],
        action: 'compose',
        enabled: true
      }

      registerShortcut(shortcut)

      disableShortcut('test')
      expect(getShortcut('test')?.enabled).toBe(false)

      enableShortcut('test')
      expect(getShortcut('test')?.enabled).toBe(true)
    })
  })

  describe('loadPreset', () => {
    it('loads default preset', () => {
      loadPreset('default')
      const shortcuts = getAllShortcuts()
      expect(shortcuts.length).toBeGreaterThan(0)
    })

    it('loads gmail preset', () => {
      loadPreset('gmail')
      const shortcuts = getAllShortcuts()
      expect(shortcuts.some(s => s.id === 'compose')).toBe(true)
    })

    it('loads outlook preset', () => {
      loadPreset('outlook')
      const shortcuts = getAllShortcuts()
      expect(shortcuts.some(s => s.id === 'compose')).toBe(true)
    })

    it('loads vim preset', () => {
      loadPreset('vim')
      const shortcuts = getAllShortcuts()
      expect(shortcuts.some(s => s.id === 'nextEmail')).toBe(true)
    })

    it('clears existing shortcuts when loading preset', () => {
      registerShortcut({
        id: 'custom',
        name: 'Custom',
        description: 'Custom',
        keys: [{ key: 'x' }],
        action: 'compose',
        enabled: true
      })

      loadPreset('default')
      expect(getShortcut('custom')).toBeUndefined()
    })
  })

  describe('export/import shortcuts', () => {
    it('exports shortcuts as JSON', () => {
      registerShortcut({
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: [{ key: 't' }],
        action: 'compose',
        enabled: true
      })

      const exported = exportShortcuts()
      expect(() => JSON.parse(exported)).not.toThrow()
    })

    it('imports shortcuts from JSON', () => {
      registerShortcut({
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: [{ key: 't' }],
        action: 'compose',
        enabled: true
      })

      const exported = exportShortcuts()
      disableShortcut('test')

      const success = importShortcuts(exported)
      expect(success).toBe(true)
      expect(getShortcut('test')?.enabled).toBe(true)
    })

    it('returns false for invalid JSON', () => {
      expect(importShortcuts('invalid json')).toBe(false)
    })
  })

  describe('getShortcutsGrouped', () => {
    it('groups shortcuts by context', () => {
      registerShortcut({
        id: 'global1',
        name: 'Global',
        description: 'Global',
        keys: [{ key: 'a' }],
        action: 'compose',
        context: 'global',
        enabled: true
      })

      registerShortcut({
        id: 'mailList1',
        name: 'Mail List',
        description: 'Mail List',
        keys: [{ key: 'b' }],
        action: 'nextEmail',
        context: 'mailList',
        enabled: true
      })

      const grouped = getShortcutsGrouped()
      expect(grouped.global).toHaveLength(1)
      expect(grouped.mailList).toHaveLength(1)
    })
  })

  describe('createCustomShortcut', () => {
    it('creates a custom shortcut', () => {
      const shortcut = createCustomShortcut(
        'custom',
        'Custom',
        'Custom shortcut',
        [{ key: 'x' }],
        'compose'
      )

      expect(shortcut.id).toBe('custom')
      expect(shortcut.enabled).toBe(true)
    })

    it('sets context to global by default', () => {
      const shortcut = createCustomShortcut(
        'custom',
        'Custom',
        'Custom',
        [{ key: 'x' }],
        'compose'
      )

      expect(shortcut.context).toBe('global')
    })

    it('allows custom context', () => {
      const shortcut = createCustomShortcut(
        'custom',
        'Custom',
        'Custom',
        [{ key: 'x' }],
        'compose',
        'mailView'
      )

      expect(shortcut.context).toBe('mailView')
    })
  })

  describe('updateShortcutKeys', () => {
    it('updates shortcut keys', () => {
      registerShortcut({
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: [{ key: 't' }],
        action: 'compose',
        enabled: true
      })

      const success = updateShortcutKeys('test', [{ key: 'x' }])
      expect(success).toBe(true)
      expect(getShortcut('test')?.keys[0].key).toBe('x')
    })

    it('returns false for non-existent shortcut', () => {
      const success = updateShortcutKeys('non-existent', [{ key: 'x' }])
      expect(success).toBe(false)
    })

    it('prevents conflicts', () => {
      registerShortcut({
        id: 'existing',
        name: 'Existing',
        description: 'Existing',
        keys: [{ key: 'a' }],
        action: 'compose',
        context: 'global',
        enabled: true
      })

      registerShortcut({
        id: 'test',
        name: 'Test',
        description: 'Test',
        keys: [{ key: 't' }],
        action: 'reply',
        context: 'global',
        enabled: true
      })

      // Try to update test to use same key as existing
      const success = updateShortcutKeys('test', [{ key: 'a' }])
      expect(success).toBe(false)
    })
  })

  describe('resetToDefaults', () => {
    it('resets to default shortcuts', () => {
      clearAllShortcuts()
      resetToDefaults()

      const shortcuts = getAllShortcuts()
      expect(shortcuts.length).toBeGreaterThan(0)
    })
  })

  describe('clearAllShortcuts', () => {
    it('clears all shortcuts', () => {
      loadPreset('default')
      expect(getAllShortcuts().length).toBeGreaterThan(0)

      clearAllShortcuts()
      expect(getAllShortcuts()).toHaveLength(0)
    })
  })

  describe('getShortcutHint', () => {
    it('returns hint for action', () => {
      registerShortcut({
        id: 'compose',
        name: 'Compose',
        description: 'Compose',
        keys: [{ key: 'c' }],
        action: 'compose',
        enabled: true
      })

      const hint = getShortcutHint('compose')
      expect(hint).toBe('C')
    })

    it('returns empty string for non-existent action', () => {
      const hint = getShortcutHint('archive')
      expect(hint).toBe('')
    })

    it('returns first key when multiple keys exist', () => {
      registerShortcut({
        id: 'delete',
        name: 'Delete',
        description: 'Delete',
        keys: [{ key: '#' }, { key: 'Delete' }],
        action: 'delete',
        enabled: true
      })

      const hint = getShortcutHint('delete')
      expect(hint).toBe('#')
    })
  })

  describe('initializeShortcuts', () => {
    it('loads defaults if no shortcuts exist', () => {
      clearAllShortcuts()
      initializeShortcuts()

      expect(getAllShortcuts().length).toBeGreaterThan(0)
    })

    it('does not reload if shortcuts already exist', () => {
      registerShortcut({
        id: 'custom',
        name: 'Custom',
        description: 'Custom',
        keys: [{ key: 'x' }],
        action: 'compose',
        enabled: true
      })

      initializeShortcuts()
      expect(getShortcut('custom')).toBeDefined()
    })
  })

  describe('preset shortcuts', () => {
    describe('gmail preset', () => {
      beforeEach(() => {
        loadPreset('gmail')
      })

      it('includes compose shortcut', () => {
        expect(getShortcut('compose')).toBeDefined()
      })

      it('includes reply shortcut', () => {
        expect(getShortcut('reply')).toBeDefined()
      })

      it('includes archive shortcut', () => {
        expect(getShortcut('archive')).toBeDefined()
      })

      it('uses j/k for navigation', () => {
        const next = getShortcut('nextEmail')
        expect(next?.keys.some(k => k.key === 'j')).toBe(true)
      })
    })

    describe('outlook preset', () => {
      beforeEach(() => {
        loadPreset('outlook')
      })

      it('uses ctrl+n for new email', () => {
        const compose = getShortcut('compose')
        expect(compose?.keys[0].ctrl).toBe(true)
        expect(compose?.keys[0].key).toBe('n')
      })

      it('uses ctrl+r for reply', () => {
        const reply = getShortcut('reply')
        expect(reply?.keys[0].ctrl).toBe(true)
        expect(reply?.keys[0].key).toBe('r')
      })
    })

    describe('vim preset', () => {
      beforeEach(() => {
        loadPreset('vim')
      })

      it('uses j/k for navigation', () => {
        const next = getShortcut('nextEmail')
        const prev = getShortcut('prevEmail')

        expect(next?.keys[0].key).toBe('j')
        expect(prev?.keys[0].key).toBe('k')
      })

      it('uses i for compose', () => {
        const compose = getShortcut('compose')
        expect(compose?.keys[0].key).toBe('i')
      })
    })
  })
})
