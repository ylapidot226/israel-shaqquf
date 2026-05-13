import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret') ?? request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  let total = 0

  try {
    // Fetch bills without embeddings
    const { data: bills } = await supabase
      .from('bills')
      .select('bill_id, name, status_desc, sub_type_desc')
      .limit(50)

    for (const bill of bills ?? []) {
      const { data: existing } = await supabase
        .from('embeddings')
        .select('id')
        .eq('source_table', 'bills')
        .eq('source_id', String(bill.bill_id))
        .single()

      if (existing) continue

      const text = [bill.name, bill.status_desc, bill.sub_type_desc].filter(Boolean).join(' | ')
      const embRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })
      const embedding = embRes.data[0].embedding

      await supabase.from('embeddings').upsert({
        source_table: 'bills',
        source_id: String(bill.bill_id),
        content_text: text,
        embedding,
      }, { onConflict: 'source_table,source_id' })

      total++
    }

    // Fetch gov decisions without embeddings
    const { data: decisions } = await supabase
      .from('gov_decisions')
      .select('decision_id, title, summary, ministry_name')
      .limit(50)

    for (const d of decisions ?? []) {
      const { data: existing } = await supabase
        .from('embeddings')
        .select('id')
        .eq('source_table', 'gov_decisions')
        .eq('source_id', String(d.decision_id))
        .single()

      if (existing) continue

      const text = [d.title, d.summary, d.ministry_name].filter(Boolean).join(' | ')
      const embRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })
      const embedding = embRes.data[0].embedding

      await supabase.from('embeddings').upsert({
        source_table: 'gov_decisions',
        source_id: String(d.decision_id),
        content_text: text,
        embedding,
      }, { onConflict: 'source_table,source_id' })

      total++
    }

    return NextResponse.json({ success: true, embedded: total })
  } catch (err) {
    console.error('Embedding error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
