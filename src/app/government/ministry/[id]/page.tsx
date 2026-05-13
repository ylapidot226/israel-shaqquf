import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { fetchGovDecisions, fetchMinistries } from '@/lib/government-api'
import { DecisionCard } from '@/components/government/DecisionCard'

interface MinistryPageProps {
  params: Promise<{ id: string }>
}

export default async function MinistryPage({ params }: MinistryPageProps) {
  const { id } = await params
  const [decisions, ministries] = await Promise.all([
    fetchGovDecisions(20),
    fetchMinistries(),
  ])

  const ministry = ministries.find((m) => m.ministry_id === id)
  const hebrewName = ministry?.hebrew_name ?? ''
  const filtered = decisions.filter((d) =>
    hebrewName ? d.ministry_name?.includes(hebrewName) : d.ministry_name?.includes(id)
  )

  return (
    <div className="module-government mx-auto max-w-4xl px-4 py-6 md:px-6">
      <Link href="/government/dashboard" className="mb-4 flex items-center gap-1 text-sm text-green-600 hover:underline">
        <ArrowRight size={14} />
        חזרה לדשבורד
      </Link>

      <div className="mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h1 className="text-xl font-bold text-[var(--foreground)]">
          🏢 {ministry?.hebrew_name ?? ministry?.name ?? id}
        </h1>
        {ministry?.name && ministry.hebrew_name && (
          <p className="mt-1 text-sm text-[var(--muted)]">{ministry.name}</p>
        )}
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-[var(--foreground)]">
          החלטות ממשלה ({filtered.length})
        </h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">לא נמצאו החלטות עבור משרד זה</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((d, i) => (
              <DecisionCard key={d.decision_id ?? i} decision={d} href={`/government/decision/${d.decision_id ?? i}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
