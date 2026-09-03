'use client';

// ═══════════════════════════════════════════════════════
// Relationship Pipeline — Interactive Drag-and-Drop Kanban Board
// Persistent stages via NetPulseStore with SLA auto-recalculation
// ═══════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  GripVertical,
  Kanban,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { netPulseStore } from '@/lib/storage/db';
import { DEMO_CONTACTS } from '@/lib/demo-data';
import type { Contact } from '@/lib/types';
import { generateGoogleCalendarUrl } from '@/lib/calendar';

export type PipelineStage = 'queue' | 'outreach' | 'dialogue' | 'meeting' | 'anchor';

interface PipelineContact {
  id: string;
  full_name: string;
  company: string | null;
  title: string | null;
  relationship_tier: 'priority' | 'warm' | 'cold';
  last_contacted_at: string | null;
  priority_score: number;
  stage: PipelineStage;
}

const STAGES: Array<{ id: PipelineStage; label: string; desc: string; color: string }> = [
  { id: 'queue', label: '1. Sourced / Queue', desc: 'Identified for initial outreach', color: '#64748b' },
  { id: 'outreach', label: '2. Initial Ping', desc: 'Message or invite dispatched', color: '#0066ff' },
  { id: 'dialogue', label: '3. Active Dialogue', desc: 'Bi-directional conversation', color: '#7c3aed' },
  { id: 'meeting', label: '4. Strategic Catch-up', desc: 'Call or meet scheduled', color: '#f59e0b' },
  { id: 'anchor', label: '5. Trusted Anchor', desc: 'High-leverage mutual ally', color: '#10b981' },
];

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

export default function PipelinePage() {
  const [pipelineContacts, setPipelineContacts] = useState<PipelineContact[]>([]);
  const [search, setSearch] = useState('');
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadPipeline = async () => {
    const rawContacts = await netPulseStore.getContacts();
    const overrides = await netPulseStore.getStageOverrides();

    const formatted: PipelineContact[] = rawContacts.map((c, i) => {
      let stage: PipelineStage = 'queue';
      if (overrides[c.id]) {
        stage = overrides[c.id] as PipelineStage;
      } else {
        if (i % 5 === 0) stage = 'dialogue';
        else if (i % 5 === 1) stage = 'meeting';
        else if (i % 5 === 2) stage = 'outreach';
        else if (i % 5 === 3) stage = 'anchor';
        else stage = 'queue';
      }

      return {
        id: c.id,
        full_name: c.full_name,
        company: c.company || null,
        title: c.title || null,
        relationship_tier: c.relationship_tier,
        last_contacted_at: c.last_contacted_at || null,
        priority_score: 75,
        stage,
      };
    });

    setPipelineContacts(formatted);
  };

  useEffect(() => {
    loadPipeline();
    const handleUpdate = () => loadPipeline();
    window.addEventListener('netpulse:state-changed', handleUpdate);
    return () => window.removeEventListener('netpulse:state-changed', handleUpdate);
  }, []);

  const handleStageDrop = async (contactId: string, newStage: PipelineStage) => {
    await netPulseStore.updateContactStage(contactId, newStage);
    setPipelineContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, stage: newStage } : c))
    );
    const stageLabel = STAGES.find(s => s.id === newStage)?.label || newStage;
    const contact = pipelineContacts.find(c => c.id === contactId);
    showToast(`Moved ${contact?.full_name || 'Contact'} to ${stageLabel}`);
  };

  const moveStage = async (contactId: string, direction: 'forward' | 'backward') => {
    const stageOrder: PipelineStage[] = ['queue', 'outreach', 'dialogue', 'meeting', 'anchor'];
    const contact = pipelineContacts.find(c => c.id === contactId);
    if (!contact) return;

    const currentIndex = stageOrder.indexOf(contact.stage);
    const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < stageOrder.length) {
      const nextStage = stageOrder[newIndex];
      await handleStageDrop(contactId, nextStage);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = pipelineContacts.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.title && c.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-container" style={{ maxWidth: 1440 }}>
      {/* Header */}
      <div className="page-header animate-fade-in" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
                PERSISTENT KANBAN
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
                IndexedDB Write-Ahead Journaled
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Relationship Pipeline</h1>
            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--np-text-secondary)' }}>
              Drag &amp; drop cards across relationship stages or use quick advancement chevrons
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('netpulse:open-simulator'))}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: '#38bdf8', color: '#38bdf8' }}
              title="Open Time-Travel Decay Simulator"
            >
              <Clock size={15} /> Simulate Inaction Decay
            </button>

            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--np-text-tertiary)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter pipeline..."
                style={{
                  padding: '6px 12px 6px 32px',
                  borderRadius: 8,
                  border: '1px solid var(--np-border)',
                  backgroundColor: 'var(--np-bg-secondary)',
                  color: 'var(--np-text-primary)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  width: 180,
                }}
              />
            </div>
            <Link href="/contacts" className="btn btn-secondary btn-sm">
              All Contacts
            </Link>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(250px, 1fr))',
          gap: 14,
          overflowX: 'auto',
          paddingBottom: 20,
        }}
      >
        {STAGES.map(stage => {
          const stageItems = filtered.filter(c => c.stage === stage.id);

          return (
            <div
              key={stage.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const contactId = e.dataTransfer.getData('text/plain') || draggedContactId;
                if (contactId) handleStageDrop(contactId, stage.id);
              }}
              style={{
                backgroundColor: 'var(--np-bg-secondary)',
                border: '1px solid var(--np-border)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 600,
                boxShadow: 'var(--np-shadow-sm)',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--np-border)',
                  borderTop: `3px solid ${stage.color}`,
                  borderRadius: '12px 12px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--np-bg-tertiary)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--np-text-primary)' }}>
                    {stage.label}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--np-text-tertiary)' }}>
                    {stage.desc}
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: 'var(--np-bg-primary)',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--np-text-secondary)',
                    border: '1px solid var(--np-border)',
                  }}
                >
                  {stageItems.length}
                </span>
              </div>

              {/* Cards Feed */}
              <div
                style={{
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  flex: 1,
                  overflowY: 'auto',
                  maxHeight: 680,
                }}
              >
                {stageItems.map(contact => (
                  <div
                    key={contact.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', contact.id);
                      setDraggedContactId(contact.id);
                    }}
                    style={{
                      backgroundColor: 'var(--np-bg-card)',
                      border: '1px solid var(--np-border)',
                      borderRadius: 10,
                      padding: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease',
                      cursor: 'grab',
                    }}
                  >
                    {/* Top Row: Grip + Avatar + Name + Tier */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <GripVertical size={14} style={{ color: 'var(--np-text-tertiary)', cursor: 'grab', flexShrink: 0 }} />
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: getAvatarColor(contact.full_name),
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(contact.full_name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          href={`/contacts/${contact.id}`}
                          style={{
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            color: 'var(--np-text-primary)',
                            textDecoration: 'none',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {contact.full_name}
                        </Link>
                      </div>
                      <span
                        className={`badge ${
                          contact.relationship_tier === 'priority'
                            ? 'badge-priority'
                            : contact.relationship_tier === 'warm'
                            ? 'badge-warm'
                            : 'badge-cold'
                        }`}
                        style={{ fontSize: '0.62rem', padding: '1px 5px', textTransform: 'capitalize' }}
                      >
                        {contact.relationship_tier}
                      </span>
                    </div>

                    {/* Role & Company */}
                    <div style={{ fontSize: '0.74rem', color: 'var(--np-text-secondary)', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Building2 size={12} style={{ flexShrink: 0, color: 'var(--np-text-tertiary)' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {contact.title || 'Leader'} &bull; {contact.company || 'Tech'}
                        </span>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--np-text-tertiary)' }}>Decay Priority</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: contact.priority_score >= 80 ? '#ef4444' : contact.priority_score >= 60 ? '#f59e0b' : '#10b981',
                        }}
                      >
                        {contact.priority_score}/100
                      </span>
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--np-border)', paddingTop: 8 }}>
                      {/* Left/Right Quick Stage Steppers */}
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => moveStage(contact.id, 'backward')}
                          disabled={contact.stage === 'queue'}
                          className="btn-ghost"
                          style={{
                            padding: 4,
                            borderRadius: 4,
                            cursor: contact.stage === 'queue' ? 'not-allowed' : 'pointer',
                            opacity: contact.stage === 'queue' ? 0.3 : 1,
                          }}
                          title="Move backward"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => moveStage(contact.id, 'forward')}
                          disabled={contact.stage === 'anchor'}
                          className="btn-ghost"
                          style={{
                            padding: 4,
                            borderRadius: 4,
                            cursor: contact.stage === 'anchor' ? 'not-allowed' : 'pointer',
                            opacity: contact.stage === 'anchor' ? 0.3 : 1,
                          }}
                          title="Advance stage"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      {/* 1-Click Smart Calendar Link */}
                      <a
                        href={generateGoogleCalendarUrl({
                          contact: {
                            id: contact.id,
                            user_id: 'local-user',
                            full_name: contact.full_name,
                            title: contact.title || '',
                            company: contact.company || '',
                            relationship_tier: contact.relationship_tier,
                            last_contacted_at: contact.last_contacted_at || '',
                            email: `${contact.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                            source: 'manual',
                            linkedin_url: null,
                            previous_company: null,
                            previous_title: null,
                            last_bulk_synced_at: null,
                            last_enriched_at: null,
                            notes: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          },
                          agendaTopic: `Pipeline Review & Strategic Alignment (${stage.label})`,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.68rem',
                          color: '#0066ff',
                          textDecoration: 'none',
                          padding: '2px 6px',
                          borderRadius: 6,
                          fontWeight: 600,
                        }}
                        title="Schedule 1-Click Google Meet"
                      >
                        <Calendar size={12} /> Meet
                      </a>
                    </div>
                  </div>
                ))}

                {stageItems.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '30px 10px',
                      color: 'var(--np-text-tertiary)',
                      fontSize: '0.75rem',
                      border: '1px dashed var(--np-border)',
                      borderRadius: 8,
                    }}
                  >
                    Drag cards here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: 'var(--np-accent)',
            color: 'white',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: '0.84rem',
            fontWeight: 600,
            boxShadow: 'var(--np-shadow-lg)',
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
