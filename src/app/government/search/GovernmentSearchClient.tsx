'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DecisionCard } from '@/components/government/DecisionCard'
import type { GovDecision } from '@/lib/government-api'

export default function GovernmentSearchClient() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [ministry, setMinistry] = useState(searchParams.get('ministry') ?? '')
  const [results, setResults] = useState<GovDecision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (ministry) params.set('ministry', ministry)
        const res = await fetch(`/api/government/search?${params}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [query, ministry])

  return (
    <div className="module-government mx-auto max-w-5xl px-4 py-6 md:px-6">
      <h1 className="mb-5 text-2xl font-bold text-[var(--foreground)]">חיפוש החלטות ממשלה</h1>

      <div className="mb-6 flex gap-3">
        <div className="flex-1">
          <Input
            icon={<Search size={15} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש לפי נושא, משרד, מספר החלטה..."
          />
        </div>
        <div className="w-48">
          <Input
            icon={<Filter size={15} />}
            value={ministry}
            onChange={(e) => setMinistry(e.target.value)}
            placeholder="סנן לפי משרד"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-lg" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="text-center py-12 text-[var(--muted)]">לא נמצאו תוצאות</p>
      ) : (
        <div className="space-y-2">
          {results.map((d, i) => (
            <DecisionCard key={d.decision_id ?? i} decision={d} href={`/government/decision/${d.decision_id ?? i}`} />
          ))}
        </div>
      )}
    </div>
  )
}
