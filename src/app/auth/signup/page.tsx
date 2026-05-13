'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">בדוק את האימייל שלך</h1>
          <p className="text-sm text-[var(--muted)]">שלחנו לך קישור לאישור חשבון ל-{email}</p>
          <Link href="/auth/login" className="mt-4 inline-block text-sm text-[var(--foreground)] hover:underline">
            חזרה לכניסה
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xl font-bold">
            ש
          </div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">הרשמה</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">צור חשבון ב-ישראל שקופה</p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">אימייל</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">סיסמה</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="לפחות 8 תווים" minLength={8} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'יוצר חשבון...' : 'הרשמה'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          כבר יש חשבון?{' '}
          <Link href="/auth/login" className="text-[var(--foreground)] font-medium hover:underline">
            כניסה
          </Link>
        </p>
      </div>
    </div>
  )
}
