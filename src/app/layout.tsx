import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { LocaleProvider } from '@/components/shared/LocaleProvider'
import { Navbar } from '@/components/shared/Navbar'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'ישראל שקופה | Israel Shaqquf',
  description: 'שקיפות ממשלתית בזמן אמת | Government Transparency in Real Time',
  icons: { icon: '/favicon.ico' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {}

  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <LocaleProvider>
            <Navbar user={user} />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-[var(--card-border)] py-6 text-center text-xs text-[var(--muted)]">
              <p>ישראל שקופה | Israel Shaqquf &copy; {new Date().getFullYear()}</p>
              <p className="mt-1">נתונים: כנסת ישראל, data.gov.il</p>
            </footer>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
