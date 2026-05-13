'use client'

import Link from 'next/link'
import { Calendar, Building2, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { GovDecision } from '@/lib/government-api'

interface DecisionCardProps {
  decision: GovDecision
  href?: string
}

export function DecisionCard({ decision, href }: DecisionCardProps) {
  return (
    <div className="relative flex items-start gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-green-400 transition-colors group">
      {href && <Link href={href} className="absolute inset-0 rounded-lg" aria-hidden="true" tabIndex={-1} />}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold">
        {decision.gov_num ?? 37}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] leading-snug line-clamp-2">
          {decision.title}
        </p>
        {decision.summary && (
          <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">
            {decision.summary}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {decision.ministry_name && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <Building2 size={11} />
              {decision.ministry_name}
            </span>
          )}
          {decision.decision_num && (
            <Badge variant="green">#{decision.decision_num}</Badge>
          )}
          {decision.date && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <Calendar size={11} />
              {formatDate(decision.date)}
            </span>
          )}
          {decision.url && decision.url !== '#' && (
            <a
              href={decision.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={11} />
              קרא עוד
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
