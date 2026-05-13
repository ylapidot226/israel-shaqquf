'use client'

import Link from 'next/link'
import { Users, Clock, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import type { KnessetCommitteeSession } from '@/lib/knesset-api'

interface CommitteeSessionCardProps {
  session: KnessetCommitteeSession
}

export function CommitteeSessionCard({ session }: CommitteeSessionCardProps) {
  const isPast = session.StartDate ? new Date(session.StartDate) < new Date() : false

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 hover:border-blue-400 transition-colors">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
        <Users size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {session.BroadcastUrl && !isPast && (
            <Badge variant="red">
              <Radio size={10} className="me-1 animate-pulse" />
              שידור חי
            </Badge>
          )}
          {!isPast && <Badge variant="blue">קרוב</Badge>}
        </div>
        <p className="mt-1 text-sm font-medium text-[var(--foreground)] leading-snug line-clamp-2">
          {session.TypeDesc ?? session.Note ?? `ישיבת ועדה ${session.CommitteeID}`}
        </p>
        {session.StartDate && (
          <p className="mt-1 flex items-center gap-1 text-xs text-[var(--muted)]">
            <Clock size={11} />
            {formatDateTime(session.StartDate)}
          </p>
        )}
        {session.CommitteeID && (
          <Link
            href={`/knesset/committee/${session.CommitteeID}`}
            className="mt-1 block text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            ועדה #{session.CommitteeID}
          </Link>
        )}
      </div>
    </div>
  )
}
