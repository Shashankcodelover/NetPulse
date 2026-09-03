'use client';

// ═══════════════════════════════════════════════════════
// App Shell — Sidebar + Main Content Layout + Global Modals
// ═══════════════════════════════════════════════════════

import { type ReactNode, useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { PulseBot } from '@/components/pulse-bot';
import { SimulatorModal } from '@/components/simulator-modal';
import { CommandPalette } from '@/components/command-palette';
import { AudioTourBar } from '@/components/audio-tour-bar';
import { ShortcutsModal } from '@/components/shortcuts-modal';

export function AppShell({ children }: { children: ReactNode }) {
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleOpenSim = () => setSimulatorOpen(true);
    const handleOpenCmd = () => setCommandPaletteOpen(true);

    window.addEventListener('netpulse:open-simulator', handleOpenSim);
    window.addEventListener('netpulse:open-command-palette', handleOpenCmd);

    return () => {
      window.removeEventListener('netpulse:open-simulator', handleOpenSim);
      window.removeEventListener('netpulse:open-command-palette', handleOpenCmd);
    };
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <PulseBot />
      <SimulatorModal isOpen={simulatorOpen} onClose={() => setSimulatorOpen(false)} />
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <AudioTourBar />
      <ShortcutsModal />
    </div>
  );
}
