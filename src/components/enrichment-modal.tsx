'use client';

// ═══════════════════════════════════════════════════════
// 10-Second Quick-Enrichment Station
// PRD Feature 10: Rapid update modal for priority contacts
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  Clock,
  Briefcase,
  Building2,
  FileText,
  Zap,
} from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';
import type { Contact } from '@/lib/types';

interface EnrichmentModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onEnriched?: (updated: Contact) => void;
}

export function EnrichmentModal({ contact, isOpen, onClose, onEnriched }: EnrichmentModalProps) {
  const [snippet, setSnippet] = useState('');
  const [extractedTitle, setExtractedTitle] = useState(contact.title || '');
  const [extractedCompany, setExtractedCompany] = useState(contact.company || '');
  const [tier, setTier] = useState(contact.relationship_tier);
  const [parsing, setParsing] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleApplySample = (sampleText: string, newTitle?: string | null, newCompany?: string | null) => {
    setSnippet(sampleText);
    if (newTitle !== undefined) setExtractedTitle(newTitle || '');
    if (newCompany !== undefined) setExtractedCompany(newCompany || '');
  };

  const handleSave = async () => {
    setParsing(true);
    try {
      // 1. Update contact record
      const updatedContact: Contact = {
        ...contact,
        title: extractedTitle,
        company: extractedCompany,
        relationship_tier: tier,
        last_contacted_at: new Date().toISOString(),
        last_enriched_at: new Date().toISOString(),
        notes: snippet ? `${contact.notes ? contact.notes + '\n\n' : ''}[Enriched ${new Date().toLocaleDateString()}]: ${snippet}` : contact.notes,
      };

      await netPulseStore.saveContact(updatedContact);

      // 2. Log interaction if note snippet was provided
      if (snippet.trim()) {
        await netPulseStore.saveInteraction({
          id: `int-${Date.now()}`,
          contact_id: contact.id,
          user_id: 'local-user',
          type: 'note',
          content: `Enriched via 10-Second Station: ${snippet.slice(0, 200)}`,
          created_at: new Date().toISOString(),
        });
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (onEnriched) onEnriched(updatedContact);
        onClose();
      }, 1000);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 580,
          backgroundColor: 'var(--np-bg-card)',
          borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--np-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--np-bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--np-accent)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>10-Second Quick Enrichment</h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--np-text-tertiary)' }}>
                Keep {contact.full_name} current without manual scraping
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: 6, borderRadius: 6 }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Quick-fill Sample Pills */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
              Quick Templates
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleApplySample(
                  'Promoted to VP of Engineering! Leading the foundation infrastructure teams.',
                  'VP of Engineering',
                  contact.company
                )}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                + Promotion / Role Bump
              </button>
              <button
                type="button"
                onClick={() => handleApplySample(
                  'Moved from NYC to San Francisco. Keynoted at NeurIPS on distributed agent memory.',
                  contact.title,
                  contact.company
                )}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                + Relocation / Conference
              </button>
              <button
                type="button"
                onClick={() => handleApplySample(
                  'Quick 15-min coffee sync: actively raising $25M Series B for AI agent safety testing.',
                  contact.title,
                  contact.company
                )}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                + Coffee Chat Sync
              </button>
            </div>
          </div>

          {/* Raw Snippet Paste */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
              Raw Post, Note, or Status Snippet
            </label>
            <textarea
              className="form-input form-textarea"
              rows={3}
              value={snippet}
              onChange={e => setSnippet(e.target.value)}
              placeholder="Paste recent LinkedIn post snippet, news, or meeting takeaway here..."
              style={{ width: '100%', fontSize: '0.86rem' }}
            />
          </div>

          {/* Extracted Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 4 }}>
                Current Role / Title
              </label>
              <input
                type="text"
                className="form-input"
                value={extractedTitle}
                onChange={e => setExtractedTitle(e.target.value)}
                style={{ width: '100%', fontSize: '0.86rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 4 }}>
                Company / Organization
              </label>
              <input
                type="text"
                className="form-input"
                value={extractedCompany}
                onChange={e => setExtractedCompany(e.target.value)}
                style={{ width: '100%', fontSize: '0.86rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
              Relationship Tier
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(['priority', 'warm', 'cold'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`btn btn-sm ${tier === t ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', fontSize: '0.78rem', fontWeight: tier === t ? 700 : 500 }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: 'var(--np-text-tertiary)' }}>
            Automatically recalibrates decay &amp; urgency score
          </span>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary btn-sm"
              disabled={parsing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={14} /> Saved!
                </>
              ) : (
                <>
                  <Sparkles size={14} /> {parsing ? 'Saving...' : 'Update & Recalibrate'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
