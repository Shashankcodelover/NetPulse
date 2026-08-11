# NetPulse

> Never let a good connection go cold.

NetPulse is a personal CRM for managing your LinkedIn and WhatsApp networks. It turns your connections list into a prioritized, trackable pipeline — like a CRM, but for your personal network.

## What It Does

- **Daily Digest**: See 10-15 prioritized contacts to reach out to each day, ranked by recency, relationship tier, and role importance
- **CSV Import**: Import LinkedIn connections exports with bulk resync support (detects job changes, title changes)
- **Priority Scoring**: Configurable scoring engine weighing recency, relationship tier, role/title, and engagement history
- **Contact Management**: Full contact list with search, filtering by tier (priority/warm/cold), and sorting
- **Interaction History**: Track notes, messages, calls, and interactions per contact
- **Reply Drafting** (UI ready): Paste a post → get summary + draft replies (AI integration coming)
- **Settings**: Customize scoring weights, cadence targets, target companies/titles

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (TypeScript) + Tailwind CSS v4 |
| Backend | Next.js API routes |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (email + Google OAuth) |
| Design | Dark-first, Notion/Linear-inspired aesthetic |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### Setup

1. **Clone and install**
   ```bash
   cd netplus-app
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase URL and keys from your [Supabase dashboard](https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api).

3. **Create database tables**
   Open the Supabase SQL Editor and run the contents of `supabase/schema.sql`. This creates all tables with RLS policies.

4. **Enable Google OAuth** (optional)
   In your Supabase dashboard → Authentication → Providers → Google, add your Google OAuth credentials.

5. **Run locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### LinkedIn CSV Import

1. Go to LinkedIn → Settings → Data Privacy → "Get a copy of your data" → Connections
2. Download the CSV when ready
3. In NetPulse, go to Import → upload the CSV
4. Re-import every 2-4 weeks to catch job/title changes

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated pages (with sidebar)
│   │   ├── page.tsx        # Daily Digest (home)
│   │   ├── contacts/       # Contacts list + detail pages
│   │   ├── import/         # CSV import
│   │   ├── inbox/          # Reply drafting tool
│   │   └── settings/       # Scoring weights, cadence, preferences
│   ├── auth/               # Login, signup, OAuth callback
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Design system
├── components/             # Shared UI components
├── lib/
│   ├── csv-parser.ts       # LinkedIn CSV parsing + validation
│   ├── scoring.ts          # Priority scoring engine
│   ├── types.ts            # TypeScript type definitions
│   └── supabase/           # Supabase client utilities
└── middleware.ts            # Auth route protection
```

## What's Not Built Yet

- **Phase 7**: AI-powered reply drafting (UI is ready, needs Claude/OpenAI API integration)
- **Phase 8**: Automated cadence tracking with snooze logic
- **Phase 9**: Priority-tier enrichment (quick-update form for top contacts)
- **Phase 10**: Vercel Cron for daily digest email, production deployment

## Out of Scope

- No LinkedIn scraping or unofficial API access
- No auto-messaging without human approval
- All data comes from user-uploaded CSVs or manual entry
