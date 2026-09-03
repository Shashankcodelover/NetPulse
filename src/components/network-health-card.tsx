'use client';

// ═══════════════════════════════════════════════════════
// Network Health & SLA Telemetry Card
// Executive Cadence Compliance & Distribution Engine
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
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
      className="card animate-fade-in-up"
      style={{
        padding: '20px 24px',
        borderRadius: 16,
        marginBottom: 24,
        backgroundColor: 'var(--np-bg-secondary)',
        border: '1px solid var(--np-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: 'var(--np-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Network Health &amp; Cadence Compliance</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
              Deterministic SLA telemetry across {total} managed relationships
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              backgroundColor: complianceRate >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: complianceRate >= 80 ? '#10b981' : '#ef4444',
            }}
          >
            {complianceRate}% SLA Adherence
          </span>
          {offsetDays > 0 && (
            <span className="badge badge-warm" style={{ fontSize: '0.68rem' }}>
              +{offsetDays}d Simulated
            </span>
          )}
        </div>
      </div>

      {/* Health Bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 6, fontWeight: 600 }}>
          <span style={{ color: 'var(--np-text-secondary)' }}>Cadence Health Horizon</span>
          <span style={{ color: 'var(--np-text-primary)' }}>{healthyCount} Healthy / {overdueCount} Requiring Action</span>
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
          <div
            style={{
              width: `${complianceRate}%`,
              backgroundColor: complianceRate >= 75 ? '#10b981' : '#f59e0b',
              transition: 'width 0.4s ease',
            }}
          />
          <div
            style={{
              width: `${100 - complianceRate}%`,
              backgroundColor: '#ef4444',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Key Metric Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--np-bg-card)', border: '1px solid var(--np-border)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
            Priority Tier (14d SLA)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--np-text-primary)', marginTop: 2 }}>
            {priorityCount} <span style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)' }}>Leaders</span>
          </div>
        </div>

        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--np-bg-card)', border: '1px solid var(--np-border)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
            Warm Tier (30d SLA)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--np-text-primary)', marginTop: 2 }}>
            {warmCount} <span style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)' }}>Peers</span>
          </div>
        </div>

        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--np-bg-card)', border: '1px solid var(--np-border)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
            Cold Tier (90d SLA)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--np-text-primary)', marginTop: 2 }}>
            {coldCount} <span style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)' }}>Network</span>
          </div>
        </div>

        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--np-bg-card)', border: '1px solid var(--np-border)' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
            Overdue Horizon
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: overdueCount > 0 ? '#ef4444' : '#10b981', marginTop: 2 }}>
            {overdueCount} <span style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)' }}>Breaches</span>
          </div>
        </div>
      </div>
    </div>
  );
}
