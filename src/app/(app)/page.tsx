'use client';

// ═══════════════════════════════════════════════════════
// Daily Digest — Home Page
// "10-15 people to reach out to today"
// Integrated with NetPulseStore IndexedDB & Time-Travel Decay Simulator
// ═══════════════════════════════════════════════════════

import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import {
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Briefcase,
  Upload,
  ChevronRight,
  Calendar,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Contact, UserSettings, DigestContact } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';
import { calculatePriorityScore, getSuggestedReason, isContactOverdue } from '@/lib/scoring';
import { DEMO_CONTACTS } from '@/lib/demo-data';
import { netPulseStore } from '@/lib/storage/db';
import { generateGoogleCalendarUrl } from '@/lib/calendar';

// Deterministic avatar color from name
function getAvatarColor(name: string): string {
  const colors = [
    '#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669',
    '#D97706', '#DC2626', '#DB2777', '#9333EA', '#4338CA',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getScoreClass(score: number): string {
  if (score >= 70) return 'score-high';
  if (score >= 40) return 'score-medium';
  return 'score-low';
}

function getTierBadgeClass(tier: string): string {
  switch (tier) {
    case 'priority': return 'badge-priority';
    case 'warm': return 'badge-warm';
    case 'cold': return 'badge-cold';
    default: return 'badge-cold';
  }
}

export default function DigestPage() {
  const [contacts, setContacts] = useState<DigestContact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactedToday, setContactedToday] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [decayOffsetDays, setDecayOffsetDays] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState(true);

  const supabase = createClient();

  const loadData = async () => {
    setLoading(true);
    const rawContacts = await netPulseStore.getContacts();
    const offset = await netPulseStore.getDecayOffsetDays();
    setDecayOffsetDays(offset);
    setAllContacts(rawContacts);

    const userSettings = DEFAULT_SETTINGS as UserSettings;
    const simulatedNow = Date.now() + offset * 24 * 60 * 60 * 1000;

    const scored: DigestContact[] = rawContacts.map(contact => {
      const interactionCount = 1;
      const scoreData = calculatePriorityScore(contact, interactionCount, userSettings, offset);
      const overdue = isContactOverdue(contact, userSettings, offset);
      const daysSince = contact.last_contacted_at
        ? Math.floor((simulatedNow - new Date(contact.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...contact,
        priority_score: {
          id: '',
          contact_id: contact.id,
          user_id: 'local-user',
          last_calculated_at: new Date().toISOString(),
          ...scoreData,
        },
        days_since_contact: daysSince,
        is_overdue: overdue,
        suggested_reason: getSuggestedReason(contact, scoreData.score, userSettings, offset),
      };
    });

    scored.sort((a, b) => (b.priority_score?.score || 0) - (a.priority_score?.score || 0));
    setContacts(scored);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('netpulse:state-changed', handleUpdate);
    return () => window.removeEventListener('netpulse:state-changed', handleUpdate);
  }, []);

  const markContacted = async (contactId: string) => {
    await netPulseStore.markContacted(contactId);
    setContactedToday(prev => new Set([...prev, contactId]));
    showToast('Logged interaction & updated IndexedDB write-ahead buffer!');
    await loadData();
  };

  const handleResetDecay = async () => {
    await netPulseStore.setDecayOffsetDays(0);
    setDecayOffsetDays(0);
    window.dispatchEvent(new CustomEvent('netpulse:state-changed', { detail: { offsetDays: 0 } }));
    showToast('Reset decay simulation to baseline calendar horizon.');
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const completedCount = contactedToday.size;
  const overdueCount = contacts.filter(c => c.is_overdue).length;
  const priorityCount = contacts.filter(c => c.relationship_tier === 'priority').length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 36, width: 240, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 20, width: 160, marginBottom: 28 }} />
        <div className="skeleton" style={{ height: 160, borderRadius: 16, marginBottom: 28 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      {/* Simulation Banner */}
      {decayOffsetDays > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 12,
            marginBottom: 20,
            fontSize: '0.86rem',
            color: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color="#ef4444" />
            <span>
              <strong>Simulated Decay Active (+{decayOffsetDays} Days):</strong> Priority scores recalculated via half-life decay equations. Cadence Watchdog alerting.
            </span>
          </div>
          <button
            onClick={handleResetDecay}
            style={{
              background: 'none',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#ef4444',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RotateCcw size={13} /> Reset Horizon
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
              IMAGINE CUP STAGE 3/7
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
              Autonomous Dossiers &bull; Reactive SLA Settings &bull; Smart Importer
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Daily Digest</h1>
          <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.9rem' }}>{today}</p>
        </div>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('netpulse:open-simulator'))}
          className="btn btn-secondary btn-sm"
          style={{ borderColor: '#38bdf8', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Clock size={15} /> Time-Travel Simulator
        </button>
      </div>

      {/* Hero Card */}
      <div className="digest-hero animate-fade-in-up" style={{ marginBottom: 24, padding: '22px 26px', borderRadius: 16 }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
          <Zap size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--np-accent)' }} />
          {contacts.length - completedCount} connections requiring attention
        </h2>
        <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.86rem' }}>
          Ranked deterministically by algorithmic half-life decay, tier SLA, and decision-maker seniority.
        </p>

        <div className="digest-stats" style={{ display: 'flex', gap: 24, marginTop: 16 }}>
          <div className="digest-stat">
            <span className="stat-number" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{completedCount}</span>
            <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>Completed Today</span>
          </div>
          <div className="digest-stat">
            <span className="stat-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: overdueCount > 0 ? '#ef4444' : 'inherit' }}>
              {overdueCount}
            </span>
            <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>SLA Overdue</span>
          </div>
          <div className="digest-stat">
            <span className="stat-number" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{priorityCount}</span>
            <span className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>Priority Tier</span>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="contacts-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {contacts.map((contact, index) => {
          const isCompleted = contactedToday.has(contact.id);
          const score = contact.priority_score?.score ?? 0;

          return (
            <div
              key={contact.id}
              className={`contact-card ${isCompleted ? 'contact-card-completed' : ''} animate-fade-in`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 12,
                backgroundColor: 'var(--np-bg-card)',
                border: '1px solid var(--np-border)',
                transition: 'all 0.2s',
              }}
            >
              {/* Left: Avatar + Score Ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: getAvatarColor(contact.full_name),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(contact.full_name)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link
                      href={`/contacts/${contact.id}`}
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: 'var(--np-text-primary)',
                        textDecoration: 'none',
                      }}
                    >
                      {contact.full_name}
                    </Link>
                    <span className={`badge ${getTierBadgeClass(contact.relationship_tier)}`} style={{ fontSize: '0.65rem' }}>
                      {contact.relationship_tier}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={13} color="var(--np-text-tertiary)" />
                    <span>{contact.title} &bull; {contact.company}</span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: contact.is_overdue ? '#ef4444' : 'var(--np-text-tertiary)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {contact.is_overdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                    <span>{contact.suggested_reason}</span>
                  </div>
                </div>
              </div>

              {/* Right: Score Ring + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Score Indicator */}
                <div style={{ textAlign: 'right', marginRight: 6 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : '#10b981' }}>
                    {score}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--np-text-tertiary)' }}>Decay Score</div>
                </div>

                {/* 1-Click Smart Calendar Action */}
                <a
                  href={generateGoogleCalendarUrl({
                    contact,
                    agendaTopic: `SLA Recovery Catch-up (${contact.relationship_tier.toUpperCase()} Tier)`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', padding: '6px 12px' }}
                  title="Schedule 1-Click Meeting"
                >
                  <Calendar size={13} /> Meet
                </a>

                {/* Mark Contacted Button */}
                {!isCompleted ? (
                  <button
                    onClick={() => markContacted(contact.id)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.76rem', padding: '6px 12px' }}
                  >
                    <CheckCircle2 size={13} /> Done
                  </button>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={14} /> Contacted
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#0066ff',
            color: 'white',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: '0.84rem',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0, 102, 255, 0.4)',
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
