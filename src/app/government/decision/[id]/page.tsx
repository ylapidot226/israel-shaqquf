import Link from 'next/link'
import { ArrowRight, Calendar, Building2, ExternalLink } from 'lucide-react'
import { fetchGovDecisions } from '@/lib/government-api'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface DecisionPageProps {
  params: Promise<{ id: string }>
}

export default async function DecisionPage({ params }: DecisionPageProps) {
  const { id } = await params
  const decisions = await fetchGovDecisions(50)
  const decision = decisions.find((d) => d.decision_id === id)

  if (!decision) {
    return (
      <div className="module-government mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-[var(--muted)]">החלטה לא נמצאה</p>
        <Link href="/government/dashboard" className="mt-4 inline-block text-green-600 hover:underline">חזרה לדשבורד</Link>
      </div>
    )
  }

  return (
    <div className="module-government mx-auto max-w-4xl px-4 py-6 md:px-6">
      <Link href="/government/dashboard" className="mb-4 flex items-center gap-1 text-sm text-green-600 hover:underline">
        <ArrowRight size={14} />
        חזרה לדשבורד
      </Link>

      <article className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 text-sm font-bold">
            {decision.gov_num ?? 37}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[var(--foreground)] leading-snug">
              {decision.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {decision.decision_num && <Badge variant="green">החלטה #{decision.decision_num}</Badge>}
              {decision.gov_num && <Badge variant="gray">ממשלה {decision.gov_num}</Badge>}
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {decision.ministry_name && (
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <Building2 size={14} />
              <span>{decision.ministry_name}</span>
            </div>
          )}
          {decision.date && (
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <Calendar size={14} />
              <span>{formatDate(decision.date)}</span>
            </div>
          )}
        </div>

        {decision.summary && (
          <div className="mt-5 pt-5 border-t border-[var(--card-border)]">
            <h2 className="mb-2 font-semibold text-[var(--foreground)]">סיכום</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{decision.summary}</p>
          </div>
        )}

        {decision.url && decision.url !== '#' && (
          <div className="mt-5 pt-5 border-t border-[var(--card-border)]">
            <a
              href={decision.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              <ExternalLink size={14} />
              קישור להחלטה המלאה
            </a>
          </div>
        )}
      </article>
    </div>
  )
}
