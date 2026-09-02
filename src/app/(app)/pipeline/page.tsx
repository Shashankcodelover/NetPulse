'use client';

// ═══════════════════════════════════════════════════════
// Visual Pipeline — Kanban Board
// Operational relationship stages for high-concurrency networking
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  Kanban,
  Building2,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Search,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { DEMO_CONTACTS } from '@/lib/demo-data';
import type { Contact } from '@/lib/types';

type PipelineStage = 'queue' | 'outreach' | 'dialogue' | 'meeting' | 'anchor';

interface PipelineContact extends Contact {
  stage: PipelineStage;
}

const STAGES: { id: PipelineStage; label: string; color: string; desc: string }[] = [
  { id: 'queue', label: '1. In Queue', color: '#6b7280', desc: 'Identified; awaiting initial outreach' },
  { id: 'outreach', label: '2. Outreach Sent', color: '#3b82f6', desc: 'Message or note dispatched' },
  { id: 'dialogue', label: '3. Active Dialogue', color: '#8b5cf6', desc: 'Exchanging messages asynchronously' },
  { id: 'meeting', label: '4. Meeting Booked', color: '#f59e0b', desc: 'Coffee chat / technical sync scheduled' },
  { id: 'anchor', label: '5. Network Anchor', color: '#10b981', desc: 'Trusted mentor, investor, or collaborator' },
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
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const initial: PipelineContact[] = DEMO_CONTACTS.map((c, i) => {
      let stage: PipelineStage = 'queue';
      if (i % 5 === 0) stage = 'dialogue';
      else if (i % 5 === 1) stage = 'meeting';
      else if (i % 5 === 2) stage = 'outreach';
      else if (i % 5 === 3) stage = 'anchor';
      else stage = 'queue';
      return { ...c, stage };
    });
    setPipelineContacts(initial);
  }, []);

  const moveStage = (contactId: string, direction: 'forward' | 'backward') => {
    const stageOrder: PipelineStage[] = ['queue', 'outreach', 'dialogue', 'meeting', 'anchor'];
    setPipelineContacts(prev =>
      prev.map(c => {
        if (c.id !== contactId) return c;
        const currentIndex = stageOrder.indexOf(c.stage);
        const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex >= 0 && newIndex < stageOrder.length) {
          const nextStage = stageOrder[newIndex];
          const stageLabel = STAGES.find(s => s.id === nextStage)?.label || nextStage;
          showToast(`Moved ${c.full_name} to ${stageLabel}`);
          return { ...c, stage: nextStage };
        }
        return c;
      })
    );
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
    <div className="page-container" style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div className="page-header animate-fade-in" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>Relationship Pipeline</h1>
            <p>Visual stage tracking from initial outreach to lifelong relationship anchor</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--np-text-tertiary)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter pipeline..."
                style={{
                  padding: '7px 14px 7px 34px',
                  borderRadius: 8,
                  border: '1px solid var(--np-border)',
                  backgroundColor: 'var(--np-bg-secondary)',
                  color: 'var(--np-text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  width: 220,
                }}
              />
            </div>
            <Link href="/contacts" className="btn btn-secondary btn-sm">
              View All Contacts
            </Link>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(240px, 1fr))',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 20,
        }}
      >
        {STAGES.map(stage => {
          const stageItems = filtered.filter(c => c.stage === stage.id);

          return (
            <div
              key={stage.id}
              style={{
                backgroundColor: 'var(--np-bg-secondary)',
                border: '1px solid var(--np-border)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 560,
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
                  maxHeight: 650,
                }}
              >
                {stageItems.map(contact => (
                  <div
                    key={contact.id}
                    style={{
                      backgroundColor: 'var(--np-bg-card)',
                      border: '1px solid var(--np-border)',
                      borderRadius: 10,
                      padding: '12px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Top Row: Avatar + Name + Tier */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
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
                        style={{
                          fontSize: '0.62rem',
                          padding: '1px 5px',
                          borderRadius: 4,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          backgroundColor:
                            contact.relationship_tier === 'priority'
                              ? 'rgba(79, 70, 229, 0.12)'
                              : 'rgba(245, 158, 11, 0.12)',
                          color:
                            contact.relationship_tier === 'priority'
                              ? 'var(--np-accent)'
                              : 'var(--np-warning)',
                        }}
                      >
                        {contact.relationship_tier}
                      </span>
                    </div>

                    {/* Meta */}
                    {contact.title && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--np-text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: 3,
                        }}
                      >
                        <Briefcase size={11} style={{ flexShrink: 0 }} />
                        {contact.title}
                      </div>
                    )}
                    {contact.company && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--np-text-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Building2 size={11} style={{ flexShrink: 0 }} />
                        {contact.company}
                      </div>
                    )}

                    {/* Stage Advancer Controls */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: '1px solid var(--np-border-light)',
                      }}
                    >
                      <button
                        onClick={() => moveStage(contact.id, 'backward')}
                        disabled={stage.id === 'queue'}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: stage.id === 'queue' ? 'var(--np-text-tertiary)' : 'var(--np-text-secondary)',
                          cursor: stage.id === 'queue' ? 'not-allowed' : 'pointer',
                          padding: '2px 4px',
                          borderRadius: 4,
                          opacity: stage.id === 'queue' ? 0.3 : 1,
                        }}
                        title="Move to previous stage"
                      >
                        <ArrowLeft size={13} />
                      </button>

                      <Link
                        href={`/inbox`}
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--np-accent)',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Draft AI Reply
                      </Link>

                      <button
                        onClick={() => moveStage(contact.id, 'forward')}
                        disabled={stage.id === 'anchor'}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: stage.id === 'anchor' ? 'var(--np-text-tertiary)' : 'var(--np-accent)',
                          cursor: stage.id === 'anchor' ? 'not-allowed' : 'pointer',
                          padding: '2px 4px',
                          borderRadius: 4,
                          opacity: stage.id === 'anchor' ? 0.3 : 1,
                        }}
                        title="Advance to next stage"
                      >
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={16} style={{ color: 'var(--np-success)' }} />
          {toast}
        </div>
      )}
    </div>
  );
}
