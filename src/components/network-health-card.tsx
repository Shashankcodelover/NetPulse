'use client';

// ═══════════════════════════════════════════════════════
// Network Health & SLA Telemetry Card (Transformed UI/UX)
// Animated progress bar with framer-motion, glowing badges,
// and executive telemetry tiles.
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';
import { isContactOverdue } from '@/lib/scoring';
import { DEFAULT_SETTINGS } from '@/lib/types';
import type { Contact } from '@/lib/types';

export function NetworkHealthCard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [offsetDays, setOffsetDays] = useState(0);

  const refreshData = async () => {
    const list = await netPulseStore.getContacts();
    const offset = await netPulseStore.getDecayOffsetDays();
    setContacts(list);
    setOffsetDays(offset);
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('netpulse:state-changed', handleUpdate);
    return () => window.removeEventListener('netpulse:state-changed', handleUpdate);
  }, []);

  if (contacts.length === 0) return null;

  const total = contacts.length;
  const overdueCount = contacts.filter(c => isContactOverdue(c, DEFAULT_SETTINGS, offsetDays)).length;
  const healthyCount = total - overdueCount;
  const complianceRate = Math.round((healthyCount / total) * 100);

  const priorityCount = contacts.filter(c => c.relationship_tier === 'priority').length;
  const warmCount = contacts.filter(c => c.relationship_tier === 'warm').length;
  const coldCount = contacts.filter(c => c.relationship_tier === 'cold').length;

  return (
    <div
      className="card hover-lift"
      style={{
        padding: '20px 24px',
        borderRadius: 16,
        backgroundColor: 'var(--np-bg-secondary)',
        border: '1px solid var(--np-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: 'rgba(79, 70, 229, 0.12)',
              color: 'var(--np-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
              Network Health &amp; Cadence Compliance
            </h3>
            <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--np-text-tertiary)' }}>
              Deterministic SLA telemetry across {total} managed relationships
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 8,
              backgroundColor:
                complianceRate >= 80
                  ? 'rgba(16, 185, 129, 0.12)'
                  : complianceRate >= 50
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(239, 68, 68, 0.12)',
              color:
                complianceRate >= 80 ? '#10b981' : complianceRate >= 50 ? '#f59e0b' : '#ef4444',
              border: `1px solid ${
                complianceRate >= 80
                  ? 'rgba(16, 185, 129, 0.3)'
                  : complianceRate >= 50
                  ? 'rgba(245, 158, 11, 0.3)'
                  : 'rgba(239, 68, 68, 0.3)'
              }`,
            }}
          >
            {complianceRate}% SLA Adherence
          </span>
          {offsetDays > 0 && (
            <span className="badge badge-warm" style={{ fontSize: '0.7rem' }}>
              +{offsetDays}d Simulated
            </span>
          )}
        </div>
      </div>

      {/* Animated Dual Health Bar */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          <span style={{ color: 'var(--np-text-secondary)' }}>Cadence Health Horizon</span>
          <span style={{ color: 'var(--np-text-primary)' }}>
            <strong style={{ color: '#10b981' }}>{healthyCount}</strong> Healthy /{' '}
            <strong style={{ color: overdueCount > 0 ? '#ef4444' : 'inherit' }}>{overdueCount}</strong>{' '}
            Requiring Action
          </span>
        </div>
        <div
          style={{
            height: 8,
            width: '100%',
            backgroundColor: 'var(--np-bg-tertiary)',
            borderRadius: 999,
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${complianceRate}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              backgroundColor: complianceRate >= 75 ? '#10b981' : '#f59e0b',
              borderRadius: '999px 0 0 999px',
            }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - complianceRate}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              backgroundColor: '#ef4444',
              borderRadius: complianceRate === 0 ? '999px' : '0 999px 999px 0',
            }}
          />
        </div>
      </div>

      {/* Metric Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--np-bg-card)',
            border: '1px solid var(--np-border)',
          }}
        >
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Priority (14d SLA)
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--np-text-primary)', marginTop: 2 }}>
            {priorityCount} <span style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)', fontWeight: 500 }}>Leaders</span>
          </div>
        </div>

        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--np-bg-card)',
            border: '1px solid var(--np-border)',
          }}
        >
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Warm (30d SLA)
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--np-text-primary)', marginTop: 2 }}>
            {warmCount} <span style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)', fontWeight: 500 }}>Peers</span>
          </div>
        </div>

        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--np-bg-card)',
            border: '1px solid var(--np-border)',
          }}
        >
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Cold (90d SLA)
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--np-text-primary)', marginTop: 2 }}>
            {coldCount} <span style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)', fontWeight: 500 }}>Network</span>
          </div>
        </div>

        <div
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--np-bg-card)',
            border: overdueCount > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--np-border)',
          }}
        >
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Overdue Horizon
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: overdueCount > 0 ? '#ef4444' : '#10b981', marginTop: 2 }}>
            {overdueCount} <span style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)', fontWeight: 500 }}>Breaches</span>
          </div>
        </div>
      </div>
    </div>
  );
}
