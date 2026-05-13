'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, User, Users, FileText, Building } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BillCard } from '@/components/knesset/BillCard'
import type { KnessetPerson, KnessetBill, KnessetFaction, KnessetCommittee } from '@/lib/knesset-api'

type SearchType = 'persons' | 'bills' | 'factions' | 'committees'

const tabs: { id: SearchType; icon: React.ReactNode; label: string }[] = [
  { id: 'persons', icon: <User size={14} />, label: 'חברי כנסת' },
  { id: 'bills', icon: <FileText size={14} />, label: 'הצעות חוק' },
  { id: 'factions', icon: <Building size={14} />, label: 'סיעות' },
  { id: 'committees', icon: <Users size={14} />, label: 'ועדות' },
]

export default function KnessetSearchClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [type, setType] = useState<SearchType>((searchParams.get('type') as SearchType) ?? 'persons')
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)

  const fetchResults = useCallback(async (t: SearchType, q: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: t, q })
      const res = await fetch(`/api/knesset/search?${params}`)
      const data = await res.json()
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults(type, query)
  }, [type, fetchResults])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchResults(type, query)
    router.push(`/knesset/search?type=${type}&q=${encodeURIComponent(query)}`, { scroll: false })
  }

  const handleTabChange = (t: SearchType) => {
    setType(t)
    setQuery('')
    router.push(`/knesset/search?type=${t}`, { scroll: false })
  }

  return (
    <div className="module-knesset mx-auto max-w-5xl px-4 py-6 md:px-6">
      <h1 className="mb-5 text-2xl font-bold text-[var(--foreground)]">חיפוש בכנסת</h1>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-[var(--card-border)] pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
              type === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Search input */}
      <form onSubmit={handleSearch} className="mb-6">
        <Input
          icon={<Search size={15} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`חפש ${tabs.find(t => t.id === type)?.label}...`}
        />
      </form>

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-lg" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="text-center py-12 text-[var(--muted)]">לא נמצאו תוצאות</p>
      ) : (
        <div className="space-y-2">
          {type === 'bills' && (results as KnessetBill[]).map((b) => (
            <BillCard key={b.BillID} bill={b} />
          ))}
          {type === 'persons' && (results as KnessetPerson[]).map((p) => (
            <Link
              key={p.PersonID}
              href={`/knesset/mk/${p.PersonID}`}
              className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 hover:border-blue-400 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
                {(p.Name ?? p.FirstName ?? '?').charAt(0)}
              </div>
              <div>
                <p className="font-medium text-sm text-[var(--foreground)]">{p.Name ?? `${p.FirstName} ${p.LastName}`}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {p.IsCurrent && <Badge variant="green">נוכחי</Badge>}
                  {p.FactionID && <span className="text-xs text-[var(--muted)]">סיעה #{p.FactionID}</span>}
                </div>
              </div>
            </Link>
          ))}
          {type === 'factions' && (results as KnessetFaction[]).map((f) => (
            <div key={f.FactionID} className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3">
              <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0">🏛️</div>
              <div>
                <p className="font-medium text-sm text-[var(--foreground)]">{f.Name}</p>
                {f.KnessetNum && <p className="text-xs text-[var(--muted)]">כנסת {f.KnessetNum}</p>}
              </div>
            </div>
          ))}
          {type === 'committees' && (results as KnessetCommittee[]).map((c) => (
            <Link
              key={c.CommitteeID}
              href={`/knesset/committee/${c.CommitteeID}`}
              className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 hover:border-blue-400 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-lg shrink-0">📋</div>
              <div>
                <p className="font-medium text-sm text-[var(--foreground)]">{c.Name}</p>
                {c.KnessetNum && <p className="text-xs text-[var(--muted)]">כנסת {c.KnessetNum}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
