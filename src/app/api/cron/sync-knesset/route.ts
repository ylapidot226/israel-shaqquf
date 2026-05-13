import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { KNESSET_ODATA_BASE } from '@/lib/utils'

export const runtime = 'nodejs'
export const maxDuration = 60

async function fetchOdata(entity: string, filter?: string) {
  const params = new URLSearchParams({ $format: 'json', $top: '500' })
  if (filter) params.set('$filter', filter)
  const res = await fetch(`${KNESSET_ODATA_BASE}/${entity}?${params}`)
  if (!res.ok) throw new Error(`Knesset OData ${entity}: ${res.status}`)
  const json = await res.json()
  return json?.value ?? []
}

function toOdataDatetime(iso: string): string {
  return iso.replace(/\.\d{3}Z$/, '').replace('Z', '')
}

async function getLastSync(supabase: Awaited<ReturnType<typeof createServiceClient>>, table: string): Promise<string> {
  const { data } = await supabase
    .from('sync_log')
    .select('last_sync_at')
    .eq('table_name', table)
    .single()
  return toOdataDatetime(data?.last_sync_at ?? '2020-01-01T00:00:00')
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret') ?? request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const syncStart = new Date().toISOString()
  const results: Record<string, number> = {}

  try {
    // Sync bills
    const lastBillSync = await getLastSync(supabase, 'bills')
    const bills = await fetchOdata('KNS_Bill', `LastUpdatedDate ge datetime'${lastBillSync}'`)
    if (bills.length > 0) {
      const rows = bills.map((b: Record<string, unknown>) => ({
        bill_id: b.BillID,
        name: b.Name,
        status_id: b.StatusID,
        status_desc: b.StatusDesc,
        initiator_person_id: b.InitiatorPersonID,
        knesset_num: b.KnessetNum,
        last_updated_date: b.LastUpdatedDate,
        sub_type_id: b.SubTypeID,
        sub_type_desc: b.SubTypeDesc,
        updated_at: syncStart,
      }))
      await supabase.from('bills').upsert(rows, { onConflict: 'bill_id' })
      results.bills = bills.length
    }

    // Sync persons
    const lastPersonSync = await getLastSync(supabase, 'persons')
    const persons = await fetchOdata('KNS_Person', `LastUpdatedDate ge datetime'${lastPersonSync}'`)
    if (persons.length > 0) {
      const rows = persons.map((p: Record<string, unknown>) => ({
        person_id: p.PersonID,
        name: `${p.FirstName ?? ''} ${p.LastName ?? ''}`.trim() || String(p.Name ?? ''),
        gender_id: p.GenderID,
        is_current: p.IsCurrent,
        faction_id: p.FactionID,
        last_updated_date: p.LastUpdatedDate,
        updated_at: syncStart,
      }))
      await supabase.from('persons').upsert(rows, { onConflict: 'person_id' })
      results.persons = persons.length
    }

    // Sync factions
    const factions = await fetchOdata('KNS_Faction', 'KnessetNum eq 25')
    if (factions.length > 0) {
      const rows = factions.map((f: Record<string, unknown>) => ({
        faction_id: f.FactionID,
        name: f.Name,
        knesset_num: f.KnessetNum,
        updated_at: syncStart,
      }))
      await supabase.from('factions').upsert(rows, { onConflict: 'faction_id' })
      results.factions = factions.length
    }

    // Update sync log
    for (const table of ['bills', 'persons', 'factions']) {
      await supabase.from('sync_log').upsert({
        table_name: table,
        last_sync_at: syncStart,
        records_updated: results[table] ?? 0,
      }, { onConflict: 'table_name' })
    }

    return NextResponse.json({ success: true, synced: results, at: syncStart })
  } catch (err) {
    console.error('Knesset sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
