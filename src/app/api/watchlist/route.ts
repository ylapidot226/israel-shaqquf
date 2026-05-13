import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('watchlist_items')
    .select(`*, watchlist_rules(*)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { module, type, target_id, target_label, rule } = body

  const { data: item, error: itemError } = await supabase
    .from('watchlist_items')
    .insert({ user_id: user.id, module, type, target_id, target_label })
    .select()
    .single()

  if (itemError) return NextResponse.json({ error: itemError.message }, { status: 500 })

  if (rule) {
    await supabase.from('watchlist_rules').insert({
      watchlist_item_id: item.id,
      event_types: rule.event_types ?? ['new_item'],
      channels: rule.channels ?? ['email'],
      frequency: rule.frequency ?? 'immediate',
      filter_level: rule.filter_level ?? 'everything',
    })
  }

  return NextResponse.json({ item })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabase
    .from('watchlist_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
