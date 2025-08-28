import React from 'react'
import { Star } from 'lucide-react'
import type { Email } from '../mockEmails'

type Props = {
  emails: Email[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function MailList({ emails, selectedId, onSelect }: Props) {
  return (
    <div className="divide-y divide-white/5">
      {emails.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`w-full text-left px-4 py-3 flex gap-3 items-start transition-all ${
            selectedId === m.id ? 'bg-white/10' : 'hover:bg-white/5'
          }`}
        >
          <div className="w-9 h-9 rounded-lg shrink-0" style={{ background: `${m.sender.avatarColor}33` }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className={`text-sm font-semibold ${m.unread ? '' : 'text-white/80'}`}>{m.sender.name}</div>
              {m.starred ? <Star size={14} className="text-yellow-400" /> : null}
              <div className="ml-auto text-xs text-white/50">{new Date(m.date).toLocaleDateString()}</div>
            </div>
            <div className={`truncate ${m.unread ? 'font-semibold' : 'text-white/80'}`}>{m.subject}</div>
            <div className="text-sm text-white/60 truncate">{m.snippet}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

