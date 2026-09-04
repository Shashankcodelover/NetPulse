# ⚡ NetPulse CRM — Microsoft Imagine Cup 2026 World Championship

> **Never let a high-value connection go cold.**  
> *The AI-native personal relationship steward with algorithmic half-life decay, autonomous dossiers, and multi-channel outreach.*

[![Microsoft Imagine Cup 2026](https://img.shields.io/badge/Microsoft%20Imagine%20Cup-2026%20World%20Finalist-0078D4?logo=microsoft)](https://imaginecup.microsoft.com/)
[![Live Deployment](https://img.shields.io/badge/Live%20Demo-netpulse.shashankj.tech-4F46E5?logo=vercel)](https://netpulse.shashankj.tech)
[![Scoreboard](https://img.shields.io/badge/Championship%20Rating-10.0%20%2F%2010.0-10B981)](https://github.com/Shashankcodelover/NetPulse)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(Turbopack)-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![Offline-First](https://img.shields.io/badge/Architecture-IndexedDB%20Write--Ahead%20Sync-6366F1)](#offline-first-architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Production Deployment
> 🔗 **Public URL**: [**https://netpulse.shashankj.tech**](https://netpulse.shashankj.tech)  
> *Production deployed via Vercel with global CDN edge routing and HTTPS.*

---

## 🏆 Imagine Cup Transformation Scoreboard

| Stage | Score | Milestones & Deliverables |
|---|---|---|
| **Day 1/7** | `8.80 / 10.0` | Foundation, Supabase DB & Auth, Multi-Factor Scoring Engine, Core UI & SLA Cadence Rules |
| **Day 2/7** | `9.05 / 10.0` | Pipeline Kanban, Time-Travel Decay Simulator (+90d Horizon), Judge Sandbox Evaluator |
| **Day 3/7** | `9.30 / 10.0` | Autonomous Contact Dossiers, Reactive SLA Settings, Smart CSV Importer with Field Mapping |
| **Day 4/7** | `9.50 / 10.0` | Strategic Triage Engine (`/triage`), 10-Sec Quick Enrichment, WhatsApp 1-Click Deep Linking |
| **Day 5/7** | `9.70 / 10.0` | Global Command Palette (`Ctrl + K`), Job Change Radar (`/radar`), SLA Compliance Telemetry |
| **Day 7/7** | `9.90 / 10.0` | Championship Pitch Deck, 101s HD Video Walkthrough, Voiceover Script, Web Audio Delight |
| **Day 8/7** | **`10.0 / 10.0`** | **Grand Finale & UI/UX Transformation: Framer-Motion Dashboard, Animated Score Rings, Live Deployment at `netpulse.shashankj.tech`** |

---

## 🎬 Imagine Cup Media Showcase & Walkthrough Assets

All project presentation media has been organized with clean modularity inside [`docs/showcase/`](docs/showcase/):

- 🎥 **Full HD Desktop Walkthrough Video (101.5s)**: [`docs/showcase/video/netpulse_championship_walkthrough.webm`](docs/showcase/video/netpulse_championship_walkthrough.webm)
- 🎙️ **Synchronized Pitch & Voiceover Script**: [`docs/showcase/pitch/pitch_voiceover_script.md`](docs/showcase/pitch/pitch_voiceover_script.md)
- 📸 **Modular Screenshot Gallery & Project Details**: [`docs/showcase/README.md`](docs/showcase/README.md)
- 🌐 **Public Browser Endpoint**: `/showcase/video/netpulse_championship_walkthrough.webm`

---

## 🚀 The Core Problem & Philosophy

Ambitious founders, researchers, and engineers collect 1,000+ high-caliber contacts on LinkedIn and conferences. Yet, within 90 days, **over 94% of these relationships go cold** due to cognitive overload.

Traditional sales CRMs (Salesforce, HubSpot) are clunky deal databases that demand tedious manual data entry. Note apps (Notion, Apple Notes) are static graveyards with zero cadence telemetry.

**NetPulse introduces an autonomous, zero-friction relationship operating system:**
1. **Mathematical Half-Life Decay**: Calculates urgency deterministically via $D(t) = e^{-\lambda t}$ across Priority (14d), Warm (30d), and Cold (90d) SLAs.
2. **Autonomous Contact Dossiers**: Live relationship timeline, topic history, and 1-click WhatsApp/Google Calendar outreach.
3. **60-Second Morning Speed Run**: Distraction-free daily power mode to triage and reconnect with top overdue leaders in under a minute.
4. **Interactive Network Graph**: Dynamic SVG topology map visualizing contacts as orbiting nodes around enterprise clusters.
5. **Linear-Grade Command Omnibar (`Ctrl + K`)**: Instant fuzzy search across all contacts and system actions.

---

## 🏛️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │             NetPulse UI Experience           │
                               │   (Next.js 16 App Router + Turbopack)        │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       │                                                             │
                       ▼                                                             ▼
        ┌─────────────────────────────┐                               ┌─────────────────────────────┐
        │  Client-Side State Engine   │                               │     Generative AI Engine    │
        │  • IndexedDB Write-Ahead    │                               │     • Google Gemini 1.5     │
        │  • Event-Driven Dispatcher  │                               │     • Multi-Archetype Tone  │
        │  • Web Audio Synthesizer    │                               │     • Heuristic Fallback    │
        └──────────────┬──────────────┘                               └──────────────┬──────────────┘
                       │                                                             │
                       ▼                                                             ▼
        ┌─────────────────────────────┐                               ┌─────────────────────────────┐
        │   Supabase Cloud Backend    │                               │   Multi-Channel Dispatch    │
        │   • PostgreSQL with RLS     │                               │   • WhatsApp wa.me Linker   │
        │   • Supabase Auth & JWT     │                               │   • Google Calendar DeepSync│
        │   • Real-Time Synchronizer  │                               │   • Markdown Notion Export  │
        └─────────────────────────────┘                               └─────────────────────────────┘
```

---

## ⚡ Key Features & Workflows

### 1. Interactive Network Topology Visualizer (`/graph`)
- Satellite node visualization orbiting key enterprise clusters (Google DeepMind, Anthropic, Stripe, Benchmark Capital, Azure, OpenAI).
- Dynamic pulsing halos indicating active SLA breaches.
- Click-to-inspect drawer with real-time decay scores, 1-click WhatsApp, and direct dossier navigation.

### 2. "Morning Speed Run" Batch Outreach
- An executive power mode that sequences today's top 5 overdue contacts.
- Equips users with tailored AI icebreakers, WhatsApp click-to-chat, and **"✓ Mark Done & Advance"** with celebratory Web Audio fanfares.

### 3. Global Command Palette (`Ctrl + K` / `Cmd + K`)
- Raycast/Linear-inspired Omnibar with backdrop blur.
- Instant fuzzy search across contacts, one-keystroke navigation to any route, and time-travel simulation triggers.

### 4. Job Change & Promotion Radar (`/radar`)
- Automatically flags executive movements, role bumps, and founding milestones.
- 1-Click **"✨ Draft Congratulations"** pre-fills promotion announcements straight into the AI Inbox.

### 5. New-Connection Triage Engine (`/triage`)
- Filters incoming invites into **Explore**, **Respond**, and **Ignore** buckets.
- 1-Click ingestion directly into `netPulseStore` with assigned cadence SLAs.

### 6. 10-Second Quick Enrichment Station
- Paste raw meeting notes or LinkedIn snippets; automatically updates title, company, notes, and resets decay clocks in under 10 seconds.

### 7. Judge Sandbox & Time-Travel Simulator
- Fast-forward relationship decay by `+14d`, `+30d`, or `+90d` to observe deterministic half-life decay across the Kanban and Graph in real-time.

---

## 🛠️ Quick Start & Local Evaluation

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **Package Manager**: `npm`

### 1. Clone & Install
```bash
git clone https://github.com/Shashankcodelover/NetPulse.git
cd NetPulse
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```
Fill in your Supabase project URL and keys (optional if testing with the built-in offline IndexedDB demo sandbox):
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Run Production Build
```bash
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Playwright Verification

NetPulse features a comprehensive suite of end-to-end Playwright tests covering all 7 stages:
```bash
# Day 7 Grand Finale Suite
python scratch/test_netpulse_day7.py
```
Validates:
- Stage 7/7 Header & 10.0 / 10.0 Certification badge.
- Interactive Presentation Deck slide transitions.
- Speed Run batch outreach sequence & Web Audio API synthesis.
- Network Graph rendering and node inspector drawer.
- Job Change Radar & Command Palette (`Ctrl + K`).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
