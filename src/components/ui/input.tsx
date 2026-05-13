import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="absolute inset-y-0 start-3 flex items-center text-[var(--muted)]">{icon}</span>
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] ps-10 pe-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent,#1d4ed8)]',
              className
            )}
            {...props}
          />
        </div>
      )
    }
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent,#1d4ed8)]',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
