'use client';

// ═══════════════════════════════════════════════════════
// App Shell — Sidebar + Main Content Layout
// ═══════════════════════════════════════════════════════

import { type ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar';
import { PulseBot } from '@/components/pulse-bot';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <PulseBot />
    </div>
  );
}
