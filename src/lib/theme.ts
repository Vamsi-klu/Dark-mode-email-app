export type Theme = 'dark' | 'light' | 'white'

const STORAGE_KEY = 'novamail:theme'

export function getInitialTheme(): Theme {
  /* c8 ignore next 2 */
  const fromStorage = (typeof localStorage !== 'undefined') ? localStorage.getItem(STORAGE_KEY) as Theme | null : null
  return fromStorage ?? 'dark'
}

export function applyTheme(theme: Theme): void {
  /* c8 ignore next */
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const body = document.body

  // Remove previous theme classes
  root.classList.remove('theme-dark', 'theme-light', 'theme-white')
  root.classList.add(`theme-${theme}`)

  // Reset body classes that might conflict with readability
  body.classList.remove('text-white')
  body.classList.remove('bg-\[\#0b1020\]')
  body.classList.remove('text-slate-900', 'text-black', 'bg-white', 'bg-slate-50', 'bg-slate-100')

  // Apply base bg/text for the theme
  if (theme === 'dark') {
    body.classList.add('bg-\[\#0b1020\]', 'text-white')
  } else if (theme === 'light') {
    body.classList.add('bg-slate-100', 'text-slate-900')
  } else {
    body.classList.add('bg-white', 'text-slate-900')
  }

  /* c8 ignore start */
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {}
  /* c8 ignore stop */
}
