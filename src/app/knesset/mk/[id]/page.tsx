import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { fetchBillsByPerson, BILL_STATUS } from '@/lib/knesset-api'
import { BillCard } from '@/components/knesset/BillCard'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton } from '@/components/ui/skeleton'
import { KNESSET_ODATA_BASE } from '@/lib/utils'

interface MKPageProps {
  params: Promise<{ id: string }>
}

async function fetchMKDetails(id: string) {
  const url = `${KNESSET_ODATA_BASE}/KNS_Person(${id})?$format=json`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return res.json()
}

export default async function MKPage({ params }: MKPageProps) {
  const { id } = await params
  const mk = await fetchMKDetails(id)

  if (!mk) {
    return (
      <div className="module-knesset mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-[var(--muted)]">חבר כנסת לא נמצא</p>
        <Link href="/knesset/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">חזרה לדשבורד</Link>
      </div>
    )
  }

  const name = mk.Name ?? `${mk.FirstName ?? ''} ${mk.LastName ?? ''}`.trim()

  return (
    <div className="module-knesset mx-auto max-w-4xl px-4 py-6 md:px-6">
      <Link href="/knesset/dashboard" className="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ArrowRight size={14} />
        חזרה לדשבורד
      </Link>

      {/* Profile Header */}
      <div className="mb-6 flex items-start gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold shrink-0">
          {name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[var(--foreground)]">{name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {mk.IsCurrent && <Badge variant="green">חבר כנסת נוכחי</Badge>}
            {mk.GenderID === 2 && <Badge variant="gray">חברת כנסת</Badge>}
            {mk.FactionID && (
              <Badge variant="blue">סיעה #{mk.FactionID}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bills */}
      <section>
        <h2 className="mb-3 font-semibold text-[var(--foreground)]">הצעות חוק</h2>
        <Suspense fallback={<div className="space-y-2">{Array.from({length:5}).map((_,i)=><CardSkeleton key={i}/>)}</div>}>
          <MKBills personId={Number(id)} />
        </Suspense>
      </section>
    </div>
  )
}

async function MKBills({ personId }: { personId: number }) {
  try {
    const bills = await fetchBillsByPerson(personId)
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
