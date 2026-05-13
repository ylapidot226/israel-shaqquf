import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--foreground)] text-[var(--background)] text-2xl font-bold shadow-lg">
          ש
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-[var(--foreground)]">
          ישראל שקופה
        </h1>
        <p className="text-lg text-[var(--muted)] mb-2">Israel Shaqquf</p>
        <p className="text-[var(--muted)] mb-10">
          שקיפות ממשלתית בזמן אמת · Government Transparency in Real Time
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/knesset/dashboard"
            className="flex items-center justify-center gap-3 rounded-xl px-6 py-4 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-md"
          >
            <span className="text-xl">🏛️</span>
            <div className="text-start">
              <div className="font-semibold">כנסת</div>
              <div className="text-xs text-blue-200">הצעות חוק, ועדות, חברי כנסת</div>
            </div>
          </Link>
          <Link
            href="/government/dashboard"
            className="flex items-center justify-center gap-3 rounded-xl px-6 py-4 bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-md"
          >
            <span className="text-xl">🏢</span>
            <div className="text-start">
              <div className="font-semibold">ממשלה</div>
              <div className="text-xs text-green-200">החלטות ממשלה, משרדים, שרים</div>
            </div>
          </Link>
          <Link
            href="/chat"
            className="flex items-center justify-center gap-3 rounded-xl px-6 py-4 border border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] font-medium hover:border-[var(--foreground)] transition-colors"
          >
            <span className="text-xl">💬</span>
            <div className="text-start">
              <div className="font-semibold">שאל את המדינה</div>
              <div className="text-xs text-[var(--muted)]">AI על נתוני הממשל</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
