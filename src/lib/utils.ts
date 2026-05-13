import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | null | undefined, locale = 'he-IL'): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string | null | undefined, locale = 'he-IL'): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '…'
}

export const KNESSET_ODATA_BASE = 'https://knesset.gov.il/Odata/ParliamentInfo.svc'
export const CKAN_API_BASE = 'https://data.gov.il/api/3/action'
export const GOV_DECISIONS_URL = 'https://www.gov.il/he/departments/policies'
