import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

type NotificationRow = {
  id: string
  content: string
  watchlist_items?: {
    target_label?: string
    module?: string
    type?: string
    user_id?: string
  } | null
}

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret') ?? request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = await createServiceClient()

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: notifications } = await supabase
    .from('notifications_log')
    .select(`*, watchlist_items(target_label, module, type, user_id)`)
    .eq('read', false)
    .gte('sent_at', since)
    .limit(200)

  if (!notifications?.length) {
    return NextResponse.json({ sent: 0 })
  }

  const typed = notifications as NotificationRow[]

  const byUser: Record<string, NotificationRow[]> = {}
  for (const n of typed) {
    const userId = n.watchlist_items?.user_id
    if (!userId) continue
    if (!byUser[userId]) byUser[userId] = []
    byUser[userId].push(n)
  }

  let sent = 0

  for (const [userId, userNotifications] of Object.entries(byUser)) {
    const { data: user } = await supabase.auth.admin.getUserById(userId)
    if (!user?.user?.email) continue

    const items = userNotifications
      .map((n) => `• ${n.watchlist_items?.target_label ?? ''}: ${n.content}`)
      .join('\n')

    try {
      await resend.emails.send({
        from: 'ישראל שקופה <noreply@israelshaqquf.gov.il>',
        to: user.user.email,
        subject: '📋 סיכום יומי - ישראל שקופה',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>🏛️ ישראל שקופה - סיכום יומי</h2>
            <p>עדכונים מרשימת המעקב שלך:</p>
            <pre style="background:#f5f5f5;padding:16px;border-radius:8px;">${items}</pre>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/watchlist">נהל את רשימת המעקב</a></p>
          </div>
        `,
      })
      sent++

      const ids = userNotifications.map((n) => n.id)
      await supabase.from('notifications_log').update({ read: true }).in('id', ids)
    } catch (err) {
      console.error(`Failed to send digest to ${userId}:`, err)
    }
  }

  return NextResponse.json({ sent })
}
