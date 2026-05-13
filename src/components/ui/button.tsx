import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}

const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  default: 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90',
  outline: 'border border-[var(--card-border)] bg-transparent hover:bg-[var(--card)] text-[var(--foreground)]',
  ghost: 'bg-transparent hover:bg-[var(--card)] text-[var(--foreground)]',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  accent: 'bg-[var(--accent,#1d4ed8)] text-white hover:opacity-90',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'
