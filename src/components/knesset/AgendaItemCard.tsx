import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { KnessetAgendaItem } from '@/lib/knesset-api'

interface AgendaItemCardProps {
  item: KnessetAgendaItem
}

export function AgendaItemCard({ item }: AgendaItemCardProps) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--card-border)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--foreground)] leading-snug line-clamp-2">
          {item.Name}
        </p>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {item.SubTypeDesc && <Badge variant="gray">{item.SubTypeDesc}</Badge>}
          {item.LastUpdatedDate && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <Calendar size={11} />
              {formatDate(item.LastUpdatedDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
