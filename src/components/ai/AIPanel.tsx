import React, { useMemo, useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { runOverview } from '../../lib/ai'
import { Button } from '../common/Button'

type Props = {
  open: boolean
  onClose: () => void
}

export function AIPanel({ open, onClose }: Props) {
  const [input, setInput] = useState('Summarize my unread inbox and suggest next actions.')
  const [seed, setSeed] = useState(42)

  const result = useMemo(() => runOverview(input, seed), [input, seed])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-end p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-3xl surface rounded-2xl shadow-premium overflow-hidden animate-pop-in">
        <header className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles size={18} className="text-brand-300" /> AI Overview
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input
              title="Deterministic Seed"
              type="number"
              min={0}
              className="w-24 bg-white/5 border-white/10 rounded-lg px-2 py-1 text-sm"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value) || 0)}
            />
            <button className="p-2 rounded-lg hover:bg-white/10 text-white/70" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div className="space-y-3">
            <textarea
              className="w-full h-40 bg-white/5 border-white/10 rounded-lg px-3 py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for an overview, summary, plan, or insights"
            />
            <div className="text-xs text-white/50">
              Tip: Change seed to vary bullet ordering deterministically.
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-white/60">Overview</div>
            <div className="bg-white/5 rounded-xl p-3 leading-relaxed animate-fade-in">
              {result.overview}
            </div>
            <div className="text-sm text-white/60">Key Points</div>
            <ul className="space-y-2">
              {result.points.map((p, i) => (
                <li key={i} className="bg-white/5 rounded-xl p-2 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  • {p}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setSeed((s) => s + 1)} variant="primary">Regenerate</Button>
              <Button onClick={() => navigator.clipboard?.writeText([result.overview, ...result.points].join('\n'))} variant="ghost">Copy</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

