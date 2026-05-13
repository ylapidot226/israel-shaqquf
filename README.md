# ישראל שקופה | Israel Shaqquf

> שקיפות ממשלתית בזמן אמת · Government Transparency in Real Time

A bilingual (Hebrew/English) government transparency platform providing real-time access to Israeli Knesset legislation and Government decisions.

## Features

### 🏛️ Knesset Module
- **Dashboard** — Recent bills (KNS_Bill), upcoming committee sessions, agenda items
- **MK Profiles** — Per-member bills, committees, positions
- **Committee Pages** — Sessions, items discussed, live broadcast links
- **Search** — By MK / committee / faction / bill keyword

### 🏢 Government Module
- **Dashboard** — Recent government decisions by ministry/date
- **Ministry Profiles** — Decisions per ministry, ministers over time
- **Decision Detail** — Full decision view with source links
- **Search** — By ministry / topic / date range / decision number

### Shared Features
- **🔔 Watchlist** — Follow MKs, factions, committees, bills, ministers, ministries with configurable alert channels (email, RSS, browser push) and frequencies (immediate, daily, weekly)
- **💬 AI Chat ("שאל את המדינה")** — RAG pipeline: question → OpenAI embedding → pgvector similarity search → Claude Sonnet answer with source links
- **Auth** — Supabase Auth (email + Google OAuth)
- **RTL/LTR** — Hebrew RTL default, English LTR toggle
- **Dark/Light Mode** — Persisted per browser

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres + pgvector) |
| Auth | Supabase Auth |
| AI Chat | Anthropic Claude Sonnet (`@anthropic-ai/sdk`) |
| Embeddings | OpenAI `text-embedding-3-small` |
| Email | Resend |
| Deployment | Vercel |

## Data Sources

- **Knesset**: `https://knesset.gov.il/Odata/ParliamentInfo.svc` — Public OData API, no key required
- **Government**: `https://data.gov.il/api/3/action/` — CKAN API, public, no key required

## Setup

### 1. Prerequisites
- Node.js 18+
- Supabase project
- OpenAI API key (for embeddings)
- Anthropic API key (for AI chat)
- Resend API key (for email notifications)

### 2. Database Setup
Run the schema in your Supabase SQL editor:
```bash
# Copy contents of supabase/schema.sql into Supabase SQL editor and run
```
This creates all tables, RLS policies, and the `match_embeddings` pgvector function.

### 3. Environment Variables
```bash
cp .env.example .env.local
# Fill in your values
```

Required variables:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
CRON_SECRET=          # random secret for cron endpoint auth
NEXT_PUBLIC_SITE_URL= # e.g. https://your-app.vercel.app
```

### 4. Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel
```bash
vercel deploy
```
Add all env vars in Vercel dashboard. The `vercel.json` cron configuration is included automatically:
- Every 15 min: Knesset data sync
- Every 15 min: Government data sync
- 2am nightly: Generate embeddings
- 8am daily: Send email digests

## Project Structure

```
src/
├── app/
│   ├── knesset/
│   │   ├── dashboard/       # Knesset dashboard (live OData)
│   │   ├── mk/[id]/         # MK profile page
│   │   ├── committee/[id]/  # Committee page
│   │   └── search/          # Knesset search
│   ├── government/
│   │   ├── dashboard/       # Government dashboard
│   │   ├── decision/[id]/   # Decision detail
│   │   ├── ministry/[id]/   # Ministry profile
│   │   └── search/          # Government search
│   ├── chat/                # AI chat (RAG)
│   ├── watchlist/           # User watchlist
│   ├── auth/
│   │   ├── login/
│   │   └── signup/
│   └── api/
│       ├── ai/chat/         # Claude RAG endpoint
│       ├── knesset/search/  # Knesset search proxy
│       ├── government/search/
│       ├── watchlist/       # Watchlist CRUD
│       ├── auth/callback/   # OAuth callback
│       ├── cron/
│       │   ├── sync-knesset/
│       │   ├── sync-government/
│       │   └── generate-embeddings/
│       └── notifications/digest/
├── components/
│   ├── shared/              # Navbar, Providers, WatchlistButton
│   ├── knesset/             # BillCard, CommitteeSessionCard, AgendaItemCard
│   ├── government/          # DecisionCard
│   └── ui/                  # Button, Card, Badge, Input, Skeleton
├── lib/
│   ├── knesset-api.ts       # Knesset OData helpers
│   ├── government-api.ts    # Government CKAN helpers
│   ├── supabase/            # Server/client/middleware clients
│   ├── i18n.ts              # Hebrew/English translations
│   └── utils.ts             # cn(), formatDate(), etc.
├── hooks/                   # useLocale, useTheme
└── types/                   # Shared TypeScript types
```

## Supabase Schema

Key tables: `persons`, `bills`, `factions`, `committees`, `committee_sessions`, `agenda_items`, `gov_decisions`, `ministries`, `ministers`, `embeddings` (pgvector), `watchlist_items`, `watchlist_rules`, `notifications_log`, `ai_chat_history`

All tables have Row Level Security (RLS). Public tables are readable by all. User tables are scoped to `auth.uid()`.
