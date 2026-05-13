import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton h-4 w-full', className)} />
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={i === 0 ? 'w-3/4' : 'w-full'} />
        </td>
      ))}
    </tr>
  )
}
