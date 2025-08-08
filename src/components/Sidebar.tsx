import React from 'react'
import { ComposeButton } from './common/Button'
import { Inbox, Star, Send, FileEdit, Trash2 } from 'lucide-react'
import type { Mailbox } from '../App'

type Props = {
  mailbox: Mailbox
  onSelectMailbox: (m: Mailbox) => void
  onCompose: () => void
}

export function Sidebar({ mailbox, onSelectMailbox, onCompose }: Props) {
  const items: { key: Mailbox; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'inbox', label: 'Inbox', icon: <Inbox size={18} />, count: 2 },
    { key: 'starred', label: 'Starred', icon: <Star size={18} /> },
    { key: 'sent', label: 'Sent', icon: <Send size={18} /> },
    { key: 'drafts', label: 'Drafts', icon: <FileEdit size={18} /> },
    { key: 'trash', label: 'Trash', icon: <Trash2 size={18} /> }
  ]

  return (
    <div className="flex flex-col h-full gap-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-600/60 grid place-items-center shadow-premium">✦</div>
          <div>
            <div className="font-semibold tracking-wide">NovaMail</div>
            <div className="text-xs text-white/50">Premium Dark</div>
          </div>
        </div>
      </div>

      <ComposeButton onClick={onCompose}>Compose</ComposeButton>

      <nav className="flex-1 space-y-1">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => onSelectMailbox(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
              mailbox === item.key
                ? 'bg-white/10 text-white'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="opacity-80">{item.icon}</span>
            <span className="flex-1 text-left font-medium">{item.label}</span>
            {item.count ? (
              <span className="text-xs text-white/70">{item.count}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="text-xs text-white/40">
        <div>Storage</div>
        <div className="w-full h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
          <div className="h-full w-2/5 bg-gradient-to-r from-brand-500 to-brand-700"></div>
        </div>
        <div className="mt-1">4.2 GB of 10 GB</div>
      </div>
    </div>
  )
}


