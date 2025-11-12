// Email template management system

import type { EmailTemplate } from '../types/extended'

const STORAGE_KEY = 'novamail:templates'

/**
 * Get all templates from localStorage
 */
export function getAllTemplates(): EmailTemplate[] {
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
 * Save templates to localStorage
 */
export function saveTemplates(templates: EmailTemplate[]): void {
  /* c8 ignore next */
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Create a new template
 */
export function createTemplate(
  name: string,
  subject: string,
  body: string,
  category?: string
): EmailTemplate {
  return {
    id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    subject,
    body,
    category,
    usageCount: 0
  }
}

/**
 * Add template to storage
 */
export function addTemplate(template: EmailTemplate): EmailTemplate[] {
  const templates = getAllTemplates()
  templates.push(template)
  saveTemplates(templates)
  return templates
}

/**
 * Update existing template
 */
export function updateTemplate(id: string, updates: Partial<Omit<EmailTemplate, 'id'>>): EmailTemplate[] {
  const templates = getAllTemplates()
  const index = templates.findIndex(tpl => tpl.id === id)

  if (index === -1) return templates

  templates[index] = { ...templates[index], ...updates }
  saveTemplates(templates)
  return templates
}

/**
 * Delete template
 */
export function deleteTemplate(id: string): EmailTemplate[] {
  const templates = getAllTemplates().filter(tpl => tpl.id !== id)
  saveTemplates(templates)
  return templates
}

/**
 * Increment template usage count
 */
export function useTemplate(id: string): EmailTemplate | null {
  const templates = getAllTemplates()
  const template = templates.find(tpl => tpl.id === id)

  if (!template) return null

  template.usageCount = (template.usageCount || 0) + 1
  saveTemplates(templates)
  return template
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): EmailTemplate[] {
  return getAllTemplates().filter(tpl => tpl.category === category)
}

/**
 * Get most used templates
 */
export function getMostUsedTemplates(limit: number = 5): EmailTemplate[] {
  return getAllTemplates()
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit)
}

/**
 * Search templates by name, subject, or body
 */
export function searchTemplates(query: string): EmailTemplate[] {
  if (!query.trim()) return getAllTemplates()

  const q = query.toLowerCase()
  return getAllTemplates().filter(tpl =>
    tpl.name.toLowerCase().includes(q) ||
    tpl.subject.toLowerCase().includes(q) ||
    tpl.body.toLowerCase().includes(q)
  )
}

/**
 * Validate template name
 */
export function validateTemplateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: 'Template name cannot be empty' }
  }

  if (trimmed.length < 2) {
    return { valid: false, error: 'Template name must be at least 2 characters' }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Template name must be less than 100 characters' }
  }

  return { valid: true }
}

/**
 * Validate template subject
 */
export function validateTemplateSubject(subject: string): { valid: boolean; error?: string } {
  if (subject.length > 200) {
    return { valid: false, error: 'Subject must be less than 200 characters' }
  }

  return { valid: true }
}

/**
 * Validate template body
 */
export function validateTemplateBody(body: string): { valid: boolean; error?: string } {
  if (!body.trim()) {
    return { valid: false, error: 'Template body cannot be empty' }
  }

  if (body.length > 10000) {
    return { valid: false, error: 'Template body must be less than 10000 characters' }
  }

  return { valid: true }
}

/**
 * Check if template name is unique
 */
export function isTemplateNameUnique(name: string, excludeId?: string): boolean {
  const templates = getAllTemplates()
  return !templates.some(tpl =>
    tpl.name.toLowerCase() === name.toLowerCase() && tpl.id !== excludeId
  )
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>()
  getAllTemplates().forEach(tpl => {
    if (tpl.category) categories.add(tpl.category)
  })
  return Array.from(categories).sort()
}

/**
 * Apply template variables (e.g., {{name}}, {{date}})
 */
export function applyTemplateVariables(
  text: string,
  variables: Record<string, string>
): string {
  let result = text

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, value)
  })

  return result
}

/**
 * Extract variables from template text
 */
export function extractTemplateVariables(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g) || []
  return matches.map(match => match.replace(/[{}]/g, ''))
}
