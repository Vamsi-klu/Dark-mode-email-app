import React from 'react'
import type { Theme } from 'src/lib/theme'

type Props = {
  value: Theme
  onChange: (t: Theme) => void
}

export function ThemeToggle({ value, onChange }: Props) {
  const items: Theme[] = ['dark', 'light', 'white']
  return (
    <div className="inline-flex bg-white/5 rounded-xl p-1 border border-white/10">
      {items.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={
            `px-3 py-1 rounded-lg text-sm capitalize transition-colors ` +
            (value === t ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5')
          }
          aria-pressed={value === t}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

