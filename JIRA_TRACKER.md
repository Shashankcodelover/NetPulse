# 📋 JIRA TRACKER — NetPlus CRM Engine

## 🎯 Project Aim & Modern World Relevance
NetPlus is an intelligent personal CRM system engineered to solve professional relationship management challenges. It integrates LinkedIn & WhatsApp contacts with PostgreSQL Supabase database, Papaparse batch CSV import, dynamic priority scoring engine, and daily relationship digests.

---

## 🔍 Identified Loopholes & Feature Audits
- [x] **Database & Auth**: Supabase PostgreSQL database schema with RLS security policies & auth callback handlers.
- [x] **CSV Import**: Papaparse + Zod schema validation per row, change detection, batch upserts.
- [x] **Priority Scoring**: Multi-factor scoring engine (recency, tier, company/role bonuses, cadence overdue calculations).
- [x] **Daily Digest UI**: Notion/Linear dark-mode aesthetic with ranked contact cards & score rings.

---

## 🚀 Upgrades Checklist & Status

| Task ID | Component | Description | Status |
| :--- | :--- | :--- | :--- |
| NP-101 | Frontend | Next.js 16 + Tailwind CSS v4 design system & UI pages | Completed |
| NP-102 | Database | Supabase schema migrations, indexes, RLS policies | Completed |
| NP-103 | Scoring Engine | Multi-parameter relationship recency & cadence engine | Completed |
| NP-104 | Build & Sync | Next.js 16 Turbopack production compilation | Completed |
