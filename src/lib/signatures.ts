// Email signature management system

import type { EmailSignature } from '../types/extended'

const STORAGE_KEY = 'novamail:signatures'

/**
 * Get all signatures from localStorage
 */
export function getAllSignatures(): EmailSignature[] {
  /* c8 ignore next 2 */
  if (typeof localStorage === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save signatures to localStorage
 */
export function saveSignatures(signatures: EmailSignature[]): void {
  /* c8 ignore next */
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signatures))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Create a new signature
 */
export function createSignature(name: string, content: string, isDefault: boolean = false): EmailSignature {
  return {
    id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    content,
    isDefault
  }
}

/**
 * Add signature to storage
 */
export function addSignature(signature: EmailSignature): EmailSignature[] {
  const signatures = getAllSignatures()

  // If this is default, unset other defaults
  if (signature.isDefault) {
    signatures.forEach(sig => { sig.isDefault = false })
  }

  signatures.push(signature)
  saveSignatures(signatures)
  return signatures
}

/**
 * Update existing signature
 */
export function updateSignature(id: string, updates: Partial<Omit<EmailSignature, 'id'>>): EmailSignature[] {
  const signatures = getAllSignatures()
  const index = signatures.findIndex(sig => sig.id === id)

  if (index === -1) return signatures

  // If setting as default, unset other defaults
  if (updates.isDefault) {
    signatures.forEach(sig => { sig.isDefault = false })
  }

  signatures[index] = { ...signatures[index], ...updates }
  saveSignatures(signatures)
  return signatures
}

/**
 * Delete signature
 */
export function deleteSignature(id: string): EmailSignature[] {
  const signatures = getAllSignatures().filter(sig => sig.id !== id)
  saveSignatures(signatures)
  return signatures
}

/**
 * Get default signature
 */
export function getDefaultSignature(): EmailSignature | null {
  const signatures = getAllSignatures()
  return signatures.find(sig => sig.isDefault) || null
}

/**
 * Set signature as default
 */
export function setDefaultSignature(id: string): EmailSignature[] {
  return updateSignature(id, { isDefault: true })
}

/**
 * Validate signature name
 */
export function validateSignatureName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: 'Signature name cannot be empty' }
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Signature name must be at least 2 characters' }
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Signature name must be less than 50 characters' }
  }

  return { valid: true }
}

/**
 * Validate signature content
 */
export function validateSignatureContent(content: string): { valid: boolean; error?: string } {
  if (!content.trim()) {
    return { valid: false, error: 'Signature content cannot be empty' }
  }

  if (content.length > 5000) {
    return { valid: false, error: 'Signature content must be less than 5000 characters' }
  }

  return { valid: true }
}

/**
 * Format signature for email
 */
export function formatSignature(signature: EmailSignature): string {
  return `\n\n--\n${signature.content}`
}

/**
 * Check if signature name is unique
 */
export function isSignatureNameUnique(name: string, excludeId?: string): boolean {
  const signatures = getAllSignatures()
  return !signatures.some(sig =>
    sig.name.toLowerCase() === name.toLowerCase() && sig.id !== excludeId
  )
}
