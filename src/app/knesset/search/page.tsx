import { Suspense } from 'react'
import KnessetSearchClient from './KnessetSearchClient'

export default function KnessetSearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-6"><div className="h-8 w-64 skeleton mb-6 rounded-lg" /><div className="space-y-2">{Array.from({length:6}).map((_,i)=><div key={i} className="h-16 skeleton rounded-lg" />)}</div></div>}>
      <KnessetSearchClient />
    </Suspense>
  )
}
