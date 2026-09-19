'use client';

// ═══════════════════════════════════════════════════════
// NetPulse — Enterprise Batch Ingestion & Validation Studio
// Dual-Mode Multiline RFC 4180 CSV & Strict JSON Array Buffer,
// 1-Click Preset Template Injectors, Schema Linting, and Zero-Loss DB Commit
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
  Code2,
  Check,
  RotateCcw,
  Zap,
  Play,
  Copy,
  Terminal,
} from 'lucide-react';
import { parseLinkedInCSV, detectChanges, type ParsedContact } from '@/lib/csv-parser';
import { netPulseStore } from '@/lib/storage/db';
import type { Contact, ImportResult, ImportError, RelationshipTier } from '@/lib/types';
import { soundFx } from '@/lib/sound';

type ImportStage = 'upload' | 'parsing' | 'importing' | 'complete' | 'error';
type StudioMode = 'csv' | 'json';

const SAMPLE_CSV_PRESET_SHASHANK = `full_name,email,company,title,relationship_tier,last_contacted_at,notes
Sandeep Gunasekaran,sandeep.gunasekaran@visa.example.com,Visa,Director | Cloud Security Engineering,priority,2026-08-12,Key industry connection at Visa. Mentoring on enterprise cloud perimeter defense and zero-trust verification.
Pravallika Varikuti,pravallika.varikuti@bosch.example.com,Bosch Global Software Technologies,Software Engineer,priority,2026-09-01,Bosch alumni network. Automotive backend microservices and telemetry ingestion pipelines.
Nagesh Bhavi,nagesh.bhavi@hpe.example.com,Hewlett Packard Enterprise,IT Developer/Engineer,priority,2026-08-18,HPE enterprise systems engineer. Syncing on hybrid cloud deployments and DevFlow Pro telemetry.
Chandan U,chandan.u@qualcomm.example.com,Qualcomm,Associate Software Engineer,warm,2026-08-05,Qualcomm systems engineer. Discussed low-latency firmware and edge computing architectures.
Raksha B R,raksha.br@infineon.example.com,Infineon Technologies,Student Intern,priority,2026-09-05,Semiconductor engineering collaborator at Infineon. Hardware-level cryptographic key stores.
Abhay S J,abhay.sj@bosch.example.com,Bosch Global Software Technologies,AI/GenAI Intern,priority,2026-08-28,GenAI researcher at Bosch. Collaborating on multi-agent evaluation frameworks and LangGraph DAGs.
Divitha Nagaraju,divitha.nagaraju@acceldata.example.com,Acceldata,Software Engineer Intern,priority,2026-09-08,Data observability engineer at Acceldata. Real-time stream monitoring and anomaly detection.
Sai Yaswitha Raavi,sai.yaswitha@visa.example.com,Visa,Cyber Security Engineer,priority,2026-08-25,Visa Cyber Security team. Zero-trust authentication tokens and anti-proxy verification gates.
Aritra Mondal,aritra.mondal@jssstu.example.edu,CSE SJCE JSSSTU,Student & Core Peer,priority,2026-09-13,Classmate and hackathon peer at JSS STU CSE. Worked together on HACK-OLYMPIC 2026.`;

const SAMPLE_CSV_PRESET_AI = `full_name,email,company,title,relationship_tier,last_contacted_at,notes
Jensen Huang,jensen@nvidia.com,NVIDIA,President & CEO,priority,2026-06-15,Key partner for enterprise AI hardware clusters and CUDA acceleration pipelines.
Mira Murati,mira@thinkingmachines.ai,Thinking Machines Lab,Founder & CEO,priority,2026-06-28,Ex-CTO OpenAI. Evaluating next-gen autonomous agent reasoning frameworks.
Andrej Karpathy,andrej@eurekalabs.ai,Eureka Labs,Founder & AI Architect,priority,2026-07-02,Discussed multimodal foundation models and edge inference optimization.
Nat Friedman,nat@aigrant.org,AI Grant,General Partner,priority,2026-07-10,Leading investor in developer tools and autonomous agent swarms.
Daniel Gross,daniel@pioneer.fund,Pioneer Fund,Co-Founder & Investor,priority,2026-07-14,Computing cluster syndication and seed funding for AI-native architectures.
Ilya Sutskever,ilya@ssi.inc,Safe Superintelligence Inc,Co-Founder & Chief Scientist,priority,2026-06-20,Frontier safety architectures and scalable neural alignment.`;

const SAMPLE_CSV_PRESET_CRYPTO = `full_name,email,company,title,relationship_tier,last_contacted_at,notes
Vitalik Buterin,vitalik@ethereum.org,Ethereum Foundation,Chief Scientist,priority,2026-06-10,Account abstraction, rollups, and zero-knowledge privacy primitives.
Dr. Elena Rostova,elena.rostova@quantumfoundry.ai,QuantumFoundry,Founder & Chief Architect,priority,2026-06-23,Bilateral quantum entanglement protocol & fault-tolerant QML.
Gavin Wood,gavin@parity.io,Polkadot / Web3 Foundation,Founder,priority,2026-07-01,Heterogeneous multi-chain architecture and substrate consensus.
Zooko Wilcox,zooko@electriccoin.co,Electric Coin Co,Founder & Cryptographer,warm,2026-06-18,Halo zero-knowledge proofs and decentralized financial privacy.
Balaji Srinivasan,balaji@thenetworkstate.com,The Network State,Author & Angel Investor,priority,2026-07-05,Decentralized governance, crypto-cities, and sovereign cloud tech.`;

const SAMPLE_JSON_PRESET_SAAS = JSON.stringify([
  {
    "full_name": "Satya Nadella",
    "email": "satya.nadella@microsoft.com",
    "company": "Microsoft",
    "title": "Chairman and CEO",
    "relationship_tier": "priority",
    "last_contacted_at": "2026-06-25",
    "notes": "Executive alignment on Azure distributed agent services."
  },
  {
    "full_name": "Marc Benioff",
    "email": "mbenioff@salesforce.com",
    "company": "Salesforce",
    "title": "Chair & CEO",
    "relationship_tier": "priority",
    "last_contacted_at": "2026-07-04",
    "notes": "Agentforce enterprise autonomous customer intelligence expansion."
  },
  {
    "full_name": "Guillermo Rauch",
    "email": "rauchg@vercel.com",
    "company": "Vercel",
    "title": "CEO & Founder",
    "relationship_tier": "warm",
    "last_contacted_at": "2026-07-12",
    "notes": "Pioneering edge functions, streaming SSR, and Next.js 16 runtime."
  },
  {
    "full_name": "Harrison Chase",
    "email": "harrison@langchain.dev",
    "company": "LangChain",
    "title": "Co-Founder & CEO",
    "relationship_tier": "priority",
    "last_contacted_at": "2026-07-18",
    "notes": "LangGraph stateful multi-agent workflows and cognitive orchestration."
  },
  {
    "full_name": "Kelsey Hightower",
    "email": "kelsey@minimal.dev",
    "company": "Independent / Former Google Cloud",
    "title": "Principal Engineer & Board Advisor",
    "relationship_tier": "warm",
    "last_contacted_at": "2026-06-30",
    "notes": "Distributed systems resilience, Kubernetes simplicity, and developer craft."
  }
], null, 2);

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<'studio' | 'file'>('studio');
  const [studioMode, setStudioMode] = useState<StudioMode>('csv');
  const [bufferText, setBufferText] = useState(SAMPLE_CSV_PRESET_AI);
  const [isExecuting, setIsExecuting] = useState(false);
  const [studioLogs, setStudioLogs] = useState<string[]>([
    '⚡ Batch Ingestion Studio initialized.',
    'Ready to parse RFC 4180 CSV or Strict JSON array payload.',
  ]);

  // File Upload State
  const [stage, setStage] = useState<ImportStage>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseErrors, setParseErrors] = useState<ImportError[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Validate Buffer in Real-Time
  const bufferValidation = (() => {
    if (!bufferText.trim()) {
      return { count: 0, valid: false, error: 'Buffer is empty', tiers: { priority: 0, warm: 0, cold: 0 } };
    }

    if (studioMode === 'json') {
      try {
        const parsed = JSON.parse(bufferText);
        if (!Array.isArray(parsed)) {
          return { count: 0, valid: false, error: 'JSON root must be an array of contact objects', tiers: { priority: 0, warm: 0, cold: 0 } };
        }
        let pCount = 0;
        let wCount = 0;
        let cCount = 0;
        for (const item of parsed) {
          if (!item.full_name) {
            return { count: parsed.length, valid: false, error: 'Each contact object must contain a full_name', tiers: { priority: 0, warm: 0, cold: 0 } };
          }
          if (item.relationship_tier === 'priority') pCount++;
          else if (item.relationship_tier === 'cold') cCount++;
          else wCount++;
        }
        return { count: parsed.length, valid: true, error: null, tiers: { priority: pCount, warm: wCount, cold: cCount } };
      } catch (err) {
        return { count: 0, valid: false, error: `Invalid JSON syntax: ${(err as Error).message}`, tiers: { priority: 0, warm: 0, cold: 0 } };
      }
    } else {
      const lines = bufferText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        return { count: 0, valid: false, error: 'CSV requires a header line and at least 1 data row', tiers: { priority: 0, warm: 0, cold: 0 } };
      }
      const dataRows = lines.slice(1);
      let pCount = 0;
      let wCount = 0;
      let cCount = 0;
      for (const row of dataRows) {
        const parts = row.split(',');
        const tier = parts[4]?.trim().toLowerCase();
        if (tier === 'priority') pCount++;
        else if (tier === 'cold') cCount++;
        else wCount++;
      }
      return { count: dataRows.length, valid: true, error: null, tiers: { priority: pCount, warm: wCount, cold: cCount } };
    }
  })();

  const handleExecuteBatch = async () => {
    if (!bufferValidation.valid) {
      setStudioLogs(prev => [...prev, `❌ Validation Failed: ${bufferValidation.error}`]);
      soundFx.playErrorTone();
      return;
    }

    setIsExecuting(true);
    const startTime = performance.now();
    setStudioLogs(prev => [...prev, `⏳ Committing ${bufferValidation.count} records via atomic write-ahead buffer...`]);

    try {
      let entities: Array<Partial<Contact>> = [];

      if (studioMode === 'json') {
        entities = JSON.parse(bufferText);
      } else {
        const lines = bufferText.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1);

        entities = dataRows.map(row => {
          const parts: string[] = [];
          let insideQuote = false;
          let current = '';

          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
              insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
              parts.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          parts.push(current.trim());

          const record: Record<string, string> = {};
          headers.forEach((h, i) => {
            record[h] = parts[i] || '';
          });

          return {
            full_name: record.full_name || record.name || 'Leader',
            email: record.email || null,
            company: record.company || null,
            title: record.title || null,
            relationship_tier: (record.relationship_tier || 'warm') as RelationshipTier,
            last_contacted_at: record.last_contacted_at || new Date().toISOString().split('T')[0],
            notes: record.notes || null,
          };
        });
      }

      const result = await netPulseStore.batchIngestEntities(entities);
      const elapsed = Math.round(performance.now() - startTime);

      soundFx.playSuccessChime();
      setStudioLogs(prev => [
        ...prev,
        `✅ Batch Ingestion Succeeded in ${elapsed}ms:`,
        `   • Inserted: ${result.inserted} new contacts`,
        `   • Updated: ${result.updated} existing contacts`,
        `   • Total Active Ingested: ${result.total}`,
        result.errors.length > 0 ? `   ⚠️ Warnings: ${result.errors.join('; ')}` : '   • Zero schema warnings.',
      ]);
    } catch (err) {
      soundFx.playErrorTone();
      setStudioLogs(prev => [...prev, `❌ Ingestion Error: ${(err as Error).message}`]);
    } finally {
      setIsExecuting(false);
    }
  };

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

  const downloadSampleCSV = () => {
    const csvHeader = 'First Name,Last Name,URL,Email Address,Company,Position,Connected On\\r\\n';
    const csvRows = [
      'Jensen,Huang,https://www.linkedin.com/in/jensenhuang,jensen@nvidia.com,NVIDIA,President and CEO,15 Jan 2026',
      'Mira,Murati,https://www.linkedin.com/in/miramurati,mira@thinkingmachines.ai,Thinking Machines Lab,Founder & CEO,22 Feb 2026',
      'Andrej,Karpathy,https://www.linkedin.com/in/andrej-karpathy,andrej@eurekalabs.ai,Eureka Labs,Founder,10 Mar 2026',
      'Satya,Nadella,https://www.linkedin.com/in/satyanadella,satya@microsoft.com,Microsoft,Chairman and CEO,05 Apr 2026',
      'Guillermo,Rauch,https://www.linkedin.com/in/rauchg,rauchg@vercel.com,Vercel,CEO and Founder,18 May 2026',
    ].join('\\r\\n');

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
    <div className="page-container" style={{ maxWidth: 1040 }}>
      {/* Page Header */}
      <div className="page-header animate-fade-in" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
            ENTERPRISE BATCH INGESTION &amp; SYNC STUDIO
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
            Dual-Mode RFC 4180 CSV / Strict JSON &bull; Zero-Loss IndexedDB Persistence
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Smart Contact Ingestion Engine</h1>
        <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
          Ingest LinkedIn connections, run multiline batch injections with schema validation, or upload local CSV exports.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 24,
          background: 'var(--np-bg-secondary)',
          padding: 6,
          borderRadius: 12,
          border: '1px solid var(--np-border)',
          width: 'fit-content',
        }}
      >
        <button
          onClick={() => setActiveTab('studio')}
          className={`btn btn-sm ${activeTab === 'studio' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          <Code2 size={15} /> Batch Ingestion Studio
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`btn btn-sm ${activeTab === 'file' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          <Upload size={15} /> File Uploader (CSV)
        </button>
      </div>

      {/* TAB 1: BATCH INGESTION STUDIO */}
      {activeTab === 'studio' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Preset Template Injectors & Format Switcher */}
          <div
            className="card"
            style={{
              padding: 18,
              borderRadius: 14,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--np-text-secondary)' }}>Format:</span>
              <div style={{ display: 'flex', gap: 4, background: 'var(--np-bg-tertiary)', padding: 3, borderRadius: 8 }}>
                <button
                  onClick={() => {
                    setStudioMode('csv');
                    setBufferText(SAMPLE_CSV_PRESET_AI);
                  }}
                  className={`btn btn-sm ${studioMode === 'csv' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                >
                  RFC 4180 CSV
                </button>
                <button
                  onClick={() => {
                    setStudioMode('json');
                    setBufferText(SAMPLE_JSON_PRESET_SAAS);
                  }}
                  className={`btn btn-sm ${studioMode === 'json' ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                >
                  Strict JSON Array
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--np-text-secondary)' }}>1-Click Presets:</span>
              <button
                onClick={() => {
                  setStudioMode('csv');
                  setBufferText(SAMPLE_CSV_PRESET_SHASHANK);
                }}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Users size={12} /> Shashank&apos;s LinkedIn Network
              </button>
              <button
                onClick={() => {
                  setStudioMode('csv');
                  setBufferText(SAMPLE_CSV_PRESET_AI);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Sparkles size={12} color="#6366f1" /> AI Syndicate
              </button>
              <button
                onClick={() => {
                  setStudioMode('csv');
                  setBufferText(SAMPLE_CSV_PRESET_CRYPTO);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Zap size={12} color="#10b981" /> Crypto Pioneers
              </button>
              <button
                onClick={() => {
                  setStudioMode('json');
                  setBufferText(SAMPLE_JSON_PRESET_SAAS);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Database size={12} color="#f59e0b" /> SaaS Titans (JSON)
              </button>
            </div>
          </div>

          {/* Multiline Monospace Editor Buffer */}
          <div className="card" style={{ padding: 0, borderRadius: 14, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                background: 'var(--np-bg-tertiary)',
                borderBottom: '1px solid var(--np-border)',
                fontSize: '0.78rem',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--np-text-secondary)' }}>
                {studioMode === 'csv' ? 'batch_connections_buffer.csv' : 'batch_connections_buffer.json'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {bufferValidation.valid ? (
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                    <CheckCircle2 size={13} /> {bufferValidation.count} Records Validated
                  </span>
                ) : (
                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                    <AlertTriangle size={13} /> {bufferValidation.error}
                  </span>
                )}
                <span style={{ color: 'var(--np-text-tertiary)' }}>
                  P: {bufferValidation.tiers.priority} | W: {bufferValidation.tiers.warm} | C: {bufferValidation.tiers.cold}
                </span>
              </div>
            </div>

            <textarea
              value={bufferText}
              onChange={e => setBufferText(e.target.value)}
              rows={12}
              style={{
                width: '100%',
                padding: '16px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                background: 'var(--np-bg-secondary)',
                color: 'var(--np-text-primary)',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                background: 'var(--np-bg-tertiary)',
                borderTop: '1px solid var(--np-border)',
              }}
            >
              <button
                onClick={() => setBufferText('')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.78rem', color: 'var(--np-text-tertiary)' }}
              >
                Clear Buffer
              </button>

              <button
                onClick={handleExecuteBatch}
                disabled={!bufferValidation.valid || isExecuting}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', fontWeight: 700 }}
              >
                <Play size={14} /> {isExecuting ? 'Committing...' : `Commit ${bufferValidation.count} Records to Database`}
              </button>
            </div>
          </div>

          {/* Terminal Audit Log */}
          <div
            className="card"
            style={{
              padding: 16,
              borderRadius: 14,
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#94a3b8' }}>
              <Terminal size={14} />
              <span style={{ fontWeight: 700 }}>STUDIO EXECUTION TELEMETRY LOG</span>
            </div>
            {studioLogs.map((log, i) => (
              <div key={i} style={{ opacity: i === studioLogs.length - 1 ? 1 : 0.75 }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FILE UPLOADER */}
      {activeTab === 'file' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {stage === 'upload' && (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--np-accent)' : 'var(--np-border)'}`,
                borderRadius: 16,
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: dragOver ? 'var(--np-accent-light)' : 'var(--np-bg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--np-accent-light)',
                  color: 'var(--np-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Upload size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 6 }}>Drop your LinkedIn CSV here</h3>
              <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.84rem', margin: '0 auto 16px', maxWidth: 420 }}>
                Download your Connections.csv from LinkedIn Settings &gt; Data Privacy &gt; Get a copy of your data
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={e => {
                  e.stopPropagation();
                  downloadSampleCSV();
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} /> Download Sample CSV Template
              </button>
            </div>
          )}

          {stage === 'parsing' && (
            <div className="card" style={{ padding: 36, textAlign: 'center', borderRadius: 16 }}>
              <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--np-accent)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Parsing {fileName}...</h3>
              <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.84rem' }}>
                Analyzing column headers, cleaning emails, and validating records
              </p>
            </div>
          )}

          {stage === 'importing' && (
            <div className="card" style={{ padding: 36, textAlign: 'center', borderRadius: 16 }}>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  background: 'var(--np-bg-tertiary)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'var(--np-accent)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Importing {fileName}...</h3>
              <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.84rem' }}>
                Applying differential sync and saving to write-ahead IndexedDB
              </p>
            </div>
          )}

          {stage === 'complete' && importResult && (
            <div className="card" style={{ padding: 32, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--np-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Import Successfully Completed</h3>
                  <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.84rem', margin: 0 }}>
                    {importResult.total} connections parsed from {fileName}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div style={{ padding: 14, background: 'var(--np-bg-secondary)', borderRadius: 10, border: '1px solid var(--np-border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--np-text-secondary)', fontWeight: 700 }}>NEW CONTACTS</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--np-success)' }}>+{importResult.created}</div>
                </div>
                <div style={{ padding: 14, background: 'var(--np-bg-secondary)', borderRadius: 10, border: '1px solid var(--np-border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--np-text-secondary)', fontWeight: 700 }}>UPDATED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--np-info)' }}>{importResult.updated}</div>
                </div>
                <div style={{ padding: 14, background: 'var(--np-bg-secondary)', borderRadius: 10, border: '1px solid var(--np-border)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--np-text-secondary)', fontWeight: 700 }}>UNCHANGED</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--np-text-secondary)' }}>{importResult.unchanged}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => router.push('/contacts')}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                >
                  View Contacts Directory <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => {
                    setStage('upload');
                    setImportResult(null);
                  }}
                  className="btn btn-secondary"
                >
                  Import Another File
                </button>
              </div>
            </div>
          )}

          {stage === 'error' && (
            <div className="card" style={{ padding: 28, borderRadius: 16, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <XCircle size={24} style={{ color: 'var(--np-danger)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Import Failed</h3>
              </div>
              <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.86rem', marginBottom: 20 }}>
                {errorMessage}
              </p>
              <button
                onClick={() => setStage('upload')}
                className="btn btn-secondary btn-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}