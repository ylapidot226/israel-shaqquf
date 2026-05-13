'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageSquare, ExternalLink, RefreshCw, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLocaleContext } from '@/components/shared/LocaleProvider'

interface Source {
  source_table: string
  source_id: string
  content_text: string
  similarity: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  loading?: boolean
}

const SUGGESTED_QUESTIONS = [
  'מה המצב החקיקתי של הצעות חוק בנושא דיור?',
  'אילו החלטות ממשלה התקבלו בנושא חינוך?',
  'מי הם חברי הכנסת מהסיעה הגדולה ביותר?',
  'What are the recent government decisions about healthcare?',
  'Which bills passed in the last session?',
]

function getSourceHref(source: Source): string {
  if (source.source_table === 'bills') return `/knesset/search?type=bills&q=${encodeURIComponent(source.source_id)}`
  if (source.source_table === 'gov_decisions') return `/government/decision/${source.source_id}`
  if (source.source_table === 'persons') return `/knesset/mk/${source.source_id}`
  return '#'
}

function getSourceLabel(source: Source): string {
  const tableLabels: Record<string, string> = {
    bills: '📜 הצעת חוק',
    gov_decisions: '📋 החלטת ממשלה',
    persons: '👤 חבר כנסת',
    committees: '📋 ועדה',
  }
  return `${tableLabels[source.source_table] ?? source.source_table} #${source.source_id}`
}

export default function ChatPage() {
  const { t, isRTL } = useLocaleContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return
    setInput('')
    setLoading(true)

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
    }
    const loadingMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      loading: true,
    }
    setMessages((prev) => [...prev, userMsg, loadingMsg])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, sessionId }),
      })
      const data = await res.json()

      setMessages((prev) => prev.map((m) =>
        m.loading ? {
          ...m,
          content: data.answer ?? data.error ?? 'שגיאה',
          sources: data.sources ?? [],
          loading: false,
        } : m
      ))
    } catch {
      setMessages((prev) => prev.map((m) =>
        m.loading ? { ...m, content: 'שגיאה בחיבור לשרת', loading: false } : m
      ))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="border-b border-[var(--card-border)] bg-[var(--background)] px-4 py-3 md:px-6">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="font-bold text-[var(--foreground)]">💬 {isRTL ? 'שאל את המדינה' : 'Ask the State'}</h1>
            <p className="text-xs text-[var(--muted)]">
              {isRTL ? 'AI עם גישה לנתוני כנסת וממשלה' : 'AI powered by Knesset & Government data'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <Database size={12} />
            <span>RAG · Claude</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="py-8 text-center">
              <MessageSquare size={40} className="mx-auto mb-3 text-[var(--muted)]" />
              <h2 className="font-semibold text-[var(--foreground)] mb-1">
                {isRTL ? 'שאל שאלה על הממשל' : 'Ask about Israeli governance'}
              </h2>
              <p className="text-sm text-[var(--muted)] mb-6">
                {isRTL
                  ? 'אני יכול לעזור עם מידע על הכנסת, ממשלה, חקיקה והחלטות'
                  : 'I can help with Knesset, Government, legislation and decisions'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors text-start"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3',
                msg.role === 'user'
                  ? 'bg-[var(--foreground)] text-[var(--background)] rounded-se-sm'
                  : 'bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] rounded-ss-sm'
              )}>
                {msg.loading ? (
                  <div className="flex items-center gap-2 py-1">
                    <RefreshCw size={13} className="animate-spin text-[var(--muted)]" />
                    <span className="text-sm text-[var(--muted)]">{isRTL ? 'חושב...' : 'Thinking...'}</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[var(--card-border)]">
                        <p className="text-xs text-[var(--muted)] mb-1.5">{isRTL ? '📚 מקורות:' : '📚 Sources:'}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((s, i) => (
                            <a
                              key={i}
                              href={getSourceHref(s)}
                              className="flex items-center gap-1 rounded-full bg-[var(--card-border)]/50 px-2 py-0.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                            >
                              {getSourceLabel(s)}
                              <ExternalLink size={9} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[var(--card-border)] bg-[var(--background)] px-4 py-3 md:px-6">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRTL ? 'שאל שאלה על הכנסת, הממשלה, חקיקה...' : 'Ask about the Knesset, government, legislation...'}
              className="flex-1 resize-none rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] min-h-[44px] max-h-32"
              rows={1}
              dir="auto"
              disabled={loading}
            />
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!input.trim() || loading}
              className="shrink-0 h-11"
            >
              <Send size={15} />
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-[var(--muted)]">
            {isRTL
              ? 'מבוסס על Claude · נתונים: כנסת וממשלת ישראל'
              : 'Powered by Claude · Data: Knesset & Israeli Government'}
          </p>
        </div>
      </div>
    </div>
  )
}
