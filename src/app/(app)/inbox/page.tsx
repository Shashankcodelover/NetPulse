'use client';

// ═══════════════════════════════════════════════════════
// Inbox — AI Contextual Reply Synthesis Engine
// Microsoft Imagine Cup Standard — Multi-Archetype Outreach Copilot
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Users,
  Building2,
  Zap,
} from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';
import type { Contact } from '@/lib/types';

export default function InboxPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [tone, setTone] = useState<'executive' | 'peer' | 'investor'>('executive');
  const [sourceText, setSourceText] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [engineSource, setEngineSource] = useState<string | null>(null);
  const [generatedDrafts, setGeneratedDrafts] = useState<Array<{ type: string; label: string; text: string }>>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    netPulseStore.getContacts().then(list => {
      setContacts(list);
      if (list.length > 0) setSelectedContactId(list[0].id);
    });
  }, []);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied draft reply to clipboard!');
  };

  const setSampleContext = (sample: string) => {
    setSourceText(sample);
  };

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
            AI COPILOT
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
            Gemini 1.5 &bull; Personality Archetypes
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>AI Relationship Inbox</h1>
        <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
          Synthesize high-conversion reconnection notes from any social post, milestone, or email
        </p>
      </div>

      {/* Target Contact Selector & Tone Card */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20, padding: 18, borderRadius: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {/* Target Contact Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
              Target Contact
            </label>
            <select
              value={selectedContactId}
              onChange={e => setSelectedContactId(e.target.value)}
              className="form-input"
              style={{ width: '100%', fontSize: '0.84rem' }}
            >
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — {c.title} ({c.company})
                </option>
              ))}
            </select>
          </div>

          {/* Archetype Tone Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 6 }}>
              Outreach Archetype
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['executive', 'peer', 'investor'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`btn btn-sm ${tone === t ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.78rem' }}
                >
                  {t === 'executive' ? 'Executive' : t === 'peer' ? 'Peer' : 'Dealmaker'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--np-border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--np-text-tertiary)', fontWeight: 600 }}>Quick Presets:</span>
          <button
            onClick={() => setSampleContext('Excited to announce our team deployed our new low-latency distributed agent framework to global production clusters with 99.99% uptime.')}
            className="btn-ghost"
            style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--np-border)' }}
          >
            🚀 Production Launch
          </button>
          <button
            onClick={() => setSampleContext('Honored to keynote at the upcoming AI Systems Summit in San Francisco on resilient consensus algorithms.')}
            className="btn-ghost"
            style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--np-border)' }}
          >
            🎤 Keynote Speaker
          </button>
          <button
            onClick={() => setSampleContext('Thrilled to share that we just closed our Series A financing round led by premier deep-tech partners to accelerate infrastructure scaling.')}
            className="btn-ghost"
            style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--np-border)' }}
          >
            💰 Funding Milestone
          </button>
        </div>
      </div>

      {/* Input Context Box */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20, padding: 18, borderRadius: 14 }}>
        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageSquare size={16} style={{ color: 'var(--np-accent)' }} />
          Post or Message Context
        </h3>
        <textarea
          className="form-input form-textarea"
          value={sourceText}
          onChange={e => setSourceText(e.target.value)}
          placeholder="Paste their recent LinkedIn update, Tweet, paper abstract, or past email snippet..."
          style={{ minHeight: 110, fontSize: '0.86rem' }}
        />
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            disabled={!sourceText.trim() || loading}
            onClick={handleGenerate}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px' }}
          >
            <Sparkles size={15} /> {loading ? 'Synthesizing with AI...' : 'Generate 3 Tailored Drafts'}
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      {summary && (
        <div
          className="card animate-fade-in"
          style={{
            marginBottom: 20,
            padding: 16,
            borderRadius: 12,
            borderLeft: '4px solid var(--np-accent)',
            backgroundColor: 'var(--np-bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--np-text-tertiary)', letterSpacing: '0.5px' }}>
              EXECUTIVE SYNTHESIS
            </span>
            {engineSource && (
              <span style={{ fontSize: '0.68rem', backgroundColor: 'var(--np-accent-light)', color: 'var(--np-accent)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                {engineSource}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.92rem', color: 'var(--np-text-primary)', margin: 0, fontWeight: 500 }}>
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
                padding: 18,
                borderRadius: 14,
                border: '1px solid var(--np-border)',
                backgroundColor: 'var(--np-bg-card)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: 'var(--np-accent-light)',
                      color: 'var(--np-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{draft.label}</span>
                </div>

                <button
                  onClick={() => handleCopy(draft.text)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.76rem' }}
                >
                  <Copy size={13} /> Copy to Clipboard
                </button>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--np-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {draft.text}
              </p>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--np-text-tertiary)',
              border: '1px dashed var(--np-border)',
              borderRadius: 14,
              fontSize: '0.86rem',
            }}
          >
            <Sparkles size={24} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
            Select a contact, paste an update above, and click &quot;Generate 3 Tailored Drafts&quot; to inspect real-time AI responses.
          </div>
        )}
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
