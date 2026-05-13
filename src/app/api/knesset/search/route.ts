import { NextRequest, NextResponse } from 'next/server'
import { KNESSET_ODATA_BASE } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'bills'
  const q = searchParams.get('q') ?? ''

  const entityMap: Record<string, { entity: string; select: string; orderby: string }> = {
    bills: {
      entity: 'KNS_Bill',
      select: 'BillID,Name,StatusID,StatusDesc,InitiatorPersonID,KnessetNum,LastUpdatedDate,SubTypeID,SubTypeDesc',
      orderby: 'LastUpdatedDate desc',
    },
    persons: {
      entity: 'KNS_Person',
      select: 'PersonID,FirstName,LastName,Name,GenderID,IsCurrent,FactionID,LastUpdatedDate',
      orderby: 'LastName asc',
    },
    factions: {
      entity: 'KNS_Faction',
      select: 'FactionID,Name,KnessetNum',
      orderby: 'Name asc',
    },
    committees: {
      entity: 'KNS_Committee',
      select: 'CommitteeID,Name,KnessetNum',
      orderby: 'Name asc',
    },
  }

  const config = entityMap[type]
  if (!config) return NextResponse.json({ results: [] })

  const params = new URLSearchParams({
    $format: 'json',
    $top: '50',
    $select: config.select,
    $orderby: config.orderby,
  })

  if (q) {
    const nameFilter = type === 'persons'
      ? `substringof('${q}',LastName) or substringof('${q}',FirstName)`
      : `substringof('${q}',Name)`
    params.set('$filter', nameFilter)
  } else if (type === 'persons') {
    params.set('$filter', 'IsCurrent eq true')
  } else if (type === 'factions' || type === 'committees') {
    params.set('$filter', 'KnessetNum eq 25')
  }

  try {
    const url = `${KNESSET_ODATA_BASE}/${config.entity}?${params}`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error(`${res.status}`)
    const json = await res.json()
    return NextResponse.json({ results: json?.value ?? [] })
  } catch (err) {
    return NextResponse.json({ results: [], error: String(err) }, { status: 200 })
  }
}
