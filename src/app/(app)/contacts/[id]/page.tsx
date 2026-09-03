'use client';

// ═══════════════════════════════════════════════════════
// NetPulse — Autonomous Contact Dossier & Action Suite
// Dual-engine (IndexedDB + Cloud), AI Next Best Action,
// and real-time touchpoint logging with decay resets.
// ═══════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Mail,
  Clock,
  Edit3,
  Save,
  X,
  MessageSquare,
  Phone,
  FileText,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { netPulseStore } from '@/lib/storage/db';
import { generateGoogleCalendarUrl } from '@/lib/calendar';
import { calculatePriorityScore, isContactOverdue, getSuggestedReason } from '@/lib/scoring';
import { DEFAULT_SETTINGS } from '@/lib/types';
import type { Contact, Interaction, RelationshipTier, InteractionType, UserSettings } from '@/lib/types';

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

const INTERACTION_ICONS: Record<string, typeof FileText> = {
  message: MessageSquare,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  email: Mail,
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Contact>>({});
  const [decayOffset, setDecayOffset] = useState(0);

  // New Touchpoint Logger State
  const [showTouchpointModal, setShowTouchpointModal] = useState(false);
  const [logType, setLogType] = useState<InteractionType>('call');
  const [logSummary, setLogSummary] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [savingLog, setSavingLog] = useState(false);

  // Inline Quick Note State
  const [newNote, setNewNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const loadDossier = async () => {
    try {
      const found = await netPulseStore.getContactById(contactId);
      const history = await netPulseStore.getInteractions(contactId);
      const offset = await netPulseStore.getDecayOffsetDays();

      setContact(found);
      setEditData(found || {});
      setInteractions(history);
      setDecayOffset(offset);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDossier();
    const handleUpdate = () => loadDossier();
    window.addEventListener('netpulse:state-changed', handleUpdate);
    return () => window.removeEventListener('netpulse:state-changed', handleUpdate);
  }, [contactId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const saveEdits = async () => {
    if (!contact) return;
    const updated: Contact = {
      ...contact,
      ...editData,
      updated_at: new Date().toISOString(),
    };
    await netPulseStore.saveContact(updated);
    setContact(updated);
    setEditing(false);
    showToast('Contact dossier updated successfully');
  };

  const logTouchpoint = async () => {
    if (!contact || !logSummary.trim()) return;
    setSavingLog(true);

    try {
      const newInteraction: Interaction = {
        id: `int-${Date.now()}`,
        user_id: 'local-user',
        contact_id: contact.id,
        type: logType,
        content: logSummary.trim(),
        created_at: new Date(logDate).toISOString(),
      };

      await netPulseStore.saveInteraction(newInteraction);
      setShowTouchpointModal(false);
      setLogSummary('');
      showToast(`Logged ${logType.toUpperCase()} touchpoint! Urgency clock reset to today.`);
      await loadDossier();
    } finally {
      setSavingLog(false);
    }
  };

  const addQuickNote = async () => {
    if (!newNote.trim() || !contact) return;
    const newInteraction: Interaction = {
      id: `int-${Date.now()}`,
      user_id: 'local-user',
      contact_id: contact.id,
      type: 'note',
      content: newNote.trim(),
      created_at: new Date().toISOString(),
    };

    await netPulseStore.saveInteraction(newInteraction);
    setNewNote('');
    showToast('Note added to relationship journal');
    await loadDossier();
  };

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 1000 }}>
        <div className="skeleton" style={{ height: 220, borderRadius: 16, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="page-container" style={{ maxWidth: 1000 }}>
        <div className="empty-state card" style={{ padding: 40, textAlign: 'center' }}>
          <h3>Contact dossier not found</h3>
          <p style={{ color: 'var(--np-text-tertiary)' }}>This record may have been archived or deleted.</p>
          <button onClick={() => router.push('/contacts')} className="btn btn-primary" style={{ marginTop: 16 }}>
            Return to Contacts Directory
          </button>
        </div>
      </div>
    );
  }

  // Calculate live decay math
  const userSettings = DEFAULT_SETTINGS as UserSettings;
  const scoreData = calculatePriorityScore(contact, interactions.length, userSettings, decayOffset);
  const overdue = isContactOverdue(contact, userSettings, decayOffset);
  const simulatedNow = Date.now() + decayOffset * 24 * 60 * 60 * 1000;
  const daysSince = contact.last_contacted_at
    ? Math.floor((simulatedNow - new Date(contact.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // AI Strategic Next Best Action recommendation
  let nextBestActionTitle = 'Quarterly Strategic Alignment Check-in';
  let nextBestActionDetail = 'Maintain bi-directional dialogue and share recent technical milestones.';

  if (overdue) {
    nextBestActionTitle = `Urgent Cadence Recovery (${contact.relationship_tier.toUpperCase()} SLA Breached)`;
    nextBestActionDetail = `Exceeded target SLA by ${daysSince ? daysSince - 14 : 10} days. Schedule a 15-minute sync or send a contextual reconnect note.`;
  } else if (contact.company?.includes('Capital') || contact.title?.includes('Partner') || contact.title?.includes('VC')) {
    nextBestActionTitle = 'Investment & Syndication Thesis Update';
    nextBestActionDetail = 'Share Q3 distributed infrastructure metrics and recent production platform benchmarks.';
  } else if (contact.title?.includes('Scientist') || contact.title?.includes('Architect') || contact.title?.includes('Engineer')) {
    nextBestActionTitle = 'Technical Architecture Deep-Dive';
    nextBestActionDetail = 'Discuss low-latency agentic orchestration, offline-first consensus, and fault-tolerance patterns.';
  }

  return (
    <div className="page-container" style={{ maxWidth: 1040 }}>
      {/* Top Breadcrumb & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm animate-fade-in"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Back to Network
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {decayOffset > 0 && (
            <span className="badge badge-warm" style={{ fontSize: '0.72rem' }}>
              + {decayOffset}d Time-Travel Active
            </span>
          )}
          <span className="badge badge-priority" style={{ fontSize: '0.72rem' }}>
            DOSSIER ENGINE
          </span>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20, padding: 24, borderRadius: 16 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div
            className="contact-avatar"
            style={{
              background: getAvatarColor(contact.full_name),
              width: 80,
              height: 80,
              fontSize: '1.75rem',
              fontWeight: 800,
              borderRadius: 20,
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
            }}
          >
            {getInitials(contact.full_name)}
          </div>

          {/* Core Info / Edit Mode */}
          <div style={{ flex: 1, minWidth: 260 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  className="form-input"
                  value={editData.full_name || ''}
                  onChange={e => setEditData({ ...editData, full_name: e.target.value })}
                  placeholder="Full Name"
                />
                <input
                  className="form-input"
                  value={editData.title || ''}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                  placeholder="Executive Title / Role"
                />
                <input
                  className="form-input"
                  value={editData.company || ''}
                  onChange={e => setEditData({ ...editData, company: e.target.value })}
                  placeholder="Organization / Company"
                />
                <input
                  className="form-input"
                  value={editData.email || ''}
                  onChange={e => setEditData({ ...editData, email: e.target.value })}
                  placeholder="Direct Email Address"
                />
                <select
                  className="form-input form-select"
                  value={editData.relationship_tier || 'warm'}
                  onChange={e => setEditData({ ...editData, relationship_tier: e.target.value as RelationshipTier })}
                >
                  <option value="priority">Priority Tier (14d SLA)</option>
                  <option value="warm">Warm Tier (30d SLA)</option>
                  <option value="cold">Cold Tier (90d SLA)</option>
                </select>
                <textarea
                  className="form-input form-textarea"
                  value={editData.notes || ''}
                  onChange={e => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Strategic background, mutual contacts, and notes..."
                  rows={3}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveEdits} className="btn btn-primary btn-sm">
                    <Save size={14} /> Save Changes
                  </button>
                  <button onClick={() => { setEditing(false); setEditData(contact); }} className="btn btn-ghost btn-sm">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{contact.full_name}</h1>
                  <span className={`badge badge-${contact.relationship_tier}`}>
                    {contact.relationship_tier.toUpperCase()} TIER
                  </span>
                  {overdue ? (
                    <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> SLA OVERDUE
                    </span>
                  ) : (
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} /> CADENCE ON TRACK
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--np-text-secondary)', fontSize: '0.92rem' }}>
                  {contact.title && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Briefcase size={15} style={{ color: 'var(--np-text-tertiary)' }} /> {contact.title}
                    </span>
                  )}
                  {contact.company && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={15} style={{ color: 'var(--np-text-tertiary)' }} /> {contact.company}
                    </span>
                  )}
                  {contact.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={15} style={{ color: 'var(--np-text-tertiary)' }} /> {contact.email}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={15} style={{ color: 'var(--np-text-tertiary)' }} />
                    {contact.last_contacted_at
                      ? `Last engaged ${formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })} (${daysSince}d ago)`
                      : 'Never contacted'}
                  </span>
                </div>

                {contact.notes && (
                  <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--np-bg-secondary)', borderRadius: 10, fontSize: '0.86rem', color: 'var(--np-text-secondary)', lineHeight: 1.5 }}>
                    <strong>Dossier Notes:</strong> {contact.notes}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Live Urgency Scorecard & Instant Actions */}
          {!editing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
              <div
                style={{
                  background: 'var(--np-bg-secondary)',
                  border: '1px solid var(--np-border)',
                  borderRadius: 12,
                  padding: '12px 18px',
                  textAlign: 'center',
                  minWidth: 120,
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: scoreData.score >= 80 ? '#ef4444' : scoreData.score >= 60 ? '#f59e0b' : '#10b981' }}>
                  {scoreData.score} <span style={{ fontSize: '0.8rem', color: 'var(--np-text-tertiary)' }}>/100</span>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Decay Urgency
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {/* Log Touchpoint Trigger */}
                <button
                  onClick={() => setShowTouchpointModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <Plus size={14} /> Log Touchpoint
                </button>

                {/* 1-Click Smart Calendar */}
                <a
                  href={generateGoogleCalendarUrl({
                    contact,
                    agendaTopic: `${contact.full_name} <> Strategic Catch-up`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Calendar size={14} /> Schedule Meeting
                </a>

                {/* Edit Button */}
                <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm" title="Edit Contact Details">
                  <Edit3 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Next Best Action Intelligence Banner */}
      <div
        className="card animate-fade-in-up"
        style={{
          marginBottom: 20,
          padding: 20,
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.08) 100%)',
          border: '1px solid rgba(79, 70, 229, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} />
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI COPILOT RECOMMENDATION
              </span>
              <span className="badge badge-priority" style={{ fontSize: '0.65rem' }}>
                NEXT BEST ACTION
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--np-text-primary)' }}>
              {nextBestActionTitle}
            </h3>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--np-text-secondary)', lineHeight: 1.5 }}>
              {nextBestActionDetail}
            </p>
          </div>

          <button
            onClick={() => router.push(`/inbox?contactId=${contact.id}`)}
            className="btn btn-primary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.82rem',
              padding: '8px 16px',
              borderRadius: 10,
              flexShrink: 0,
            }}
          >
            <Compass size={14} /> Compose AI Outreach
          </button>
        </div>
      </div>

      {/* Grid: Relationship Journal & Quick Note */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Left Column: Interaction Journal */}
        <div className="card animate-fade-in-up" style={{ padding: 22, borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              Relationship Journal ({interactions.length})
            </h3>
            <button
              onClick={() => setShowTouchpointModal(true)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              + Add Touchpoint
            </button>
          </div>

          {interactions.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--np-text-tertiary)' }}>
              <Clock size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <p style={{ fontSize: '0.88rem', margin: 0 }}>No interactions recorded yet.</p>
              <button
                onClick={() => setShowTouchpointModal(true)}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 12, fontSize: '0.78rem' }}
              >
                Record First Touchpoint
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {interactions.map((interaction, index) => {
                const Icon = INTERACTION_ICONS[interaction.type] || FileText;
                return (
                  <div
                    key={interaction.id}
                    style={{
                      display: 'flex',
                      gap: 14,
                      paddingBottom: 14,
                      borderBottom: index < interactions.length - 1 ? '1px solid var(--np-border-light)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--np-bg-secondary)',
                        border: '1px solid var(--np-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: 'var(--np-accent)',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--np-text-secondary)' }}>
                          {interaction.type}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)' }}>
                          {format(new Date(interaction.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--np-text-primary)', margin: 0, lineHeight: 1.5 }}>
                        {interaction.content || 'Logged interaction'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Note & Cadence Health Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Note Input */}
          <div className="card animate-fade-in-up" style={{ padding: 22, borderRadius: 14 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
              Fast Note Dispatch
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--np-text-secondary)', marginBottom: 12 }}>
              Add private notes, meeting takeaways, or follow-up items.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                className="form-input form-textarea"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Discussed architecture scaling, agreed to reconnect next month..."
                rows={3}
                style={{ width: '100%', fontSize: '0.86rem' }}
              />
              <button
                onClick={addQuickNote}
                className="btn btn-primary btn-sm"
                disabled={!newNote.trim()}
                style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={14} /> Save Note
              </button>
            </div>
          </div>

          {/* Cadence SLA Specs */}
          <div className="card animate-fade-in-up" style={{ padding: 22, borderRadius: 14 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 12 }}>
              Cadence SLA Diagnostics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--np-border-light)' }}>
                <span style={{ color: 'var(--np-text-secondary)' }}>Target Cadence SLA:</span>
                <span style={{ fontWeight: 700 }}>
                  {contact.relationship_tier === 'priority' ? '14 Days' : contact.relationship_tier === 'warm' ? '30 Days' : '90 Days'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--np-border-light)' }}>
                <span style={{ color: 'var(--np-text-secondary)' }}>Current Inactivity:</span>
                <span style={{ fontWeight: 700, color: overdue ? '#ef4444' : '#10b981' }}>
                  {daysSince !== null ? `${daysSince} days` : 'No touchpoint logged'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--np-border-light)' }}>
                <span style={{ color: 'var(--np-text-secondary)' }}>Decay Half-life Weight:</span>
                <span style={{ fontWeight: 700 }}>{Math.round(scoreData.recency_score)}% urgency rating</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: 'var(--np-text-secondary)' }}>Storage Engine:</span>
                <span style={{ fontWeight: 700, color: '#4f46e5' }}>IndexedDB Write-Ahead v3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Touchpoint Modal */}
      {showTouchpointModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowTouchpointModal(false)}
        >
          <div
            className="card animate-scale-in"
            style={{
              width: '100%',
              maxWidth: 520,
              padding: 24,
              borderRadius: 18,
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.4)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <span className="badge badge-priority" style={{ fontSize: '0.68rem', marginBottom: 4 }}>
                  TOUCHPOINT LOGGER
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Log Touchpoint with {contact.full_name}
                </h2>
              </div>
              <button
                onClick={() => setShowTouchpointModal(false)}
                className="btn-ghost"
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', marginBottom: 16 }}>
              Logging an interaction immediately resets the mathematical urgency clock to today and updates the Daily Digest.
            </p>

            {/* Type selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 8 }}>
                Interaction Channel
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {(['call', 'message', 'note', 'comment'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLogType(type)}
                    className={`btn btn-sm ${logType === type ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
                Interaction Date
              </label>
              <input
                type="date"
                className="form-input"
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
                style={{ width: '100%', fontSize: '0.86rem' }}
              />
            </div>

            {/* Summary */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
                Key Discussion Takeaways & Context
              </label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                value={logSummary}
                onChange={e => setLogSummary(e.target.value)}
                placeholder="Discussed architecture benchmarks, agreed on follow-up timeline next week..."
                style={{ width: '100%', fontSize: '0.86rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowTouchpointModal(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={logTouchpoint}
                className="btn btn-primary btn-sm"
                disabled={savingLog || !logSummary.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              >
                <CheckCircle2 size={14} /> Log & Reset Clock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="toast animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} style={{ color: 'var(--np-success)' }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
