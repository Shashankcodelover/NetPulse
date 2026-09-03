'use client';

// ═══════════════════════════════════════════════════════════════════════════════
// NetPulse — Interactive Time-Travel & Decay Simulator (Judge Sandbox)
// Simulates mathematical relationship half-life decay across custom temporal horizons
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle, RefreshCw, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStateUpdated?: () => void;
}

export function SimulatorModal({ isOpen, onClose, onStateUpdated }: SimulatorModalProps) {
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      netPulseStore.getDecayOffsetDays().then(setCurrentOffset);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApplyOffset = async (days: number) => {
    setIsApplying(true);
    await netPulseStore.setDecayOffsetDays(days);
    setCurrentOffset(days);

    // Broadcast state change across the app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed', { detail: { offsetDays: days } }));
    }

    if (onStateUpdated) onStateUpdated();
    setIsApplying(false);

    if (days === 0) {
      showToast('Reset decay simulation to baseline.');
    } else {
      showToast(`Simulated +${days} days into the future! Check recalculated scores & SLA alerts.`);
    }
  };

  const handleResetAll = async () => {
    setIsApplying(true);
    await netPulseStore.resetToBaseline();
    setCurrentOffset(0);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed', { detail: { offsetDays: 0 } }));
    }

    if (onStateUpdated) onStateUpdated();
    setIsApplying(false);
    showToast('Database reset to pristine Silicon Valley baseline.');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
          padding: '26px',
          color: '#f8fafc',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 102, 255, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                Time-Travel &amp; Decay Simulator
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Judge Sandbox &bull; Mathematical Urgency Verification
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close time travel simulator"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Current State Banner */}
        <div
          style={{
            backgroundColor: currentOffset > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${currentOffset > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentOffset > 0 ? (
              <AlertTriangle size={18} color="#ef4444" />
            ) : (
              <CheckCircle2 size={18} color="#10b981" />
            )}
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              Active Simulation Horizon:{' '}
              <strong style={{ color: currentOffset > 0 ? '#ef4444' : '#10b981' }}>
                {currentOffset === 0 ? 'Live (Real-time Baseline)' : `+${currentOffset} Days in Future`}
              </strong>
            </span>
          </div>
          {currentOffset > 0 && (
            <span style={{ fontSize: '0.74rem', backgroundColor: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
              DECAY ACTIVE
            </span>
          )}
        </div>

        {/* Explanation */}
        <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '20px' }}>
          Simulates mathematical half-life relationship decay without waiting weeks in real life. When advanced, NetPulse recalculates all priority scores using exponential decay formulas, triggering Cadence SLA warnings and PulseBot reconnect strategies.
        </p>

        {/* Simulation Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => handleApplyOffset(14)}
            disabled={isApplying}
            style={{
              backgroundColor: currentOffset === 14 ? 'rgba(245, 158, 11, 0.2)' : '#1e293b',
              border: `1px solid ${currentOffset === 14 ? '#f59e0b' : '#334155'}`,
              color: '#f8fafc',
              padding: '14px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b' }}>+14 Days</span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Emerging decay across Tier 1 contacts</span>
          </button>

          <button
            onClick={() => handleApplyOffset(30)}
            disabled={isApplying}
            style={{
              backgroundColor: currentOffset === 30 ? 'rgba(239, 68, 68, 0.2)' : '#1e293b',
              border: `1px solid ${currentOffset === 30 ? '#ef4444' : '#334155'}`,
              color: '#f8fafc',
              padding: '14px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ef4444' }}>+30 Days</span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Severe SLA breach; 70%+ overdue</span>
          </button>

          <button
            onClick={() => handleApplyOffset(90)}
            disabled={isApplying}
            style={{
              backgroundColor: currentOffset === 90 ? 'rgba(168, 85, 247, 0.2)' : '#1e293b',
              border: `1px solid ${currentOffset === 90 ? '#a855f7' : '#334155'}`,
              color: '#f8fafc',
              padding: '14px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a855f7' }}>+90 Days</span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Catastrophic loss; critical intervention</span>
          </button>

          <button
            onClick={() => handleApplyOffset(0)}
            disabled={isApplying}
            style={{
              backgroundColor: currentOffset === 0 ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
              border: `1px solid ${currentOffset === 0 ? '#10b981' : '#334155'}`,
              color: '#f8fafc',
              padding: '14px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>Baseline (0 Days)</span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Real calendar date baseline</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
          <button
            onClick={handleResetAll}
            disabled={isApplying}
            style={{
              background: 'transparent',
              border: '1px solid #475569',
              color: '#cbd5e1',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} /> Full DB Reset
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#0066ff',
              border: 'none',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close &amp; Inspect UI
          </button>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div
            style={{
              position: 'absolute',
              bottom: '-45px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#0066ff',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: '0 10px 20px rgba(0, 102, 255, 0.3)',
            }}
          >
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
