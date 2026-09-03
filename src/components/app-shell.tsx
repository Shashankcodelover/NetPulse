'use client';

// ═══════════════════════════════════════════════════════
// App Shell — Sidebar + Main Content Layout + Global Modals
// ═══════════════════════════════════════════════════════

import { type ReactNode, useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { PulseBot } from '@/components/pulse-bot';
import { SimulatorModal } from '@/components/simulator-modal';

export function AppShell({ children }: { children: ReactNode }) {
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  useEffect(() => {
    const handleOpenSim = () => setSimulatorOpen(true);
    window.addEventListener('netpulse:open-simulator', handleOpenSim);
    return () => window.removeEventListener('netpulse:open-simulator', handleOpenSim);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <PulseBot />
      <SimulatorModal isOpen={simulatorOpen} onClose={() => setSimulatorOpen(false)} />
    </div>
  );
}
