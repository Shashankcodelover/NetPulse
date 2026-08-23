# NetPulse — Project Documents
*A personal relationship-management tool for LinkedIn & WhatsApp networks*

---

## 📋 Cover Prompt — Paste This First

> Here are my complete project documents for an app called NetPulse. Use these as the single source of truth for everything you build — don't invent features, tech choices, or data sources outside of what's specified here. Build it in the phase order given in Document 06. Ask me before making any architectural decision not covered in these docs. Start with Phase 1.
>
> [Paste the rest of this document below this line]

---

## ✅ Setup Checklist (do this once, on LinkedIn itself, before using NetPulse)

1. Open your top 30–50 priority connections' profiles → click the bell icon → "Subscribe to notifications"
2. Go to LinkedIn Settings → Notifications → turn down general "Posts from your network" noise
3. Export your connections: LinkedIn Settings → Data Privacy → "Get a copy of your data" → Connections → download CSV
4. Import that CSV into NetPulse to seed your contact database
5. Re-export and re-import every 2–4 weeks to keep everyone's company/title current

---

## 01 — PRD (Product Requirements Document)

| Field | Content |
|---|---|
| **App Name** | NetPulse |
| **Tagline** | Never let a good connection go cold. |
| **Problem** | Users with 1,000+ LinkedIn connections and large WhatsApp contact lists can't track who's active, who's gone quiet, who works where, or who deserves a follow-up. Networking value is lost because there's no system — just a noisy feed. |
| **Target User** | Professionals, founders, and job-seekers with large but unmanaged networks who want to turn "connections" into real relationships and opportunities, without spending hours a day on LinkedIn. |
| **Core Value Proposition** | Turns your connections list into a prioritized, trackable pipeline — like a CRM, but for your personal network — and drafts (never auto-sends) natural replies and comments for you to approve. |
| **Core Features (Must Have)** | 1. Import connections from a LinkedIn data export (CSV) and/or manual entry<br>2. Tag & segment contacts (industry, company tier, relationship warmth, last contact date)<br>3. Priority scoring engine — configurable weights for recency, company tier (e.g. target companies score higher), **role/title** (e.g. decision-maker titles like Founder/VP/Director score higher), and relationship warmth; weights adjustable in Settings<br>4. Daily digest: "10–15 people to reach out to today," ranked by priority<br>5. Cadence tracker: flags contacts overdue for contact (e.g. priority contacts every 2–3x/week, others monthly)<br>6. Post/update intake: paste a contact's post/update text in → get a plain-language summary + 2–3 draft reply options (congratulate, ask a question, share an insight) — user picks and posts manually<br>7. New-connection triage: when you paste in new LinkedIn "new connections" or invite data, auto-sorts into Explore / Respond / Ignore buckets<br>8. Notification center: summarized, not per-event — one digest, not 40 pings<br>9. **Bulk profile refresh**: re-import your full LinkedIn connections CSV every 2–4 weeks to auto-update name/company/title for all 1,500+ contacts and flag anyone who changed jobs since last import<br>10. **Priority-tier enrichment**: for your top 50–100 contacts, a quick "update this person" form where you paste in anything new (a recent post, role change, conversation note) in ~10 seconds — this keeps your closest connections current without any scraping or automation<br>11. **Automated daily digest delivery**: a scheduled job runs every morning (independent of whether you open the app) and emails you your prioritized "N people to contact today" list — this is what makes it feel "always on" |
| **Nice to Have (v2)** | WhatsApp Business API integration for scheduled check-in reminders; company-news alerts for target companies; browser extension to make copy-paste one click instead of manual |
| **Out of Scope** | Auto-scraping LinkedIn profiles/posts; auto-commenting or auto-messaging without human approval; anything that violates LinkedIn's or WhatsApp's Terms of Service |
| **User Stories** | As a user, I want a daily list of 10–15 people to contact, so I don't have to decide who myself.<br>As a user, I want to know who I haven't spoken to in 30+ days, so relationships don't go cold.<br>As a user, I want a draft comment for a friend's promotion post, so replying feels natural but takes 10 seconds. |
| **Success Metrics** | Daily active use of the digest; % of flagged contacts actually reached out to per week; reduction in "cold" (90+ day silent) high-priority contacts over time |

---

## 02 — TRD (Technical Requirements Document)

| Field | Content |
|---|---|
| **Frontend** | Next.js 14 (TypeScript) + Tailwind CSS |
| **Backend** | Next.js API routes |
| **Database** | PostgreSQL via Supabase |
| **Auth** | Supabase Auth (email + Google OAuth) — single-user or small-team use |
| **Hosting** | Vercel (frontend/API), Supabase (DB + storage) |
| **Third-party APIs** | Resend or similar (transactional email for daily digest). Optional v2: WhatsApp Business API |
| **Scheduling ("24/7" behavior)** | Vercel Cron Jobs — hosted apps don't run continuously by default, so a cron job triggers the digest-generation function once daily at a set time (e.g. 8 AM) and emails the result. This is what makes the app feel always-on without you opening it |
| **Key Libraries** | Papaparse (CSV import), React Query, Zod (validation), Lucide Icons, date-fns (cadence calculations) |
| **Environment Variables** | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Constraints** | Must run on free/low-cost tiers; must not call any LinkedIn scraping or unofficial API; all "AI draft" features run against user-pasted text only, never live-fetched content |

---

## 03 — App Flow

| Field | Content |
|---|---|
| **Pages** | `/` (Today's Digest), `/contacts` (full list), `/contacts/[id]` (contact detail + history + manual edit), `/import` (CSV upload — also supports re-upload to refresh existing data), `/inbox` (post-to-reply drafting tool), `/settings` (priority scoring weights, digest email time, cadence targets) |
| **Navigation** | Left sidebar: Digest, Contacts, Import, Inbox, Settings |
| **First Screen** | Empty-state Digest page prompting CSV import |
| **Auth Flow** | Sign up → Email verify → Import connections → Digest |
| **Core Journey 1 — Daily digest** | User opens app → sees "15 people to contact today" ranked by priority → clicks a contact → sees last-contact date, notes, suggested opener → marks as "contacted" or "snoozed" |
| **Core Journey 2 — Reply drafting** | User pastes a contact's post text into Inbox → gets summary + 3 draft replies → copies preferred one → pastes into LinkedIn manually → marks "replied" in NetPulse |
| **Empty States** | No contacts yet → prompt to import; no overdue contacts → "You're all caught up" |
| **Error States** | Malformed CSV → row-level error report; failed import → retry option |
| **Redirects** | After import → Digest; after marking all done → Digest empty state |

---

## 04 — UI/UX Design Brief

| Field | Content |
|---|---|
| **Aesthetic** | Minimal, calm, dashboard-like. Think Notion + Linear — not a noisy CRM. |
| **Primary Color** | #4F46E5 (indigo) |
| **Background** | #FAFAFA (light) / #0F0F10 (dark) |
| **Text Color** | #1A1A1A / #EDEDED |
| **Accent/CTA** | #4F46E5 |
| **Font** | Inter |
| **Border Radius** | 10px |
| **Shadows** | Very subtle, card-based |
| **Dark/Light Mode** | Both, dark as default |
| **Reference Apps** | Notion, Linear, Attio (CRM) |
| **Key UI Patterns** | Priority queue list (like a to-do list), contact cards, a single daily digest hero card |
| **Mobile** | Fully responsive; digest list is the primary mobile view |

---

## 05 — Backend Schema

| Table | Columns |
|---|---|
| **users** | id (uuid), email, name, created_at |
| **contacts** | id (uuid), user_id (FK), full_name, company, title, previous_company, previous_title, source ('linkedin'/'whatsapp'/'manual'), relationship_tier ('priority'/'warm'/'cold'), last_contacted_at, last_bulk_synced_at, last_enriched_at, created_at |
| **interactions** | id (uuid), contact_id (FK), type ('message'/'comment'/'call'/'note'), content, created_at |
| **priority_scores** | contact_id (FK), score (int), last_calculated_at — recalculated nightly from recency + tier + engagement history |
| **drafts** | id (uuid), contact_id (FK), source_text (pasted post), summary, draft_options (jsonb), created_at |
| **Relationships** | contacts.user_id → users.id; interactions.contact_id → contacts.id; drafts.contact_id → contacts.id |
| **Auth Provider** | Supabase Auth, JWT |
| **Row Level Security** | Users can only read/write their own contacts and interactions |
| **File Storage** | CSV imports processed in-memory, not stored |
| **Sensitive Fields** | None beyond standard contact info — no credentials or scraped content stored |

---

## 06 — Implementation Plan

| Phase | Content |
|---|---|
| **Phase 1: Setup** | Init Next.js + Supabase project, env vars, repo structure |
| **Phase 2: Database** | Create tables above, RLS policies, seed with sample data |
| **Phase 3: Auth** | Supabase Auth signup/login, protected routes |
| **Phase 4: CSV Import & Bulk Resync** | Parse LinkedIn export CSV → populate contacts table, dedupe by profile URL/name+company; on re-import, diff against existing rows and flag company/title changes |
| **Phase 5: Priority Scoring** | Build scoring function (recency-weighted + tier-weighted), nightly recalculation job |
| **Phase 6: Daily Digest** | Query top N (10–15) overdue/priority contacts, render digest UI |
| **Phase 7: Reply Drafting Tool** | Paste-text-in → summary + 3 draft replies (using Claude API), copy-to-clipboard UX |
| **Phase 8: Cadence Tracking** | Overdue logic (priority: 2–3x/week, warm: monthly, cold: quarterly), snooze/mark-contacted actions |
| **Phase 9: Priority-Tier Enrichment** | "Update this person" quick-entry form for top 50–100 contacts; store notes/updates against contact record; surface in digest |
| **Phase 10: Polish & Deploy** | Responsive design, empty/error states, deploy to Vercel |
| **Done Criteria** | User can import contacts, see a ranked daily digest, paste a post and get draft replies, and mark contacts as followed-up — entirely without any automated LinkedIn access |
