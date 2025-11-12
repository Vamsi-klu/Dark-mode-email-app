import { describe, it, expect, beforeEach } from 'vitest'
import {
  getAllTemplates,
  createTemplate,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  getTemplatesByCategory,
  getMostUsedTemplates,
  searchTemplates,
  validateTemplateName,
  validateTemplateSubject,
  validateTemplateBody,
  isTemplateNameUnique,
  getAllCategories,
  applyTemplateVariables,
  extractTemplateVariables
} from 'src/lib/templates'

describe('templates utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('createTemplate', () => {
    it('creates template with all fields', () => {
      const tpl = createTemplate('Meeting', 'Weekly Sync', 'Hi team,...', 'Work')
      expect(tpl.id).toMatch(/^tpl-/)
      expect(tpl.name).toBe('Meeting')
      expect(tpl.subject).toBe('Weekly Sync')
      expect(tpl.body).toBe('Hi team,...')
      expect(tpl.category).toBe('Work')
      expect(tpl.usageCount).toBe(0)
    })

    it('creates template without category', () => {
      const tpl = createTemplate('Quick', 'Hi', 'Hello')
      expect(tpl.category).toBeUndefined()
    })
  })

  describe('useTemplate', () => {
    it('increments usage count', () => {
      const tpl = createTemplate('Test', 'Subject', 'Body')
      addTemplate(tpl)

      useTemplate(tpl.id)
      useTemplate(tpl.id)

      const templates = getAllTemplates()
      expect(templates[0].usageCount).toBe(2)
    })

    it('returns null for non-existent template', () => {
      expect(useTemplate('non-existent')).toBeNull()
    })
  })

  describe('getTemplatesByCategory', () => {
    it('filters templates by category', () => {
      addTemplate(createTemplate('T1', 'S1', 'B1', 'Work'))
      addTemplate(createTemplate('T2', 'S2', 'B2', 'Personal'))
      addTemplate(createTemplate('T3', 'S3', 'B3', 'Work'))

      const workTemplates = getTemplatesByCategory('Work')
      expect(workTemplates).toHaveLength(2)
    })
  })

  describe('getMostUsedTemplates', () => {
    it('returns most used templates', () => {
      const t1 = createTemplate('T1', 'S1', 'B1')
      const t2 = createTemplate('T2', 'S2', 'B2')
      const t3 = createTemplate('T3', 'S3', 'B3')

      addTemplate(t1)
      addTemplate(t2)
      addTemplate(t3)

      useTemplate(t2.id)
      useTemplate(t2.id)
      useTemplate(t3.id)

      const mostUsed = getMostUsedTemplates(2)
      expect(mostUsed[0].id).toBe(t2.id)
      expect(mostUsed[1].id).toBe(t3.id)
    })
  })

  describe('searchTemplates', () => {
    it('searches by name', () => {
      addTemplate(createTemplate('Meeting Notes', 'Subject', 'Body'))
      addTemplate(createTemplate('Report', 'Subject', 'Body'))

      const results = searchTemplates('meeting')
      expect(results).toHaveLength(1)
    })

    it('searches by subject', () => {
      addTemplate(createTemplate('T1', 'Weekly Report', 'Body'))
      const results = searchTemplates('weekly')
      expect(results).toHaveLength(1)
    })

    it('searches by body', () => {
      addTemplate(createTemplate('T1', 'S', 'Important content here'))
      const results = searchTemplates('important')
      expect(results).toHaveLength(1)
    })

    it('returns all for empty query', () => {
      addTemplate(createTemplate('T1', 'S1', 'B1'))
      addTemplate(createTemplate('T2', 'S2', 'B2'))

      expect(searchTemplates('')).toHaveLength(2)
    })
  })

  describe('validation', () => {
    it('validates template name', () => {
      expect(validateTemplateName('Valid Name').valid).toBe(true)
      expect(validateTemplateName('').valid).toBe(false)
      expect(validateTemplateName('A').valid).toBe(false)
      expect(validateTemplateName('A'.repeat(101)).valid).toBe(false)
    })

    it('validates template subject', () => {
      expect(validateTemplateSubject('Valid Subject').valid).toBe(true)
      expect(validateTemplateSubject('').valid).toBe(true)
      expect(validateTemplateSubject('A'.repeat(201)).valid).toBe(false)
    })

    it('validates template body', () => {
      expect(validateTemplateBody('Valid body').valid).toBe(true)
      expect(validateTemplateBody('').valid).toBe(false)
      expect(validateTemplateBody('A'.repeat(10001)).valid).toBe(false)
    })
  })

  describe('isTemplateNameUnique', () => {
    it('checks uniqueness', () => {
      addTemplate(createTemplate('Existing', 'S', 'B'))
      expect(isTemplateNameUnique('New')).toBe(true)
      expect(isTemplateNameUnique('Existing')).toBe(false)
    })
  })

  describe('getAllCategories', () => {
    it('returns unique categories', () => {
      addTemplate(createTemplate('T1', 'S', 'B', 'Work'))
      addTemplate(createTemplate('T2', 'S', 'B', 'Personal'))
      addTemplate(createTemplate('T3', 'S', 'B', 'Work'))

      const categories = getAllCategories()
      expect(categories).toEqual(['Personal', 'Work'])
    })
  })

  describe('applyTemplateVariables', () => {
    it('replaces variables', () => {
      const text = 'Hi {{name}}, meeting at {{time}}'
      const result = applyTemplateVariables(text, { name: 'John', time: '3pm' })
      expect(result).toBe('Hi John, meeting at 3pm')
    })

    it('handles multiple occurrences', () => {
      const text = '{{name}} and {{name}}'
      const result = applyTemplateVariables(text, { name: 'Alice' })
      expect(result).toBe('Alice and Alice')
    })
  })

  describe('extractTemplateVariables', () => {
    it('extracts variables from text', () => {
      const text = 'Hi {{name}}, see you at {{time}}'
      const vars = extractTemplateVariables(text)
      expect(vars).toEqual(['name', 'time'])
    })

    it('returns empty for no variables', () => {
      expect(extractTemplateVariables('No variables here')).toEqual([])
    })
  })
})
