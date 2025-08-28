import React, { useEffect, useMemo, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { MailList } from './components/MailList'
import { MailView } from './components/MailView'
import { Composer } from './components/Composer'
import { mockEmails, type Email } from './mockEmails'
import { filterEmails } from './lib/filter'
import type { Mailbox } from './types/mail'
import { AIPanel } from './components/ai/AIPanel'
import { applyTheme, getInitialTheme, type Theme } from './lib/theme'

export default function App() {
  const [mailbox, setMailbox] = useState<Mailbox>('inbox')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(getInitialTheme())

  const emails = useMemo(() => filterEmails(mockEmails, mailbox, query), [mailbox, query])
  const selected: Email | null = useMemo(
    () => emails.find(e => e.id === selectedId) ?? emails[0] ?? null,
    [emails, selectedId]
  )

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 opacity-[0.7]">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(58,144,238,0.15),_transparent_60%)]" />
        <div className="absolute top-1/2 right-0 w-[900px] h-[900px] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,_rgba(18,235,216,0.12),_transparent_60%)]" />
      </div>

      <div className="grid grid-cols-12 gap-6 p-6">
        <aside className="col-span-3 xl:col-span-2 surface rounded-2xl p-4 animate-fade-in">
          <Sidebar
            mailbox={mailbox}
            onSelectMailbox={(m) => {
              setMailbox(m)
              setSelectedId(null)
            }}
            onCompose={() => setComposerOpen(true)}
          />
          <div className="pt-4">
            <button
              className="w-full px-4 py-2 rounded-xl bg-white/0 hover:bg-white/10 text-white/80 transition-all"
              onClick={() => setAiOpen(true)}
            >
              ✨ AI Overview
            </button>
          </div>
        </aside>

        <main className="col-span-9 xl:col-span-10 grid grid-rows-[auto_1fr] gap-4">
          <div className="surface rounded-2xl p-4 animate-slide-down">
            <TopBar query={query} onQueryChange={setQuery} theme={theme} onThemeChange={setTheme} />
          </div>

          <section className="grid grid-cols-12 gap-4 min-h-[70vh]">
            <div className="col-span-5 xl:col-span-4 surface rounded-2xl overflow-hidden animate-fade-in">
              <div className="h-12 px-4 flex items-center text-white/70 border-b border-white/5">
                <span className="text-sm">{emails.length} Conversations</span>
              </div>
              <div className="max-h-[calc(70vh-3rem)] overflow-auto">
                <MailList
                  emails={emails}
                  selectedId={selected?.id ?? null}
                  onSelect={(id) => setSelectedId(id)}
                />
              </div>
            </div>

            <div className="col-span-7 xl:col-span-8 surface rounded-2xl overflow-hidden animate-fade-in">
              {selected ? (
                <MailView
                  email={selected}
                  onReply={() => setComposerOpen(true)}
                />
              ) : (
                <div className="h-full grid place-items-center text-white/50">
                  <div className="text-center">
                    <div className="text-5xl mb-2">📭</div>
                    <div>No conversation selected</div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <Composer open={composerOpen} onClose={() => setComposerOpen(false)} />
      <AIPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  )
}
