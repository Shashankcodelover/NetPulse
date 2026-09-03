'use client';

// ═══════════════════════════════════════════════════════
// New-Connection Triage Engine
// PRD Feature 7: Auto-sort incoming invites into Explore / Respond / Ignore
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Briefcase,
  Layers,
  Inbox,
  Zap,
  Check,
  RotateCcw,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { netPulseStore } from '@/lib/storage/db';
import type { Contact } from '@/lib/types';

interface TriageCandidate {
  id: string;
  name: string;
  title: string;
  company: string;
  avatarInitials: string;
  sourceText: string;
  bucket: 'explore' | 'respond' | 'ignore';
  matchScore: number;
  reason: string;
  suggestedOpener: string;
  status: 'pending' | 'accepted' | 'ignored';
}

const INITIAL_DEMO_INVITES: TriageCandidate[] = [
  {
    id: 'invite-1',
    name: 'Sarah Jenkins',
    title: 'General Partner',
    company: 'AI Infrastructure Capital',
    avatarInitials: 'SJ',
    sourceText: "Hi Shashank, love the architecture benchmarks you've been running on distributed write-ahead buffers. Would love to connect and follow your work.",
    bucket: 'explore',
    matchScore: 96,
    reason: 'Strategic Decision-Maker: General Partner at Target DeepTech Venture Fund.',
    suggestedOpener: "Hi Sarah, thank you for reaching out! Delighted to connect—always happy to chat about low-latency persistence models.",
    status: 'pending',
  },
  {
    id: 'invite-2',
    name: 'Vikram Malhotra',
    title: 'Staff Systems Engineer',
    company: 'Databricks',
    avatarInitials: 'VM',
    sourceText: 'Saw your GitHub project on agent DAG orchestration. We are solving similar consensus challenges on Delta Lake.',
    bucket: 'respond',
    matchScore: 84,
    reason: 'High-Value Domain Peer: Staff Engineer at key infrastructure enterprise.',
    suggestedOpener: "Hey Vikram, great to connect! Delta Lake's consensus approach is fantastic—would love to compare notes sometime.",
    status: 'pending',
  },
  {
    id: 'invite-3',
    name: 'Dr. Elena Vasquez',
    title: 'Research Scientist',
    company: 'Anthropic',
    avatarInitials: 'EV',
    sourceText: 'Connecting with fellow researchers in model evaluation and constitutional AI alignment.',
    bucket: 'explore',
    matchScore: 92,
    reason: 'Target Tier-1 AI Organization: Research Scientist with high strategic alignment.',
    suggestedOpener: "Dr. Vasquez, pleasure to connect! Big admirer of Anthropic's alignment research and RLHF findings.",
    status: 'pending',
  },
  {
    id: 'invite-4',
    name: 'Apex Growth Labs',
    title: 'Outreach Specialist',
    company: 'ScaleB2B Automated Marketing',
    avatarInitials: 'AG',
    sourceText: 'Hey! Are you looking for 100+ qualified B2B leads generated directly to your calendar every month guaranteed? Let me book 10 mins.',
    bucket: 'ignore',
    matchScore: 18,
    reason: 'Generic Automated Sales Pitch: Low relevance to professional engineering relationship horizon.',
    suggestedOpener: 'N/A — Recommend ignoring to preserve high network signal-to-noise ratio.',
    status: 'pending',
  },
];

export default function TriagePage() {
  const [candidates, setCandidates] = useState<TriageCandidate[]>(INITIAL_DEMO_INVITES);
  const [rawInput, setRawInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleAccept = async (c: TriageCandidate) => {
    // Add to NetPulse contacts store
    const newContact: Contact = {
      id: `triage-${c.id}-${Date.now()}`,
      user_id: 'local-user',
      full_name: c.name,
      email: null,
      linkedin_url: null,
      company: c.company,
      title: c.title,
      previous_company: null,
      previous_title: null,
      relationship_tier: c.bucket === 'explore' ? 'priority' : 'warm',
      source: 'linkedin',
      last_contacted_at: new Date().toISOString(),
      last_bulk_synced_at: new Date().toISOString(),
      last_enriched_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: `Triaged from incoming LinkedIn invite: "${c.sourceText}"\nRationale: ${c.reason}`,
    };

    await netPulseStore.saveContact(newContact);

    setCandidates(prev =>
      prev.map(item => (item.id === c.id ? { ...item, status: 'accepted' } : item))
    );

    showToast(`Accepted ${c.name}! Ingested into ${newContact.relationship_tier.toUpperCase()} pipeline.`);
  };

  const handleIgnore = (id: string) => {
    setCandidates(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'ignored' } : item))
    );
    showToast('Archived request. Preserved high network signal.');
  };

  const handleResetDemo = () => {
    setCandidates(INITIAL_DEMO_INVITES);
    showToast('Reset triage queue to sample incoming invites.');
  };

  const pendingCount = candidates.filter(c => c.status === 'pending').length;
  const exploreList = candidates.filter(c => c.bucket === 'explore');
  const respondList = candidates.filter(c => c.bucket === 'respond');
  const ignoreList = candidates.filter(c => c.bucket === 'ignore');

  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="page-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
              PRD FEATURE 7
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
              Intelligent Network Signal Filter
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>New-Connection Triage</h1>
          <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
            Auto-sort incoming connection requests into Explore, Respond, and Ignore buckets
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RotateCcw size={14} /> Reset Demo Invites
        </button>
      </div>

      {/* Metrics Banner */}
      <div
        className="card animate-fade-in-up"
        style={{
          padding: '18px 24px',
          borderRadius: 14,
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          backgroundColor: 'var(--np-bg-secondary)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
            Pending Triage
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--np-text-primary)', marginTop: 2 }}>
            {pendingCount} Invites
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
            Network Signal Ratio
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
            75% High-Signal
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
            Triage Strategy
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--np-text-secondary)', marginTop: 6 }}>
            Decision-makers &amp; AI Leads routed directly to Priority SLA
          </div>
        </div>
      </div>

      {/* Triage Buckets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        {/* Column 1: EXPLORE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '2px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>Explore Bucket</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
              {exploreList.filter(c => c.status === 'pending').length} Actionable
            </span>
          </div>

          {exploreList.map(c => (
            <div
              key={c.id}
              className="card animate-fade-in"
              style={{
                padding: 16,
                borderRadius: 12,
                opacity: c.status !== 'pending' ? 0.6 : 1,
                borderLeft: '4px solid #10b981',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.name}</div>
                <span className="badge badge-priority" style={{ fontSize: '0.65rem' }}>
                  {c.matchScore}% FIT
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', marginBottom: 8 }}>
                {c.title} &bull; {c.company}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--np-text-primary)', fontStyle: 'italic', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                &ldquo;{c.sourceText}&rdquo;
              </p>
              <div style={{ fontSize: '0.74rem', color: 'var(--np-text-tertiary)', marginBottom: 12 }}>
                <strong>Insight:</strong> {c.reason}
              </div>

              {c.status === 'pending' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAccept(c)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    <UserPlus size={13} /> Accept &amp; Ingest
                  </button>
                  <button
                    onClick={() => handleIgnore(c.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}
                  >
                    Ignore
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: c.status === 'accepted' ? '#10b981' : 'var(--np-text-tertiary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} /> {c.status === 'accepted' ? 'Ingested into Priority Tier' : 'Ignored'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Column 2: RESPOND */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '2px solid #6366f1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6366f1' }} />
              <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>Respond Bucket</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1' }}>
              {respondList.filter(c => c.status === 'pending').length} Peer Sync
            </span>
          </div>

          {respondList.map(c => (
            <div
              key={c.id}
              className="card animate-fade-in"
              style={{
                padding: 16,
                borderRadius: 12,
                opacity: c.status !== 'pending' ? 0.6 : 1,
                borderLeft: '4px solid #6366f1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.name}</div>
                <span className="badge badge-warm" style={{ fontSize: '0.65rem' }}>
                  {c.matchScore}% FIT
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', marginBottom: 8 }}>
                {c.title} &bull; {c.company}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--np-text-primary)', fontStyle: 'italic', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                &ldquo;{c.sourceText}&rdquo;
              </p>
              <div style={{ fontSize: '0.74rem', color: 'var(--np-text-tertiary)', marginBottom: 12 }}>
                <strong>Insight:</strong> {c.reason}
              </div>

              {c.status === 'pending' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAccept(c)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    <UserPlus size={13} /> Accept &amp; Add Warm
                  </button>
                  <button
                    onClick={() => handleIgnore(c.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}
                  >
                    Ignore
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: c.status === 'accepted' ? '#10b981' : 'var(--np-text-tertiary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} /> {c.status === 'accepted' ? 'Ingested into Warm Tier' : 'Ignored'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Column 3: IGNORE / ARCHIVE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '2px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>Ignore Bucket</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>
              {ignoreList.filter(c => c.status === 'pending').length} Low-Signal
            </span>
          </div>

          {ignoreList.map(c => (
            <div
              key={c.id}
              className="card animate-fade-in"
              style={{
                padding: 16,
                borderRadius: 12,
                opacity: c.status !== 'pending' ? 0.6 : 1,
                borderLeft: '4px solid #ef4444',
                backgroundColor: 'var(--np-bg-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.name}</div>
                <span className="badge badge-cold" style={{ fontSize: '0.65rem' }}>
                  {c.matchScore}% SPAM SCORE
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', marginBottom: 8 }}>
                {c.title} &bull; {c.company}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--np-text-tertiary)', fontStyle: 'italic', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                &ldquo;{c.sourceText}&rdquo;
              </p>
              <div style={{ fontSize: '0.74rem', color: '#ef4444', marginBottom: 12 }}>
                <strong>Analysis:</strong> {c.reason}
              </div>

              {c.status === 'pending' ? (
                <button
                  onClick={() => handleIgnore(c.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                >
                  <XCircle size={13} style={{ display: 'inline', marginRight: 4 }} /> Archive &amp; Preserve Signal
                </button>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--np-text-tertiary)', fontWeight: 600 }}>
                  ✓ Dismissed from horizon
                </div>
              )}
            </div>
          ))}
        </div>
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
