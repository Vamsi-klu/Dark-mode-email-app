import React, { useState } from 'react'
import { X, Send, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from './common/Button'

type Props = {
  open: boolean
  onClose: () => void
}

export function Composer({ open, onClose }: Props) {
  const [minimized, setMinimized] = useState(false)

  if (!open) return null

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-xl surface rounded-2xl shadow-premium overflow-hidden animate-pop-in">
      <header className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
        <div className="font-semibold">New message</div>
        <div className="ml-auto flex items-center gap-1">
          <button
            className="p-2 rounded-lg hover:bg-white/10 text-white/70"
            onClick={() => setMinimized(m => !m)}
            title={minimized ? 'Maximize' : 'Minimize'}
          >
            {minimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/70" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
      </header>

      {!minimized && (
        <div className="p-4 space-y-3">
          <input className="w-full bg-white/5 border-white/10 rounded-lg px-3 py-2" placeholder="To" />
          <input className="w-full bg-white/5 border-white/10 rounded-lg px-3 py-2" placeholder="Subject" />
          <textarea className="w-full h-44 bg-white/5 border-white/10 rounded-lg px-3 py-2" placeholder="Message" />
          <div className="pt-2">
            <Button className="inline-flex items-center gap-2">
              <Send size={16} /> Send
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

