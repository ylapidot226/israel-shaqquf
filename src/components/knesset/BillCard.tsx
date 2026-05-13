'use client'

import Link from 'next/link'
import { FileText, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate, truncate } from '@/lib/utils'
import { BILL_STATUS, type KnessetBill } from '@/lib/knesset-api'

interface BillCardProps {
  bill: KnessetBill
}

function getBillStatusVariant(statusId: number): 'blue' | 'green' | 'red' | 'yellow' | 'gray' {
  if (statusId === 5 || statusId === 118) return 'green'
  if (statusId === 6) return 'red'
  if (statusId === 4) return 'blue'
  if (statusId === 2 || statusId === 3) return 'yellow'
  return 'gray'
}

export function BillCard({ bill }: BillCardProps) {
  const statusLabel = BILL_STATUS[bill.StatusID] ?? String(bill.StatusID)
  const statusVariant = getBillStatusVariant(bill.StatusID)

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 hover:border-blue-400 transition-colors group">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        <FileText size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] leading-snug line-clamp-2">
          {bill.Name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          {bill.SubTypeDesc && (
            <Badge variant="gray">{bill.SubTypeDesc}</Badge>
          )}
          {bill.KnessetNum && (
            <span className="text-xs text-[var(--muted)]">כנסת {bill.KnessetNum}</span>
          )}
          {bill.LastUpdatedDate && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <Calendar size={11} />
              {formatDate(bill.LastUpdatedDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
