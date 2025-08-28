import { describe, it, expect } from 'vitest'
import { applyTheme, getInitialTheme } from 'src/lib/theme'

describe('theme utilities', () => {
  it('getInitialTheme returns a value', () => {
    const t = getInitialTheme()
    expect(['dark','light','white']).toContain(t)
  })

  it('applyTheme toggles root and body classes', () => {
    applyTheme('light')
    expect(document.documentElement.classList.contains('theme-light')).toBe(true)
    applyTheme('white')
    expect(document.documentElement.classList.contains('theme-white')).toBe(true)
    applyTheme('dark')
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true)
  })
})

