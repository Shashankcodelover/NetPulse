'use client';

// ═══════════════════════════════════════════════════════
// Inbox — Reply Drafting Tool (Phase 7 placeholder with structure)
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Sparkles,
  Copy,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export default function InboxPage() {
  const [sourceText, setSourceText] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Phase 7 feature — placeholder UI to demonstrate the UX flow
  const draftExamples = [
    {
      type: 'congratulate' as const,
      icon: Sparkles,
      label: 'Congratulate',
      text: 'Paste a post above to generate congratulatory reply drafts.',
    },
    {
      type: 'question' as const,
      icon: HelpCircle,
      label: 'Ask a question',
      text: 'Paste a post above to generate thoughtful questions.',
    },
    {
      type: 'insight' as const,
      icon: Lightbulb,
      label: 'Share an insight',
      text: 'Paste a post above to generate insightful reply drafts.',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1>Inbox</h1>
        <p>Paste a contact&apos;s post to get summary and draft reply options</p>
      </div>

      {/* Paste Area */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={18} style={{ color: 'var(--np-accent)' }} />
            Paste a Post
          </h3>
          <textarea
            className="form-input form-textarea"
            value={sourceText}
            onChange={e => setSourceText(e.target.value)}
            placeholder="Paste the text of a LinkedIn post here..."
            style={{ minHeight: 150 }}
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              disabled={!sourceText.trim()}
              onClick={() => showToast('Reply drafting will be available in a future update')}
            >
              <Sparkles size={16} /> Generate Replies
            </button>
          </div>
        </div>
      </div>

      {/* Draft Options (placeholder) */}
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {draftExamples.map((draft) => {
          const Icon = draft.icon;
          return (
            <div key={draft.type} className="card">
              <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--np-accent-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={18} style={{ color: 'var(--np-accent)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{draft.label}</h4>
                  <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.875rem' }}>
                    {draft.text}
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled
                  title="Available when a post is analyzed"
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 24, background: 'var(--np-accent-light)' }}>
        <div className="card-body" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          color: 'var(--np-accent)', fontSize: '0.875rem',
        }}>
          <Sparkles size={18} />
          <span>AI-powered reply drafting is coming soon. The interface is ready — just needs API integration.</span>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <CheckCircle2 size={16} style={{ color: 'var(--np-success)' }} />
          {toast}
        </div>
      )}
    </div>
  );
}
