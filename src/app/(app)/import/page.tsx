'use client';

// ═══════════════════════════════════════════════════════
// NetPulse — Smart Contact Import & Evaluator Sandbox
// Local LinkedIn CSV parser, 1-Click Judge Demo Loader,
// and differential sync with IndexedDB write-ahead storage.
// ═══════════════════════════════════════════════════════

import { useState, useRef, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Info,
  Download,
  Sparkles,
  Users,
  Database,
  FileSpreadsheet,
} from 'lucide-react';
import { parseLinkedInCSV, detectChanges, type ParsedContact } from '@/lib/csv-parser';
import { netPulseStore } from '@/lib/storage/db';
import type { Contact, ImportResult, ImportError, RelationshipTier } from '@/lib/types';

type ImportStage = 'upload' | 'parsing' | 'importing' | 'complete' | 'error';

const SAMPLE_JUDGE_DATASET: Partial<Contact>[] = [
  {
    full_name: 'Jensen Huang',
    company: 'NVIDIA',
    title: 'President & CEO',
    email: 'jensen.huang@nvidia.com',
    relationship_tier: 'priority',
    notes: 'Key partner for enterprise AI hardware clusters and CUDA acceleration pipelines.',
  },
  {
    full_name: 'Mira Murati',
    company: 'Thinking Machines Lab',
    title: 'Founder & CEO',
    email: 'mira@thinkingmachines.ai',
    relationship_tier: 'priority',
    notes: 'Ex-CTO OpenAI. Evaluating next-gen autonomous agent reasoning frameworks.',
  },
  {
    full_name: 'Andrej Karpathy',
    company: 'Eureka Labs',
    title: 'Founder & AI Architect',
    email: 'andrej@eurekalabs.ai',
    relationship_tier: 'priority',
    notes: 'Discussed multimodal foundation models and edge inference optimization.',
  },
  {
    full_name: 'Nat Friedman',
    company: 'AI Grant',
    title: 'General Partner & Former GitHub CEO',
    email: 'nat@aigrant.org',
    relationship_tier: 'priority',
    notes: 'Leading investor in developer tools and autonomous agent swarms.',
  },
  {
    full_name: 'Daniel Gross',
    company: 'Pioneer Fund',
    title: 'Co-Founder & Investor',
    email: 'daniel@pioneer.fund',
    relationship_tier: 'priority',
    notes: 'Computing cluster syndication and seed funding for AI-native architectures.',
  },
  {
    full_name: 'Satya Nadella',
    company: 'Microsoft',
    title: 'Chairman and CEO',
    email: 'satya.nadella@microsoft.com',
    relationship_tier: 'priority',
    notes: 'Executive alignment on Azure distributed agent services.',
  },
  {
    full_name: 'Mustafa Suleyman',
    company: 'Microsoft AI',
    title: 'CEO, Microsoft AI',
    email: 'mustafa@microsoft.com',
    relationship_tier: 'priority',
    notes: 'DeepMind co-founder leading Copilot and consumer AI frontiers.',
  },
  {
    full_name: 'Guillermo Rauch',
    company: 'Vercel',
    title: 'CEO & Founder',
    email: 'rauchg@vercel.com',
    relationship_tier: 'warm',
    notes: 'Pioneering edge functions, streaming SSR, and Next.js ecosystem.',
  },
  {
    full_name: 'Harrison Chase',
    company: 'LangChain',
    title: 'Co-Founder & CEO',
    email: 'harrison@langchain.dev',
    relationship_tier: 'warm',
    notes: 'LangGraph architecture and stateful multi-agent workflows.',
  },
  {
    full_name: 'Amjad Masad',
    company: 'Replit',
    title: 'Founder & CEO',
    email: 'amjad@replit.com',
    relationship_tier: 'warm',
    notes: 'Collaborative development environments and cloud-native execution.',
  },
  {
    full_name: 'Kelsey Hightower',
    company: 'Independent / Former Google Cloud',
    title: 'Principal Engineer & Board Advisor',
    email: 'kelsey@minimal.dev',
    relationship_tier: 'warm',
    notes: 'Distributed systems resilience, Kubernetes simplicity, and developer craft.',
  },
  {
    full_name: 'Suhail Doshi',
    company: 'Playground AI & Mixpanel',
    title: 'Founder & CEO',
    email: 'suhail@playgroundai.com',
    relationship_tier: 'warm',
    notes: 'Generative media pipelines, product velocity, and startup founder mentorship.',
  },
];

export default function ImportPage() {
  const [stage, setStage] = useState<ImportStage>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseErrors, setParseErrors] = useState<ImportError[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please upload a valid CSV file');
      setStage('error');
      return;
    }

    setFileName(file.name);
    setStage('parsing');

    try {
      const { contacts, errors } = await parseLinkedInCSV(file);
      setParseErrors(errors);

      if (contacts.length === 0) {
        setErrorMessage("No valid contacts found in the CSV. Make sure it's a LinkedIn connections export format.");
        setStage('error');
        return;
      }

      await importParsedContacts(contacts);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to parse CSV');
      setStage('error');
    }
  };

  const importParsedContacts = async (contacts: ParsedContact[]) => {
    setStage('importing');
    setProgress(20);

    const now = new Date().toISOString();
    const formatted: Contact[] = contacts.map((c, idx) => ({
      id: `imported-${Date.now()}-${idx}`,
      user_id: 'local-user',
      full_name: c.full_name,
      company: c.company || null,
      title: c.title || null,
      email: c.email || null,
      linkedin_url: c.linkedin_url || null,
      relationship_tier: 'warm' as RelationshipTier,
      last_contacted_at: c.connected_on || null,
      source: 'linkedin',
      previous_company: null,
      previous_title: null,
      last_bulk_synced_at: now,
      last_enriched_at: null,
      notes: null,
      created_at: now,
      updated_at: now,
    }));

    setProgress(60);
    const stats = await netPulseStore.importContacts(formatted);
    setProgress(100);

    setImportResult({
      total: contacts.length,
      created: stats.added,
      updated: stats.updated,
      unchanged: stats.unchanged,
      errors: [],
    });
    setStage('complete');
  };

  const loadJudgeDataset = async () => {
    setFileName('judge_silicon_valley_leaders.csv');
    setStage('importing');
    setProgress(30);

    const now = new Date().toISOString();
    const formatted: Contact[] = SAMPLE_JUDGE_DATASET.map((c, idx) => ({
      id: `judge-${Date.now()}-${idx}`,
      user_id: 'local-user',
      full_name: c.full_name || 'Leader',
      company: c.company || 'Enterprise',
      title: c.title || 'Executive',
      email: c.email || null,
      linkedin_url: `https://linkedin.com/in/${c.full_name?.toLowerCase().replace(/\s+/g, '-')}`,
      relationship_tier: (c.relationship_tier || 'priority') as RelationshipTier,
      last_contacted_at: new Date(Date.now() - (idx * 5 + 10) * 86400000).toISOString().split('T')[0],
      source: 'linkedin',
      previous_company: null,
      previous_title: null,
      last_bulk_synced_at: now,
      last_enriched_at: now,
      notes: c.notes || null,
      created_at: now,
      updated_at: now,
    }));

    setProgress(70);
    const stats = await netPulseStore.importContacts(formatted);
    setProgress(100);

    setImportResult({
      total: formatted.length,
      created: stats.added,
      updated: stats.updated,
      unchanged: stats.unchanged,
      errors: [],
    });
    setStage('complete');
  };

  const downloadSampleCSV = () => {
    const csvHeader = 'First Name,Last Name,URL,Email Address,Company,Position,Connected On\r\n';
    const csvRows = [
      'Jensen,Huang,https://www.linkedin.com/in/jensenhuang,jensen@nvidia.com,NVIDIA,President and CEO,15 Jan 2026',
      'Mira,Murati,https://www.linkedin.com/in/miramurati,mira@thinkingmachines.ai,Thinking Machines Lab,Founder & CEO,22 Feb 2026',
      'Andrej,Karpathy,https://www.linkedin.com/in/andrej-karpathy,andrej@eurekalabs.ai,Eureka Labs,Founder,10 Mar 2026',
      'Satya,Nadella,https://www.linkedin.com/in/satyanadella,satya@microsoft.com,Microsoft,Chairman and CEO,05 Apr 2026',
      'Guillermo,Rauch,https://www.linkedin.com/in/rauchg,rauchg@vercel.com,Vercel,CEO and Founder,18 May 2026',
    ].join('\r\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'NetPulse_Sample_Connections.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="page-container" style={{ maxWidth: 940 }}>
      {/* Page Header */}
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
            IMPORT &amp; SYNC ENGINE
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
            LinkedIn CSV &bull; Zero-Loss IndexedDB Write-Ahead
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Import Network Connections</h1>
        <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
          Seamlessly ingest LinkedIn CSV exports, deduplicate contacts, and seed relationship health scores
        </p>
      </div>

      {/* 1-Click Judge Sandbox Card */}
      <div
        className="card animate-fade-in-up"
        style={{
          marginBottom: 24,
          padding: 22,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(124, 58, 237, 0.08) 100%)',
          border: '1px solid rgba(79, 70, 229, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px 0' }}>
                Instant Evaluator Demo Dataset
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--np-text-secondary)' }}>
                Don't have a personal LinkedIn export ready? Load 12 high-profile tech leaders &amp; VCs in 1 click.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={downloadSampleCSV}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Sample CSV
            </button>
            <button
              onClick={loadJudgeDataset}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              <Database size={14} /> Load 12 Leaders
            </button>
          </div>
        </div>
      </div>

      {/* Upload Stage */}
      {stage === 'upload' && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`card animate-fade-in-up ${dragOver ? 'drag-over' : ''}`}
          style={{
            padding: '50px 30px',
            textAlign: 'center',
            cursor: 'pointer',
            border: `2px dashed ${dragOver ? 'var(--np-accent)' : 'var(--np-border)'}`,
            borderRadius: 18,
            transition: 'all 0.2s ease',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            style={{ display: 'none' }}
          />

          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--np-bg-secondary)',
              border: '1px solid var(--np-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--np-accent)',
            }}
          >
            <Upload size={26} />
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>
            Drop your LinkedIn Connections.csv here
          </h3>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.88rem', maxWidth: 440, margin: '0 auto 16px auto' }}>
            Export your network from LinkedIn: <em>Settings &amp; Privacy &rarr; Data Privacy &rarr; Get a copy of your data &rarr; Connections</em>.
          </p>

          <button className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>
            Choose File from Disk
          </button>
        </div>
      )}

      {/* Parsing & Importing Stage */}
      {(stage === 'parsing' || stage === 'importing') && (
        <div className="card animate-scale-in" style={{ padding: 40, textAlign: 'center', borderRadius: 16 }}>
          <RefreshCw size={36} className="spin" style={{ color: 'var(--np-accent)', margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 8 }}>
            {stage === 'parsing' ? 'Parsing CSV Records...' : 'Importing & Deduplicating Contacts...'}
          </h3>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.86rem', marginBottom: 20 }}>
            {fileName}
          </p>

          {/* Progress Bar */}
          <div style={{ width: '100%', maxWidth: 360, height: 8, background: 'var(--np-bg-secondary)', borderRadius: 10, margin: '0 auto', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Complete Stage */}
      {stage === 'complete' && importResult && (
        <div className="card animate-scale-in" style={{ padding: 32, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 2px 0' }}>
                Import Completed Successfully!
              </h2>
              <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--np-text-secondary)' }}>
                Differential sync processed {importResult.total} connection records into local storage.
              </p>
            </div>
          </div>

          {/* Differential Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: 'var(--np-bg-secondary)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
                {importResult.created}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--np-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Added Contacts
              </div>
            </div>

            <div style={{ padding: 16, background: 'var(--np-bg-secondary)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6' }}>
                {importResult.updated}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--np-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Updated Profiles
              </div>
            </div>

            <div style={{ padding: 16, background: 'var(--np-bg-secondary)', borderRadius: 12, textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--np-text-tertiary)' }}>
                {importResult.unchanged}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--np-text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Unchanged
              </div>
            </div>
          </div>

          {/* Navigation CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setStage('upload');
                setImportResult(null);
              }}
              className="btn btn-secondary btn-sm"
            >
              Import Another File
            </button>
            <button
              onClick={() => router.push('/pipeline')}
              className="btn btn-secondary btn-sm"
            >
              View Pipeline Kanban
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              Inspect Daily Digest <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Error Stage */}
      {stage === 'error' && (
        <div className="card animate-shake" style={{ padding: 32, borderRadius: 16, textAlign: 'center' }}>
          <XCircle size={40} style={{ color: '#ef4444', margin: '0 auto 14px auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>Import Failed</h3>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.88rem', maxWidth: 420, margin: '0 auto 20px auto' }}>
            {errorMessage}
          </p>
          <button
            onClick={() => setStage('upload')}
            className="btn btn-primary btn-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
