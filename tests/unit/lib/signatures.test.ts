import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getAllSignatures,
  saveSignatures,
  createSignature,
  addSignature,
  updateSignature,
  deleteSignature,
  getDefaultSignature,
  setDefaultSignature,
  validateSignatureName,
  validateSignatureContent,
  formatSignature,
  isSignatureNameUnique
} from 'src/lib/signatures'
import type { EmailSignature } from 'src/types/extended'

describe('signatures utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('createSignature', () => {
    it('creates signature with generated ID', () => {
      const sig = createSignature('Work', 'Best regards,\nJohn')
      expect(sig.id).toMatch(/^sig-/)
      expect(sig.name).toBe('Work')
      expect(sig.content).toBe('Best regards,\nJohn')
      expect(sig.isDefault).toBe(false)
    })

    it('creates default signature', () => {
      const sig = createSignature('Personal', 'Cheers', true)
      expect(sig.isDefault).toBe(true)
    })

    it('generates unique IDs', () => {
      const sig1 = createSignature('Sig1', 'Content1')
      const sig2 = createSignature('Sig2', 'Content2')
      expect(sig1.id).not.toBe(sig2.id)
    })
  })

  describe('addSignature', () => {
    it('adds signature to storage', () => {
      const sig = createSignature('Work', 'Best regards')
      addSignature(sig)

      const signatures = getAllSignatures()
      expect(signatures).toHaveLength(1)
      expect(signatures[0].id).toBe(sig.id)
    })

    it('unsets other defaults when adding default signature', () => {
      const sig1 = createSignature('Sig1', 'Content1', true)
      const sig2 = createSignature('Sig2', 'Content2', true)

      addSignature(sig1)
      addSignature(sig2)

      const signatures = getAllSignatures()
      expect(signatures.filter(s => s.isDefault)).toHaveLength(1)
      expect(signatures.find(s => s.id === sig2.id)?.isDefault).toBe(true)
    })

    it('allows multiple non-default signatures', () => {
      const sig1 = createSignature('Sig1', 'Content1', false)
      const sig2 = createSignature('Sig2', 'Content2', false)

      addSignature(sig1)
      addSignature(sig2)

      const signatures = getAllSignatures()
      expect(signatures).toHaveLength(2)
    })
  })

  describe('updateSignature', () => {
    it('updates signature name', () => {
      const sig = createSignature('Old Name', 'Content')
      addSignature(sig)

      updateSignature(sig.id, { name: 'New Name' })

      const signatures = getAllSignatures()
      expect(signatures[0].name).toBe('New Name')
    })

    it('updates signature content', () => {
      const sig = createSignature('Name', 'Old Content')
      addSignature(sig)

      updateSignature(sig.id, { content: 'New Content' })

      const signatures = getAllSignatures()
      expect(signatures[0].content).toBe('New Content')
    })

    it('unsets other defaults when setting as default', () => {
      const sig1 = createSignature('Sig1', 'Content1', true)
      const sig2 = createSignature('Sig2', 'Content2', false)

      addSignature(sig1)
      addSignature(sig2)

      updateSignature(sig2.id, { isDefault: true })

      const signatures = getAllSignatures()
      expect(signatures.find(s => s.id === sig1.id)?.isDefault).toBe(false)
      expect(signatures.find(s => s.id === sig2.id)?.isDefault).toBe(true)
    })

    it('returns unchanged signatures for non-existent ID', () => {
      const sig = createSignature('Sig', 'Content')
      addSignature(sig)

      const result = updateSignature('non-existent', { name: 'New' })
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Sig')
    })
  })

  describe('deleteSignature', () => {
    it('deletes signature by ID', () => {
      const sig1 = createSignature('Sig1', 'Content1')
      const sig2 = createSignature('Sig2', 'Content2')

      addSignature(sig1)
      addSignature(sig2)

      deleteSignature(sig1.id)

      const signatures = getAllSignatures()
      expect(signatures).toHaveLength(1)
      expect(signatures[0].id).toBe(sig2.id)
    })

    it('handles deleting non-existent signature', () => {
      const sig = createSignature('Sig', 'Content')
      addSignature(sig)

      deleteSignature('non-existent')

      const signatures = getAllSignatures()
      expect(signatures).toHaveLength(1)
    })
  })

  describe('getDefaultSignature', () => {
    it('returns default signature', () => {
      const sig1 = createSignature('Sig1', 'Content1', false)
      const sig2 = createSignature('Sig2', 'Content2', true)

      addSignature(sig1)
      addSignature(sig2)

      const defaultSig = getDefaultSignature()
      expect(defaultSig?.id).toBe(sig2.id)
    })

    it('returns null when no default', () => {
      const sig = createSignature('Sig', 'Content', false)
      addSignature(sig)

      expect(getDefaultSignature()).toBeNull()
    })

    it('returns null when no signatures', () => {
      expect(getDefaultSignature()).toBeNull()
    })
  })

  describe('setDefaultSignature', () => {
    it('sets signature as default', () => {
      const sig = createSignature('Sig', 'Content', false)
      addSignature(sig)

      setDefaultSignature(sig.id)

      const defaultSig = getDefaultSignature()
      expect(defaultSig?.id).toBe(sig.id)
    })
  })

  describe('validateSignatureName', () => {
    it('validates correct names', () => {
      expect(validateSignatureName('Work').valid).toBe(true)
      expect(validateSignatureName('Personal Email').valid).toBe(true)
      expect(validateSignatureName('AB').valid).toBe(true)
    })

    it('rejects empty names', () => {
      const result = validateSignatureName('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('rejects whitespace-only names', () => {
      const result = validateSignatureName('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('rejects names shorter than 2 characters', () => {
      const result = validateSignatureName('A')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('at least 2')
    })

    it('rejects names longer than 50 characters', () => {
      const result = validateSignatureName('A'.repeat(51))
      expect(result.valid).toBe(false)
      expect(result.error).toContain('less than 50')
    })
  })

  describe('validateSignatureContent', () => {
    it('validates correct content', () => {
      expect(validateSignatureContent('Best regards,\nJohn').valid).toBe(true)
      expect(validateSignatureContent('X').valid).toBe(true)
    })

    it('rejects empty content', () => {
      const result = validateSignatureContent('')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('rejects whitespace-only content', () => {
      const result = validateSignatureContent('   ')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('empty')
    })

    it('rejects content longer than 5000 characters', () => {
      const result = validateSignatureContent('A'.repeat(5001))
      expect(result.valid).toBe(false)
      expect(result.error).toContain('less than 5000')
    })
  })

  describe('formatSignature', () => {
    it('formats signature with separator', () => {
      const sig = createSignature('Work', 'Best regards,\nJohn')
      const formatted = formatSignature(sig)
      expect(formatted).toBe('\n\n--\nBest regards,\nJohn')
    })

    it('handles single-line signatures', () => {
      const sig = createSignature('Simple', 'Cheers')
      const formatted = formatSignature(sig)
      expect(formatted).toBe('\n\n--\nCheers')
    })
  })

  describe('isSignatureNameUnique', () => {
    it('returns true for unique name', () => {
      const sig = createSignature('Existing', 'Content')
      addSignature(sig)

      expect(isSignatureNameUnique('New Name')).toBe(true)
    })

    it('returns false for duplicate name', () => {
      const sig = createSignature('Existing', 'Content')
      addSignature(sig)

      expect(isSignatureNameUnique('Existing')).toBe(false)
    })

    it('is case-insensitive', () => {
      const sig = createSignature('Work', 'Content')
      addSignature(sig)

      expect(isSignatureNameUnique('work')).toBe(false)
      expect(isSignatureNameUnique('WORK')).toBe(false)
    })

    it('excludes specific ID when checking', () => {
      const sig = createSignature('Name', 'Content')
      addSignature(sig)

      expect(isSignatureNameUnique('Name', sig.id)).toBe(true)
    })

    it('returns true when no signatures exist', () => {
      expect(isSignatureNameUnique('Any Name')).toBe(true)
    })
  })

  describe('localStorage integration', () => {
    it('persists signatures across instances', () => {
      const sig = createSignature('Test', 'Content')
      addSignature(sig)

      // Simulate new instance
      const retrieved = getAllSignatures()
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].id).toBe(sig.id)
    })

    it('handles corrupted localStorage data', () => {
      localStorage.setItem('novamail:signatures', 'invalid json')
      expect(getAllSignatures()).toEqual([])
    })
  })
})
