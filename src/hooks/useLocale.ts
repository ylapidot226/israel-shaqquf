'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Locale } from '@/lib/i18n'
import { t as translate, type TranslationKey } from '@/lib/i18n'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('he')

  useEffect(() => {
    const stored = localStorage.getItem('locale') as Locale | null
    if (stored === 'en' || stored === 'he') setLocaleState(stored)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('locale', l)
    document.documentElement.dir = l === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = l
  }, [])

  const t = useCallback((key: TranslationKey) => translate(key, locale), [locale])

  const dir = locale === 'he' ? 'rtl' : 'ltr'

  return { locale, setLocale, t, dir, isRTL: locale === 'he' }
}
