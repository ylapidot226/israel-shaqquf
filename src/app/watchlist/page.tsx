'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Trash2, Bell, Building2, FileText, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface WatchlistItemWithRules {
  id: string
  module: string
  type: string
  target_id: string
  target_label: string
  created_at: string
  watchlist_rules: {
    id: string
    channels: string[]
    frequency: string
    filter_level: string
    event_types: string[]
  }[]
}

const typeIcon: Record<string, React.ReactNode> = {
  mk: <Eye size={14} />,
  faction: <Building2 size={14} />,
  committee: <Users size={14} />,
  bill: <FileText size={14} />,
  ministry: <Building2 size={14} />,
  minister: <Eye size={14} />,
  decision: <FileText size={14} />,
  keyword: <Bell size={14} />,
}

const frequencyLabel: Record<string, string> = {
  immediate: 'מיידי',
  daily: 'יומי',
  weekly: 'שבועי',
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItemWithRules[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (!data.user) return setLoading(false)

      supabase
        .from('watchlist_items')
        .select('*, watchlist_rules(*)')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .then(({ data: items }) => {
          setItems((items ?? []) as WatchlistItemWithRules[])
          setLoading(false)
        })
    })
  }, [])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('watchlist_items').delete().eq('id', id)
    setItems(items.filter((i) => i.id !== id))
  }

  if (!user && !loading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 text-center">
        <div>
          <Eye size={40} className="mx-auto mb-4 text-[var(--muted)]" />
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">רשימת מעקב</h1>
          <p className="text-sm text-[var(--muted)] mb-4">התחבר כדי לנהל את רשימת המעקב שלך</p>
          <Link href="/auth/login">
            <Button>כניסה</Button>
          </Link>
        </div>
      </div>
    )
  }

  const knessetItems = items.filter((i) => i.module === 'knesset')
  const govItems = items.filter((i) => i.module === 'government')

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">🔔 רשימת מעקב</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Watchlist · {items.length} פריטים</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <Eye size={36} className="mx-auto mb-3 text-[var(--muted)]" />
          <p className="font-medium text-[var(--foreground)]">רשימת המעקב ריקה</p>
          <p className="mt-1 text-sm text-[var(--muted)]">לחץ על "עקוב" בדפי כנסת ממשלה להוסיף פריטים</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/knesset/dashboard">
              <Button variant="outline" size="sm">🏛️ כנסת</Button>
            </Link>
            <Link href="/government/dashboard">
              <Button variant="outline" size="sm">🏢 ממשלה</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {knessetItems.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--foreground)]">
                🏛️ כנסת
                <Badge variant="blue">{knessetItems.length}</Badge>
              </h2>
              <div className="space-y-2">
                {knessetItems.map((item) => (
                  <WatchlistItemRow key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
          {govItems.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--foreground)]">
                🏢 ממשלה
                <Badge variant="green">{govItems.length}</Badge>
              </h2>
              <div className="space-y-2">
                {govItems.map((item) => (
                  <WatchlistItemRow key={item.id} item={item} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function WatchlistItemRow({
  item,
  onDelete,
}: {
  item: WatchlistItemWithRules
  onDelete: (id: string) => void
}) {
  const rule = item.watchlist_rules?.[0]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        item.module === 'knesset' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
      }`}>
        {typeIcon[item.type] ?? <Eye size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">{item.target_label}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge variant="gray" className="text-xs">{item.type}</Badge>
          {rule && (
            <>
              <span className="text-xs text-[var(--muted)]">{rule.channels.join(', ')}</span>
              <span className="text-xs text-[var(--muted)]">·</span>
              <span className="text-xs text-[var(--muted)]">{frequencyLabel[rule.frequency] ?? rule.frequency}</span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-red-100 hover:text-red-600 transition-colors"
        title="הסר מעקב"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}
