import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react'
import { fetchRecentBills, fetchUpcomingCommitteeSessions, fetchRecentAgendaItems } from '@/lib/knesset-api'
import { BillCard } from '@/components/knesset/BillCard'
import { CommitteeSessionCard } from '@/components/knesset/CommitteeSessionCard'
import { AgendaItemCard } from '@/components/knesset/AgendaItemCard'
import { CardSkeleton } from '@/components/ui/skeleton'

export const revalidate = 300

export default function KnessetDashboard() {
  return (
    <div className="module-knesset mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">🏛️ הכנסת</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">לוח בקרה · Knesset Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <RefreshCw size={12} />
          <span>מתעדכן כל 5 דקות</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bills */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-[var(--foreground)]">הצעות חוק אחרונות</h2>
            <Link href="/knesset/search?type=bills" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              ראה הכל <ArrowLeft size={13} />
            </Link>
          </div>
          <Suspense fallback={<div className="space-y-2">{Array.from({length:6}).map((_,i)=><CardSkeleton key={i}/>)}</div>}>
            <BillsList />
          </Suspense>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Upcoming Committee Sessions */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">ישיבות ועדה קרובות</h2>
              <Link href="/knesset/search?type=committees" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">הכל</Link>
            </div>
            <Suspense fallback={<div className="space-y-2">{Array.from({length:3}).map((_,i)=><CardSkeleton key={i}/>)}</div>}>
              <CommitteesList />
            </Suspense>
          </section>

          {/* Recent Agenda */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">סדר יום אחרון</h2>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 divide-y divide-[var(--card-border)]">
              <Suspense fallback={<div className="py-4 space-y-3">{Array.from({length:4}).map((_,i)=><CardSkeleton key={i}/>)}</div>}>
                <AgendaList />
              </Suspense>
            </div>
          </section>
        </aside>
      </div>

      {/* Quick nav */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/knesset/search?type=persons', icon: '👤', label: 'חברי כנסת', sub: 'MKs' },
          { href: '/knesset/search?type=factions', icon: '🏛️', label: 'סיעות', sub: 'Factions' },
          { href: '/knesset/search?type=committees', icon: '📋', label: 'ועדות', sub: 'Committees' },
          { href: '/knesset/search?type=bills', icon: '📜', label: 'הצעות חוק', sub: 'Bills' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-blue-400 transition-colors"
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

async function BillsList() {
  try {
    const bills = await fetchRecentBills(12)
    if (!bills.length) return <p className="text-sm text-[var(--muted)]">לא נמצאו הצעות חוק</p>
    return (
      <div className="space-y-2">
        {bills.map((bill) => <BillCard key={bill.BillID} bill={bill} />)}
      </div>
    )
  } catch {
    return <p className="text-sm text-red-500">שגיאה בטעינת הצעות חוק</p>
  }
}

async function CommitteesList() {
  try {
    const sessions = await fetchUpcomingCommitteeSessions(6)
    if (!sessions.length) return <p className="text-sm text-[var(--muted)] p-2">אין ישיבות קרובות</p>
    return (
      <div className="space-y-2">
        {sessions.map((s) => <CommitteeSessionCard key={s.CommitteeSessionID} session={s} />)}
      </div>
    )
  } catch {
    return <p className="text-sm text-red-500">שגיאה בטעינת ועדות</p>
  }
}

async function AgendaList() {
  try {
    const items = await fetchRecentAgendaItems(8)
    if (!items.length) return <p className="py-3 text-sm text-[var(--muted)]">אין פריטים</p>
    return <>{items.map((item) => <AgendaItemCard key={item.AgendaID} item={item} />)}</>
  } catch {
    return <p className="py-3 text-sm text-red-500">שגיאה בטעינת סדר יום</p>
  }
}
