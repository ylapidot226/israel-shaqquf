import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { fetchGovDecisions } from '@/lib/government-api'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret') ?? request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const syncStart = new Date().toISOString()

  try {
    const decisions = await fetchGovDecisions(100)

    if (decisions.length > 0) {
      const rows = decisions.map((d) => ({
        gov_num: d.gov_num,
        decision_num: d.decision_num,
        title: d.title,
        date: d.date,
        ministry_name: d.ministry_name,
        summary: d.summary,
        url: d.url,
        updated_at: syncStart,
      }))

      const { error } = await supabase
        .from('gov_decisions')
        .upsert(rows, { onConflict: 'decision_id', ignoreDuplicates: false })

      if (error) throw error
    }

    await supabase.from('sync_log').upsert({
      table_name: 'gov_decisions',
      last_sync_at: syncStart,
      records_updated: decisions.length,
    }, { onConflict: 'table_name' })

    return NextResponse.json({ success: true, synced: { gov_decisions: decisions.length }, at: syncStart })
  } catch (err) {
    console.error('Government sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
