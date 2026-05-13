'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Sun, Moon, Globe, Bell, LogOut, User, Menu, X, MessageSquare, Eye } from 'lucide-react'
import { ModuleSwitcher } from './ModuleSwitcher'
import { useLocaleContext } from './LocaleProvider'
import { useThemeContext } from './ThemeProvider'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { User as UserType } from '@/types'

interface NavbarProps {
  user?: UserType | null
}

export function Navbar({ user }: NavbarProps) {
  const { t, locale, setLocale, isRTL } = useLocaleContext()
  const { isDark, toggle: toggleTheme } = useThemeContext()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isKnesset = pathname.startsWith('/knesset')
  const isGovernment = pathname.startsWith('/government')
  const module = isKnesset ? 'knesset' : isGovernment ? 'government' : null

  const knessetLinks = [
    { href: '/knesset/dashboard', label: t('dashboard') },
    { href: '/knesset/search?type=persons', label: t('members') },
    { href: '/knesset/search?type=committees', label: t('committees') },
    { href: '/knesset/search?type=bills', label: t('bills') },
  ]

  const governmentLinks = [
    { href: '/government/dashboard', label: t('dashboard') },
    { href: '/government/search', label: t('search') },
  ]

  const navLinks = isKnesset ? knessetLinks : isGovernment ? governmentLinks : []

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className={cn(
      'sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-sm',
      module === 'knesset' ? 'module-knesset' : module === 'government' ? 'module-government' : ''
    )}>
      {/* Top bar with module switcher */}
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--foreground)] text-[var(--background)] text-sm font-bold">
            {isRTL ? 'ש' : 'IS'}
          </div>
          <span className="hidden sm:block font-semibold text-sm">
            {isRTL ? 'ישראל שקופה' : 'Israel Shaqquf'}
          </span>
        </Link>

        {/* Module Switcher */}
        <div className="hidden sm:block">
          <ModuleSwitcher />
        </div>

        {/* Sub-nav links (desktop) */}
        {navLinks.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 ms-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  pathname === link.href || (link.href.includes('?') && pathname === link.href.split('?')[0])
                    ? 'text-[var(--accent,#1d4ed8)] font-medium'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex-1" />

        {/* Right side controls */}
        <div className="flex items-center gap-1.5">
          {/* AI Chat */}
          <Link
            href="/chat"
            className={cn(
              'hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              pathname === '/chat'
                ? 'bg-[var(--card)] text-[var(--foreground)]'
                : 'text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]'
            )}
          >
            <MessageSquare size={15} />
            <span className="hidden lg:inline">{t('chat')}</span>
          </Link>

          {/* Watchlist */}
          {user && (
            <Link
              href="/watchlist"
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors',
                pathname === '/watchlist'
                  ? 'bg-[var(--card)] text-[var(--foreground)]'
                  : 'text-[var(--muted)] hover:bg-[var(--card)]'
              )}
              title={t('watchlist')}
            >
              <Eye size={15} />
            </Link>
          )}

          {/* Notifications */}
          {user && (
            <button className="flex items-center rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--card)] transition-colors" title={t('watchlist')}>
              <Bell size={15} />
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--card)] transition-colors"
            title={isDark ? t('lightMode') : t('darkMode')}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === 'he' ? 'en' : 'he')}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--card)] transition-colors"
            title={locale === 'he' ? 'Switch to English' : 'עבור לעברית'}
          >
            <Globe size={13} />
            <span>{locale === 'he' ? 'EN' : 'HE'}</span>
          </button>

          {/* User menu / Login */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--card)] transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-[var(--accent,#1d4ed8)] flex items-center justify-center text-white text-xs font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute end-0 top-full mt-1 z-20 w-48 rounded-xl border border-[var(--card-border)] bg-[var(--background)] shadow-lg py-1">
                    <div className="px-3 py-2 text-xs text-[var(--muted)] border-b border-[var(--card-border)]">
                      {user.email}
                    </div>
                    <Link href="/watchlist" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--card)] transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <Eye size={14} />
                      {t('watchlist')}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-[var(--card)] transition-colors"
                    >
                      <LogOut size={14} />
                      {t('logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-opacity"
            >
              <User size={13} />
              <span>{t('login')}</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex items-center rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--card)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--card-border)] bg-[var(--background)] px-4 py-3 space-y-2">
          <div className="mb-3">
            <ModuleSwitcher />
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--card)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/chat" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--card)]">
            <MessageSquare size={14} />{t('chat')}
          </Link>
          {user && (
            <Link href="/watchlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--card)]">
              <Eye size={14} />{t('watchlist')}
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
