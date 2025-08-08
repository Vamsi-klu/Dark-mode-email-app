import React from 'react'
import type { Email } from '../mockEmails'
import { Reply, MoreVertical } from 'lucide-react'
import { Button } from './common/Button'

type Props = {
  email: Email
  onReply: () => void
}

export function MailView({ email, onReply }: Props) {
  return (
    <div className="h-full flex flex-col">
      <header className="px-6 py-4 border-b border-white/5">
        <div className="text-lg font-semibold">{email.subject}</div>
        <div className="text-sm text-white/60 mt-1 flex items-center gap-2">
          <span className="font-medium text-white/80">{email.sender.name}</span>
          <span className="text-white/40">•</span>
          <span>{email.sender.email}</span>
          <span className="ml-auto">{new Date(email.date).toLocaleString()}</span>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-6 py-6 space-y-4">
        <p className="whitespace-pre-wrap text-white/85 leading-relaxed">{email.body}</p>
      </div>

      <footer className="px-6 py-4 border-t border-white/5 flex items-center gap-3">
        <Button onClick={onReply} className="flex items-center gap-2">
          <Reply size={16} /> Reply
        </Button>
        <button className="ml-auto p-2 rounded-lg hover:bg-white/10 text-white/70">
          <MoreVertical size={18} />
        </button>
      </footer>
    </div>
  )
}


