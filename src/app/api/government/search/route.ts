import { NextRequest, NextResponse } from 'next/server'
import { fetchGovDecisions } from '@/lib/government-api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').toLowerCase()
  const ministry = (searchParams.get('ministry') ?? '').toLowerCase()

  try {
    const decisions = await fetchGovDecisions(100)
    const filtered = decisions.filter((d) => {
      const matchQ = !q ||
        d.title.toLowerCase().includes(q) ||
        (d.summary ?? '').toLowerCase().includes(q) ||
        (d.decision_num ?? '').includes(q)
      const matchMinistry = !ministry ||
        (d.ministry_name ?? '').toLowerCase().includes(ministry)
      return matchQ && matchMinistry
    })
    return NextResponse.json({ results: filtered })
  } catch (err) {
    return NextResponse.json({ results: [], error: String(err) })
  }
}
