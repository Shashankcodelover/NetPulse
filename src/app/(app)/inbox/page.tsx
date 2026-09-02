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
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [generatedDrafts, setGeneratedDrafts] = useState<Array<{ type: string; label: string; text: string }>>([]);
  const [toast, setToast] = useState<string | null>(null);

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
        body: JSON.stringify({ sourceText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSummary(data.summary);
        setGeneratedDrafts(data.drafts);
        showToast('Draft replies generated successfully!');
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

  const defaultExamples = [
    {
      type: 'congratulate',
      icon: Sparkles,
      label: 'Congratulate',
      text: 'Paste a post above and click "Generate Replies" to create tailored congratulatory drafts.',
    },
    {
      type: 'question',
      icon: HelpCircle,
      label: 'Ask a question',
      text: 'Paste a post above to generate thoughtful discussion questions.',
    },
    {
      type: 'insight',
      icon: Lightbulb,
      label: 'Share an insight',
      text: 'Paste a post above to generate insightful comment drafts.',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1>Inbox</h1>
        <p>Paste a contact&apos;s post to get instant summaries and tailored draft reply options</p>
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
            placeholder="Paste the text of a LinkedIn post or message here..."
            style={{ minHeight: 140 }}
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              className="btn btn-primary"
              disabled={!sourceText.trim() || loading}
              onClick={handleGenerate}
            >
              <Sparkles size={16} /> {loading ? 'Analyzing Post...' : 'Generate Replies'}
            </button>
          </div>
        </div>
      </div>

      {summary && (
        <div className="card animate-fade-in" style={{ marginBottom: 20, borderLeft: '3px solid var(--np-accent)' }}>
          <div className="card-body">
            <h4 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--np-text-muted)', marginBottom: 4 }}>
              POST SUMMARY
            </h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--np-text-primary)' }}>{summary}</p>
          </div>
        </div>
      )}

      {/* Draft Options */}
      <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {generatedDrafts.length > 0
          ? generatedDrafts.map((draft) => {
              const iconMap: Record<string, typeof Sparkles> = {
                congratulate: Sparkles,
                question: HelpCircle,
                insight: Lightbulb,
              };
              const Icon = iconMap[draft.type] || Sparkles;
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
                      <p style={{ color: 'var(--np-text-primary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {draft.text}
                      </p>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleCopy(draft.text)}
                      title="Copy draft to clipboard"
                    >
                      <Copy size={14} /> Copy
                    </button>
                  </div>
                </div>
              );
            })
          : defaultExamples.map((draft) => {
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
                  </div>
                </div>
              );
            })}
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
