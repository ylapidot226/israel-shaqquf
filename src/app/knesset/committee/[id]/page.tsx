import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { fetchSessionsByCommittee } from '@/lib/knesset-api'
import { CommitteeSessionCard } from '@/components/knesset/CommitteeSessionCard'
import { CardSkeleton } from '@/components/ui/skeleton'
import { KNESSET_ODATA_BASE } from '@/lib/utils'

interface CommitteePageProps {
  params: Promise<{ id: string }>
}

async function fetchCommitteeDetails(id: string) {
  const url = `${KNESSET_ODATA_BASE}/KNS_Committee(${id})?$format=json`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return res.json()
}

export default async function CommitteePage({ params }: CommitteePageProps) {
  const { id } = await params
  const committee = await fetchCommitteeDetails(id)

  return (
    <div className="module-knesset mx-auto max-w-4xl px-4 py-6 md:px-6">
      <Link href="/knesset/dashboard" className="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ArrowRight size={14} />
        חזרה לדשבורד
      </Link>

      <div className="mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <h1 className="text-xl font-bold text-[var(--foreground)]">
          📋 {committee?.Name ?? `ועדה #${id}`}
        </h1>
        {committee?.KnessetNum && (
          <p className="mt-1 text-sm text-[var(--muted)]">כנסת {committee.KnessetNum}</p>
        )}
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-[var(--foreground)]">ישיבות הוועדה</h2>
        <Suspense fallback={<div className="space-y-2">{Array.from({length:5}).map((_,i)=><CardSkeleton key={i}/>)}</div>}>
          <SessionsList committeeId={Number(id)} />
        </Suspense>
      </section>
    </div>
  )
}

async function SessionsList({ committeeId }: { committeeId: number }) {
  try {
    const sessions = await fetchSessionsByCommittee(committeeId)
    if (!sessions.length) return <p className="text-sm text-[var(--muted)]">לא נמצאו ישיבות</p>
    return (
      <div className="space-y-2">
        {sessions.map((s) => <CommitteeSessionCard key={s.SessionID} session={s} />)}
      </div>
    )
  } catch {
    return <p className="text-sm text-red-500">שגיאה בטעינת ישיבות</p>
  }
}
