'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocaleContext } from './LocaleProvider'
import { cn } from '@/lib/utils'

const modules = [
  { id: 'knesset', icon: '🏛️', labelKey: 'knesset' as const, href: '/knesset/dashboard', active: true },
  { id: 'government', icon: '🏢', labelKey: 'government' as const, href: '/government/dashboard', active: true },
  { id: 'court', icon: '⚖️', labelKey: 'court' as const, href: '#', active: false },
]

export function ModuleSwitcher() {
  const pathname = usePathname()
  const { t } = useLocaleContext()

  const currentModule = pathname.startsWith('/government') ? 'government'
    : pathname.startsWith('/knesset') ? 'knesset'
    : null

  return (
    <div className="flex items-center gap-1">
      {modules.map((mod) => {
        const isActive = currentModule === mod.id
        const label = mod.id === 'court'
          ? `${mod.icon} ${t('court')} — ${t('comingSoon')}`
          : `${mod.icon} ${t(mod.labelKey)}`

        if (!mod.active) {
          return (
            <span
              key={mod.id}
              title={label}
              className="hidden md:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--muted)] cursor-not-allowed opacity-50"
            >
              <span>{mod.icon}</span>
              <span className="hidden lg:inline">{t(mod.labelKey)}</span>
            </span>
          )
        }

        return (
          <Link
            key={mod.id}
            href={mod.href}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? mod.id === 'knesset'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]'
            )}
          >
            <span>{mod.icon}</span>
            <span className="hidden lg:inline">{t(mod.labelKey)}</span>
          </Link>
        )
      })}
    </div>
  )
}
