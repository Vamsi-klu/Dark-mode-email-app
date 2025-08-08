import React from 'react'
import { Search, Settings, Bell } from 'lucide-react'

type Props = {
  query: string
  onQueryChange: (v: string) => void
}

export function TopBar({ query, onQueryChange }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <label className="relative block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
            <Search size={18} />
          </span>
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search mail"
            className="w-full bg-white/5 border-white/10 focus:border-brand-500/50 focus:ring-brand-500/30 text-white placeholder:text-white/40 rounded-xl pl-10 pr-4 py-2"
            type="search"
          />
        </label>
      </div>
      <button className="p-2 rounded-lg hover:bg-white/10 text-white/70"><Bell size={18} /></button>
      <button className="p-2 rounded-lg hover:bg-white/10 text-white/70"><Settings size={18} /></button>
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-premium grid place-items-center text-sm font-semibold">Y</div>
    </div>
  )
}


