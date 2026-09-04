'use client';

// ═══════════════════════════════════════════════════════
// Job Change & Career Transition Radar
// PRD Feature 9: Track role promotions, company changes & executive moves
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  TrendingUp,
  Building2,
  Briefcase,
  ArrowRight,
  MessageSquare,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { netPulseStore } from '@/lib/storage/db';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import type { Contact } from '@/lib/types';

interface JobTransition {
  id: string;
  contactId: string;
  name: string;
  previousRole: string;
  previousCompany: string;
  newRole: string;
  newCompany: string;
  transitionType: 'promotion' | 'company_move' | 'founding';
  detectedAt: string;
  strategicSignificance: string;
}

const SAMPLE_TRANSITIONS: JobTransition[] = [
  {
    id: 'trans-1',
    contactId: 'demo-1',
    name: 'Dr. Elena Rostova',
    previousRole: 'Principal Research Scientist',
    previousCompany: 'Google DeepMind',
    newRole: 'VP of Engineering — Foundation Infrastructure',
    newCompany: 'Google DeepMind',
    transitionType: 'promotion',
    detectedAt: '2 days ago',
    strategicSignificance: 'Promoted to VP leadership; now oversees foundation agent infrastructure and capital allocation.',
  },
  {
    id: 'trans-2',
    contactId: 'demo-4',
    name: 'Alexander Wright',
    previousRole: 'Senior Solutions Architect',
    previousCompany: 'Microsoft',
    newRole: 'Principal Cloud Architect',
    newCompany: 'Microsoft Azure',
    transitionType: 'promotion',
    detectedAt: '5 days ago',
    strategicSignificance: 'Role bump to Principal; decision-maker for Azure AI enterprise co-pilot pipelines.',
  },
  {
    id: 'trans-3',
    contactId: 'leader-1',
    name: 'Mira Murati',
    previousRole: 'Chief Technology Officer',
    previousCompany: 'OpenAI',
    newRole: 'Founder & CEO',
    newCompany: 'Stealth AI Lab',
    transitionType: 'founding',
    detectedAt: '1 week ago',
    strategicSignificance: 'Forming new frontier AI venture; prime window for founder reconnect and advisory dialogue.',
  },
  {
    id: 'trans-4',
    contactId: 'leader-3',
    name: 'Andrej Karpathy',
    previousRole: 'Director of AI',
    previousCompany: 'Tesla / OpenAI',
    newRole: 'Founder',
    newCompany: 'Eureka Labs',
    transitionType: 'founding',
    detectedAt: '2 weeks ago',
    strategicSignificance: 'Launching AI-native education frontier labs; ideal conversational bridge for pedagogical agent swarms.',
  },
];

const TARGET_ENTERPRISES = [
  {
    name: 'Google DeepMind',
    headcountInNetwork: 4,
    recentNews: 'Published Gemini 2.0 technical report with breakthrough reasoning benchmarks.',
    priorityContact: 'Dr. Elena Rostova',
  },
  {
    name: 'Anthropic',
    headcountInNetwork: 3,
    recentNews: 'Announced Constitutional AI v3 updates and enterprise agent governance frameworks.',
    priorityContact: 'Priya Sharma',
  },
  {
    name: 'Stripe',
    headcountInNetwork: 3,
    recentNews: 'Launched programmable micro-settlements for autonomous agent transactions.',
    priorityContact: 'Aria Chen',
  },
  {
    name: 'Benchmark Capital',
    headcountInNetwork: 2,
    recentNews: 'Leading early-stage syndication for distributed offline-first cloud protocols.',
    priorityContact: 'Marcus Vance',
  },
];

export default function RadarPage() {
  const router = useRouter();
  const [transitions, setTransitions] = useState<JobTransition[]>(SAMPLE_TRANSITIONS);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    netPulseStore.getContacts().then(setContacts);
  }, []);

  const handleDraftCongratulations = (t: JobTransition) => {
    // Pipe directly to AI inbox with pre-filled promotion context
    const promoContext = encodeURIComponent(`Thrilled to share that I have stepped into a new role as ${t.newRole} at ${t.newCompany}!`);
    router.push(`/inbox?contactId=${t.contactId}&name=${encodeURIComponent(t.name)}&context=${promoContext}`);
  };

  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="page-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
              SIGNAL RADAR
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
              Career Movement &amp; Founding Intelligence
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Job Change &amp; Promotion Radar</h1>
          <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
            Identify role bumps, new company appointments, and founding milestones across your network
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-success" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={13} /> 4 Recent Transitions Detected
          </span>
        </div>
      </div>

      {/* Main Transitions Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {transitions.map(t => {
          const contactRecord = contacts.find(c => c.id === t.contactId) || {
            id: t.contactId,
            full_name: t.name,
            relationship_tier: 'priority',
            company: t.newCompany,
          } as Contact;

          return (
            <div
              key={t.id}
              className="card animate-fade-in-up"
              style={{
                padding: '20px 24px',
                borderRadius: 16,
                backgroundColor: 'var(--np-bg-card)',
                border: '1px solid var(--np-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              {/* Left Column: Transition Info */}
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Link
                    href={`/contacts/${t.contactId}`}
                    style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--np-text-primary)', textDecoration: 'none' }}
                  >
                    {t.name}
                  </Link>

                  <span
                    className={`badge ${t.transitionType === 'promotion' ? 'badge-priority' : 'badge-warm'}`}
                    style={{ fontSize: '0.68rem', fontWeight: 700 }}
                  >
                    {t.transitionType === 'promotion' ? '🎉 PROMOTION' : '🚀 FOUNDER VENTURE'}
                  </span>

                  <span style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)' }}>
                    &bull; Detected {t.detectedAt}
                  </span>
                </div>

                {/* Role Diff */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', margin: '8px 0', flexWrap: 'wrap' }}>
                  <div style={{ color: 'var(--np-text-tertiary)', textDecoration: 'line-through' }}>
                    {t.previousRole} ({t.previousCompany})
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--np-accent)' }} />
                  <div style={{ fontWeight: 700, color: 'var(--np-text-primary)' }}>
                    {t.newRole} at <strong style={{ color: 'var(--np-accent)' }}>{t.newCompany}</strong>
                  </div>
                </div>

                {/* Strategic Significance */}
                <p style={{ fontSize: '0.82rem', color: 'var(--np-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  <strong>Strategic Signal:</strong> {t.strategicSignificance}
                </p>
              </div>

              {/* Right Column: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {/* WhatsApp Congratulate */}
                <a
                  href={generateWhatsAppUrl({
                    contact: contactRecord,
                    customMessage: `Hi ${t.name.split(' ')[0]}! Huge congratulations on the transition to ${t.newRole} at ${t.newCompany}! So thrilled for you and hope to catch up soon!`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  title="Send WhatsApp Congratulations"
                >
                  <MessageSquare size={14} /> WhatsApp
                </a>

                {/* Draft Congratulations in AI Inbox */}
                <button
                  onClick={() => handleDraftCongratulations(t)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  <Sparkles size={14} /> Draft Congratulations
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Target Enterprise Intelligence Section */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Building2 size={18} style={{ color: 'var(--np-accent)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Target Enterprise Intelligence</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {TARGET_ENTERPRISES.map((org, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: '18px 20px',
                borderRadius: 14,
                backgroundColor: 'var(--np-bg-secondary)',
                border: '1px solid var(--np-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>{org.name}</span>
                <span className="badge badge-priority" style={{ fontSize: '0.66rem' }}>
                  {org.headcountInNetwork} Managed Leads
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                {org.recentNews}
              </p>
              <div style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>Key Anchor:</span>
                <strong style={{ color: 'var(--np-text-primary)' }}>{org.priorityContact}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
