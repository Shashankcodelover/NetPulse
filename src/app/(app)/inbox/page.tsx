'use client';

// ═══════════════════════════════════════════════════════
// Inbox — AI Contextual Reply Synthesis Engine
// Microsoft Imagine Cup Standard — Multi-Archetype Outreach Copilot
// ═══════════════════════════════════════════════════════

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Copy,
  CheckCircle2,
  Users,
  Building2,
  Zap,
  Check,
  RotateCcw,
  ArrowRight,
  FileText,
  Clock,
} from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';
import type { Contact } from '@/lib/types';

function InboxContent() {
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get('contactId');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [tone, setTone] = useState<'executive' | 'peer' | 'investor'>('executive');
  const [sourceText, setSourceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [engineSource, setEngineSource] = useState<string | null>(null);
  const [generatedDrafts, setGeneratedDrafts] = useState<Array<{ type: string; label: string; text: string }>>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedDraftIdx, setCopiedDraftIdx] = useState<number | null>(null);

  useEffect(() => {
    netPulseStore.getContacts().then(list => {
      setContacts(list);
      if (contactIdParam && list.some(c => c.id === contactIdParam)) {
        setSelectedContactId(contactIdParam);
      } else if (list.length > 0) {
        setSelectedContactId(list[0].id);
      }
    });
  }, [contactIdParam]);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleGenerate = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText,
          contactName: selectedContact?.full_name || 'Leader',
          contactRole: selectedContact?.title || 'Executive',
          contactCompany: selectedContact?.company || 'Enterprise',
          tier: selectedContact?.relationship_tier || 'priority',
          tone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSummary(data.summary);
        setEngineSource(data.source);
        setGeneratedDrafts(data.drafts);
        showToast('Generated 3 personalized archetype drafts!');
      } else {
        showToast(data.error || 'Failed to generate drafts');
      }
    } catch {
      showToast('Network error generating drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedDraftIdx(idx);
    showToast('Copied draft reply to clipboard!');
  };

  const handleMarkReplied = async (draftText: string) => {
    if (!selectedContact) return;
    await netPulseStore.markContacted(selectedContact.id);
    showToast(`Logged outreach to ${selectedContact.full_name}! Urgency clock reset to today.`);
    setCopiedDraftIdx(null);
  };

  const setSampleContext = (sample: string) => {
    setSourceText(sample);
  };

  return (
    <div className="page-container" style={{ maxWidth: 1040 }}>
      {/* Header */}
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
            AI COPILOT
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
            Gemini 1.5 &bull; Multi-Archetype Outreach Engine
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>AI Relationship Inbox</h1>
        <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
          Paste a contact&apos;s recent update, milestone, or conversation context to generate tailored replies
        </p>
      </div>

      {/* Main Composer Card */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 24, padding: 24, borderRadius: 16 }}>
        {/* Contact Selector & Tone Control */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
              Target Connection
            </label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-input form-select"
                value={selectedContactId}
                onChange={e => setSelectedContactId(e.target.value)}
                style={{ width: '100%', fontSize: '0.88rem', fontWeight: 600 }}
              >
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} — {c.title || 'Leader'} ({c.company || 'Enterprise'})
                  </option>
                ))}
              </select>
            </div>
            {selectedContact && (
              <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: '0.76rem', color: 'var(--np-text-tertiary)' }}>
                <span className={`badge badge-${selectedContact.relationship_tier}`} style={{ fontSize: '0.65rem' }}>
                  {selectedContact.relationship_tier.toUpperCase()} TIER
                </span>
                <span>{selectedContact.company}</span>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
              Conversation Persona Archetype
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { id: 'executive', label: 'Executive' },
                { id: 'peer', label: 'Collaborative' },
                { id: 'investor', label: 'Strategic' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as any)}
                  className={`btn btn-sm ${tone === t.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', fontWeight: tone === t.id ? 700 : 500 }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Sample Context Pills */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)' }}>
              Recent Post, Update, or Milestone Context
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setSampleContext('Thrilled to announce that I have joined Anthropic as Research Director focusing on foundation agent reasoning models and safety evaluations!')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '2px 8px' }}
              >
                + Job Change Sample
              </button>
              <button
                type="button"
                onClick={() => setSampleContext('Excited to announce our $35M Series B funding led by Benchmark Capital to build distributed offline-first cloud architectures.')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '2px 8px' }}
              >
                + Series B Sample
              </button>
              <button
                type="button"
                onClick={() => setSampleContext('Just published our latest paper on low-latency autonomous swarms with deterministic failover protocols!')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.72rem', padding: '2px 8px' }}
              >
                + Research Paper Sample
              </button>
            </div>
          </div>

          <textarea
            className="form-input form-textarea"
            rows={4}
            value={sourceText}
            onChange={e => setSourceText(e.target.value)}
            placeholder="Paste their recent LinkedIn post, news update, or meeting notes here..."
            style={{ width: '100%', fontSize: '0.88rem' }}
          />
        </div>

        {/* Generate Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={handleGenerate}
            className="btn btn-primary"
            disabled={loading || !sourceText.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', fontWeight: 700 }}
          >
            <Sparkles size={16} />
            {loading ? 'Synthesizing Drafts...' : 'Generate 3 Tailored Drafts'}
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      {summary && (
        <div
          className="card animate-fade-in"
          style={{
            marginBottom: 20,
            padding: 18,
            borderRadius: 14,
            borderLeft: '4px solid var(--np-accent)',
            backgroundColor: 'var(--np-bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--np-text-tertiary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              EXECUTIVE SYNTHESIS
            </span>
            {engineSource && (
              <span className="badge badge-priority" style={{ fontSize: '0.68rem' }}>
                {engineSource}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--np-text-primary)', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
            {summary}
          </p>
        </div>
      )}

      {/* Generated Drafts List */}
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {generatedDrafts.length > 0 ? (
          generatedDrafts.map((draft, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: 20,
                borderRadius: 14,
                border: '1px solid var(--np-border)',
                backgroundColor: 'var(--np-bg-card)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      backgroundColor: 'var(--np-accent)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>{draft.label}</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleCopy(draft.text, idx)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}
                  >
                    <Copy size={13} /> Copy Draft
                  </button>

                  {copiedDraftIdx === idx && (
                    <button
                      onClick={() => handleMarkReplied(draft.text)}
                      className="btn btn-primary btn-sm animate-scale-in"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700 }}
                    >
                      <CheckCircle2 size={13} /> Mark Replied &amp; Reset Clock
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--np-text-primary)', lineHeight: 1.6, margin: 0 }}>
                {draft.text}
              </p>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '44px 20px',
              textAlign: 'center',
              color: 'var(--np-text-tertiary)',
              border: '1px dashed var(--np-border)',
              borderRadius: 16,
              fontSize: '0.88rem',
            }}
          >
            <Sparkles size={28} style={{ margin: '0 auto 12px', opacity: 0.5, color: 'var(--np-accent)' }} />
            Select a contact above and click &quot;Generate 3 Tailored Drafts&quot; to inspect personalized outreach.
          </div>
        )}
      </div>

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

export default function InboxPage() {
  return (
    <Suspense fallback={<div className="page-container"><div className="skeleton" style={{ height: 260, borderRadius: 16 }} /></div>}>
      <InboxContent />
    </Suspense>
  );
}
