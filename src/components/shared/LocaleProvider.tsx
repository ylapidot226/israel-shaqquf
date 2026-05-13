'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Locale } from '@/lib/i18n'
import { t as translate, type TranslationKey } from '@/lib/i18n'

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: TranslationKey) => string
  dir: 'rtl' | 'ltr'
  isRTL: boolean
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'he',
  setLocale: () => {},
  t: (k) => k,
  dir: 'rtl',
  isRTL: true,
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('he')

  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null
    const l = stored === 'en' ? 'en' : 'he'
    setLocaleState(l)
    document.documentElement.dir = l === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('locale', l)
    document.documentElement.dir = l === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }

  const t = (key: TranslationKey) => translate(key, locale)
  const dir = locale === 'he' ? 'rtl' : 'ltr'

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir, isRTL: locale === 'he' }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocaleContext() {
  return useContext(LocaleContext)
}
