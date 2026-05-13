'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useLocaleContext } from './LocaleProvider'
import type { Module } from '@/types'

interface WatchlistButtonProps {
  module: Module
  type: string
  targetId: string
  targetLabel: string
  userId?: string
}

export function WatchlistButton({ module, type, targetId, targetLabel, userId }: WatchlistButtonProps) {
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t } = useLocaleContext()

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    supabase
      .from('watchlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('module', module)
      .eq('type', type)
      .eq('target_id', targetId)
      .single()
      .then(({ data }) => setFollowing(!!data))
  }, [userId, module, type, targetId])

  const toggle = async () => {
    if (!userId) {
      window.location.href = '/auth/login'
      return
    }
    setLoading(true)
    const supabase = createClient()
    if (following) {
      await supabase
        .from('watchlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('module', module)
        .eq('type', type)
        .eq('target_id', targetId)
      setFollowing(false)
    } else {
      await supabase.from('watchlist_items').insert({
        user_id: userId,
        module,
        type,
        target_id: targetId,
        target_label: targetLabel,
      })
      setFollowing(true)
    }
    setLoading(false)
  }

  return (
    <Button
      variant={following ? 'outline' : 'accent'}
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={following ? 'border-[var(--accent,#1d4ed8)] text-[var(--accent,#1d4ed8)]' : ''}
    >
      {following ? <EyeOff size={14} /> : <Eye size={14} />}
      {following ? t('unfollow') : t('follow')}
    </Button>
  )
}
