'use client';

// ═══════════════════════════════════════════════════════
// Scenario Tour Bar — Guided 1-Click Interactive Evaluation Strip
// Allows evaluators, investors, and judges to simulate real-world scenarios
// with zero setup: Baseline Today, +30d Decay SLA Breaches, VC Syndicate, Virtuality
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles,
  Zap,
  AlertTriangle,
  RotateCcw,
  Users,
  Orbit,
  Play,
  CheckCircle2,
  ChevronRight,
  Sliders,
  X,
} from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';
import { soundFx } from '@/lib/sound';

export function ScenarioTourBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [decayDays, setDecayDays] = useState(0);
  const [activeScenario, setActiveScenario] = useState<'baseline' | 'decay30' | 'syndicate' | 'virtuality'>('baseline');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    netPulseStore.getDecayOffsetDays().then(d => {
      setDecayDays(d);
      if (d === 30) setActiveScenario('decay30');
      else if (d === 0 && pathname === '/virtuality') setActiveScenario('virtuality');
      else if (d === 0) setActiveScenario('baseline');
    });

    const handleStateChange = () => {
      netPulseStore.getDecayOffsetDays().then(d => {
        setDecayDays(d);
        if (d === 30) setActiveScenario('decay30');
        else if (d === 0) setActiveScenario('baseline');
      });
    };

    window.addEventListener('netpulse:state-changed', handleStateChange);
    return () => window.removeEventListener('netpulse:state-changed', handleStateChange);
  }, [pathname]);

  const triggerScenario = async (scenario: 'baseline' | 'decay30' | 'syndicate' | 'virtuality') => {
    setActiveScenario(scenario);
    soundFx.playSuccessChime();

    if (scenario === 'baseline') {
      await netPulseStore.setDecayOffsetDays(0);
      if (pathname !== '/') router.push('/');
    } else if (scenario === 'decay30') {
      await netPulseStore.setDecayOffsetDays(30);
      if (pathname !== '/') router.push('/');
    } else if (scenario === 'syndicate') {
      router.push('/contacts');
    } else if (scenario === 'virtuality') {
      router.push('/virtuality');
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="btn btn-sm"
        style={{
          position: 'fixed',
          top: 14,
          right: 80,
          zIndex: 40,
          background: 'rgba(99, 102, 241, 0.9)',
          backdropFilter: 'blur(10px)',
          color: '#ffffff',
          fontWeight: 700,
          borderRadius: 20,
          fontSize: '0.74rem',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
        }}
      >
        <Sparkles size={13} /> Evaluator Tour
      </button>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.25)',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        fontSize: '0.8rem',
        color: '#e2e8f0',
        zIndex: 35,
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: decayDays > 0 ? '#ef4444' : '#10b981',
              boxShadow: decayDays > 0 ? '0 0 8px #ef4444' : '0 0 8px #10b981',
            }}
          />
          <span style={{ fontWeight: 800, letterSpacing: '0.02em', color: '#f8fafc', fontSize: '0.78rem' }}>
            EVALUATOR SANDBOX
          </span>
        </div>

        <span style={{ color: '#64748b' }}>|</span>

        {/* 1-Click Scenario Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => triggerScenario('baseline')}
            className="btn btn-sm"
            style={{
              fontSize: '0.74rem',
              padding: '3px 10px',
              borderRadius: 20,
              background: activeScenario === 'baseline' && decayDays === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeScenario === 'baseline' && decayDays === 0 ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
              color: activeScenario === 'baseline' && decayDays === 0 ? '#10b981' : '#94a3b8',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            🟢 1. Baseline Horizon (Today)
          </button>

          <button
            onClick={() => triggerScenario('decay30')}
            className="btn btn-sm"
            style={{
              fontSize: '0.74rem',
              padding: '3px 10px',
              borderRadius: 20,
              background: decayDays > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${decayDays > 0 ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
              color: decayDays > 0 ? '#ef4444' : '#94a3b8',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            🔴 2. +30d Urgent SLA Alert
          </button>

          <button
            onClick={() => triggerScenario('syndicate')}
            className="btn btn-sm"
            style={{
              fontSize: '0.74rem',
              padding: '3px 10px',
              borderRadius: 20,
              background: pathname === '/contacts' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${pathname === '/contacts' ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'}`,
              color: pathname === '/contacts' ? '#a5b4fc' : '#94a3b8',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            🟣 3. Tier 1 Syndicate
          </button>

          <button
            onClick={() => triggerScenario('virtuality')}
            className="btn btn-sm"
            style={{
              fontSize: '0.74rem',
              padding: '3px 10px',
              borderRadius: 20,
              background: pathname === '/virtuality' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${pathname === '/virtuality' ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'}`,
              color: pathname === '/virtuality' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            🌌 4. 3D Virtuality Linking
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('netpulse:open-simulator'))}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '0.72rem', color: '#94a3b8', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Sliders size={12} /> Time Simulator
        </button>

        <button
          onClick={() => setCollapsed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Collapse evaluator bar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}