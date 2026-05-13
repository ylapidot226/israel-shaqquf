import { Suspense } from 'react'
import Link from 'next/link'
import { RefreshCw, Building2 } from 'lucide-react'
import { fetchGovDecisions, fetchMinistries } from '@/lib/government-api'
import { DecisionCard } from '@/components/government/DecisionCard'
import { CardSkeleton } from '@/components/ui/skeleton'

export const revalidate = 300

export default function GovernmentDashboard() {
  return (
    <div className="module-government mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">🏢 הממשלה</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">לוח בקרה · Government Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <RefreshCw size={12} />
          <span>מתעדכן כל 15 דקות</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main: Recent Decisions */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">החלטות ממשלה אחרונות</h2>
            <Link href="/government/search" className="text-sm text-green-600 dark:text-green-400 hover:underline">
              ראה הכל
            </Link>
          </div>
          <Suspense fallback={<div className="space-y-2">{Array.from({length:6}).map((_,i)=><CardSkeleton key={i}/>)}</div>}>
            <DecisionsList />
          </Suspense>
        </section>

        {/* Sidebar: Ministries */}
        <aside>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">משרדי ממשלה</h2>
            <Link href="/government/search?filter=ministry" className="text-sm text-green-600 dark:text-green-400 hover:underline">הכל</Link>
          </div>
          <Suspense fallback={<CardSkeleton />}>
            <MinistriesList />
          </Suspense>
        </aside>
      </div>

      {/* Quick nav */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/government/search', icon: '📋', label: 'כל ההחלטות', sub: 'All Decisions' },
          { href: '/government/search?filter=ministry', icon: '🏢', label: 'לפי משרד', sub: 'By Ministry' },
          { href: '/government/search?filter=date', icon: '📅', label: 'לפי תאריך', sub: 'By Date' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-green-400 transition-colors"
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-medium text-sm text-[var(--foreground)]">{item.label}</p>
              <p className="text-xs text-[var(--muted)]">{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

async function DecisionsList() {
  try {
    const decisions = await fetchGovDecisions(12)
    if (!decisions.length) return <p className="text-sm text-[var(--muted)]">לא נמצאו החלטות</p>
    return (
      <div className="space-y-2">
        {decisions.map((d, i) => (
          <DecisionCard key={d.decision_id ?? i} decision={d} href={`/government/decision/${d.decision_id ?? i}`} />
        ))}
      </div>
    )
  } catch {
    return <p className="text-sm text-red-500">שגיאה בטעינת החלטות</p>
  }
}

async function MinistriesList() {
  const ministries = await fetchMinistries()
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] divide-y divide-[var(--card-border)]">
      {ministries.map((m) => (
        <Link
          key={m.ministry_id}
          href={`/government/ministry/${m.ministry_id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
        >
          <Building2 size={14} className="text-green-600 shrink-0" />
          <span className="text-sm text-[var(--foreground)]">{m.hebrew_name ?? m.name}</span>
        </Link>
      ))}
    </div>
  )
}
