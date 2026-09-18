'use client';

// ═══════════════════════════════════════════════════════
// NetPulse — Cadence SLA, Scoring & Enterprise Data Governance
// Reactive local write-ahead storage, storage quota telemetry,
// structured database snapshot export, and universal cascading purge.
// ═══════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import {
  Save,
  CheckCircle2,
  Sliders,
  Clock,
  Building2,
  Briefcase,
  X,
  Plus,
  RotateCcw,
  Sparkles,
  Database,
  Download,
  Trash2,
  AlertTriangle,
  HardDrive,
  FileJson,
  FileSpreadsheet,
  Activity,
  Layers,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';
import type { UserSettings, ScoringWeights } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';
import { soundFx } from '@/lib/sound';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    ...DEFAULT_SETTINGS,
    id: 'local-settings',
    user_id: 'local-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');

  // Enterprise Governance State
  const [telemetry, setTelemetry] = useState<{
    contactsCount: number;
    interactionsCount: number;
    relationshipsCount: number;
    virtualityLinksCount: number;
    decayOffsetDays: number;
    activePersona: string;
    estimatedBytes: number;
  } | null>(null);
  const [purgePhrase, setPurgePhrase] = useState('');
  const [isPurging, setIsPurging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadData = async () => {
    const data = await netPulseStore.getSettings();
    setSettings(data);
    const telem = await netPulseStore.getStorageTelemetry();
    setTelemetry(telem);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('netpulse:state-changed', handleUpdate);
    return () => window.removeEventListener('netpulse:state-changed', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    setSettings(prev => ({
      ...prev,
      scoring_weights: {
        ...prev.scoring_weights,
        [key]: value,
      },
    }));
  };

  const addCompany = () => {
    if (!newCompany.trim()) return;
    const trimmed = newCompany.trim();
    if (settings.target_companies?.includes(trimmed)) return;
    setSettings(prev => ({
      ...prev,
      target_companies: [...(prev.target_companies || []), trimmed],
    }));
    setNewCompany('');
  };

  const removeCompany = (index: number) => {
    setSettings(prev => ({
      ...prev,
      target_companies: (prev.target_companies || []).filter((_, i) => i !== index),
    }));
  };

  const addTitle = () => {
    if (!newTitle.trim()) return;
    const trimmed = newTitle.trim();
    if (settings.target_titles?.includes(trimmed)) return;
    setSettings(prev => ({
      ...prev,
      target_titles: [...(prev.target_titles || []), trimmed],
    }));
    setNewTitle('');
  };

  const removeTitle = (index: number) => {
    setSettings(prev => ({
      ...prev,
      target_titles: (prev.target_titles || []).filter((_, i) => i !== index),
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updated: UserSettings = {
        ...settings,
        updated_at: new Date().toISOString(),
      };
      await netPulseStore.saveSettings(updated);
      soundFx.playSuccessChime();
      showToast('Cadence SLAs & scoring formulas saved! Alerts recalculated.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaultFormulas = () => {
    setSettings({
      ...DEFAULT_SETTINGS,
      id: 'local-settings',
      user_id: 'local-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    soundFx.playChirp();
    showToast('Reset Cadence SLAs and weights to default system baselines.');
  };

  // ── Database Snapshot Export ──
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const snapshot = await netPulseStore.exportDatabaseSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `netpulse-enterprise-snapshot-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      soundFx.playSuccessChime();
      showToast('Exported complete NetPulse database snapshot (JSON).');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    const contacts = await netPulseStore.getContacts();
    const headers = ['full_name', 'email', 'company', 'title', 'relationship_tier', 'last_contacted_at', 'notes'];
    const rows = contacts.map(c => [
      `"${c.full_name || ''}"`,
      `"${c.email || ''}"`,
      `"${c.company || ''}"`,
      `"${c.title || ''}"`,
      `"${c.relationship_tier || ''}"`,
      `"${c.last_contacted_at || ''}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netpulse-contacts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    soundFx.playSuccessChime();
    showToast(`Exported ${contacts.length} contacts to CSV.`);
  };

  // ── Universal Cascading Purge ──
  const handleUniversalPurge = async () => {
    if (purgePhrase.trim() !== 'PURGE NETPULSE STORE') {
      soundFx.playErrorTone();
      showToast('Type exact phrase "PURGE NETPULSE STORE" to confirm.');
      return;
    }

    setIsPurging(true);
    try {
      const result = await netPulseStore.universalPurge(purgePhrase);
      soundFx.playChirp();
      setPurgePhrase('');
      await loadData();
      showToast(`Universal Cascade Purge complete: ${result.purgedRecords} records removed.`);
    } catch (err) {
      soundFx.playErrorTone();
      showToast((err as Error).message);
    } finally {
      setIsPurging(false);
    }
  };

  // ── Factory Benchmark Restore ──
  const handleRestoreBenchmark = async () => {
    await netPulseStore.resetToBaseline();
    await loadData();
    soundFx.playSuccessChime();
    showToast('Restored 15+ Silicon Valley leaders, interactions, and relationships.');
  };

  return (
    <div className="page-container" style={{ maxWidth: 980 }}>
      {/* Page Header */}
      <div className="page-header animate-fade-in" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
            ENGINE CONFIGURATION &amp; DATA GOVERNANCE
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
            Mathematical SLA Cadence &bull; Quota Telemetry &bull; Universal Cascading Purge
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>System Settings &amp; Governance</h1>
        <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
          Calibrate cadence decay equations, decision-maker multipliers, and govern local IndexedDB storage.
        </p>
      </div>

      {/* Cadence SLAs Section */}
      <div className="card animate-fade-in-up" style={{ padding: 24, borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Clock size={20} style={{ color: 'var(--np-accent)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Cadence SLA Thresholds (Days)</h2>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', marginBottom: 20 }}>
          Maximum allowable days between touchpoints before the relationship is flagged as decaying.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {/* Priority Tier */}
          <div style={{ padding: 16, background: 'var(--np-bg-secondary)', borderRadius: 12, border: '1px solid var(--np-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="badge badge-priority" style={{ fontSize: '0.75rem' }}>Priority Tier</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--np-danger)' }}>
                {settings.cadence_priority_days || 14}d
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--np-text-secondary)', marginBottom: 12 }}>
              High-value partners, key clients, and core advisors.
            </p>
            <input
              type="range"
              min={3}
              max={60}
              step={1}
              value={settings.cadence_priority_days || 14}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  cadence_priority_days: Number(e.target.value),
                }))
              }
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Warm Tier */}
          <div style={{ padding: 16, background: 'var(--np-bg-secondary)', borderRadius: 12, border: '1px solid var(--np-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="badge badge-warm" style={{ fontSize: '0.75rem' }}>Warm Tier</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--np-warning)' }}>
                {settings.cadence_warm_days || 30}d
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--np-text-secondary)', marginBottom: 12 }}>
              Active collaborators and respected industry peers.
            </p>
            <input
              type="range"
              min={14}
              max={90}
              step={1}
              value={settings.cadence_warm_days || 30}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  cadence_warm_days: Number(e.target.value),
                }))
              }
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          {/* Cold Tier */}
          <div style={{ padding: 16, background: 'var(--np-bg-secondary)', borderRadius: 12, border: '1px solid var(--np-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="badge badge-cold" style={{ fontSize: '0.75rem' }}>Cold Tier</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--np-text-tertiary)' }}>
                {settings.cadence_cold_days || 90}d
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--np-text-secondary)', marginBottom: 12 }}>
              Broad network and casual acquaintances.
            </p>
            <input
              type="range"
              min={30}
              max={180}
              step={5}
              value={settings.cadence_cold_days || 90}
              onChange={e =>
                setSettings(prev => ({
                  ...prev,
                  cadence_cold_days: Number(e.target.value),
                }))
              }
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Scoring Weights */}
      <div className="card animate-fade-in-up" style={{ padding: 24, borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Sliders size={20} style={{ color: 'var(--np-accent)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Mathematical Urgency Weighting</h2>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', marginBottom: 20 }}>
          Adjust formula components for priority score calculation (0 - 100).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ padding: 14, background: 'var(--np-bg-secondary)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 700 }}>
              <span>Recency Urgency</span>
              <span style={{ color: '#4f46e5' }}>{settings.scoring_weights?.recency_weight || 35}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={70}
              step={5}
              value={settings.scoring_weights?.recency_weight || 35}
              onChange={e => updateWeight('recency_weight', Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          <div style={{ padding: 14, background: 'var(--np-bg-secondary)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 700 }}>
              <span>Relationship Tier</span>
              <span style={{ color: '#4f46e5' }}>{settings.scoring_weights?.tier_weight || 25}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={settings.scoring_weights?.tier_weight || 25}
              onChange={e => updateWeight('tier_weight', Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          <div style={{ padding: 14, background: 'var(--np-bg-secondary)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 700 }}>
              <span>Title Seniority</span>
              <span style={{ color: '#4f46e5' }}>{settings.scoring_weights?.title_weight || 20}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={settings.scoring_weights?.title_weight || 20}
              onChange={e => updateWeight('title_weight', Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          <div style={{ padding: 14, background: 'var(--np-bg-secondary)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 700 }}>
              <span>Engagement Rate</span>
              <span style={{ color: '#4f46e5' }}>{settings.scoring_weights?.engagement_weight || 20}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={settings.scoring_weights?.engagement_weight || 20}
              onChange={e => updateWeight('engagement_weight', Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Target Companies & Titles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="card animate-fade-in-up" style={{ padding: 20, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Building2 size={18} style={{ color: 'var(--np-accent)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Target Organizations</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--np-text-secondary)', marginBottom: 12 }}>
            Contacts at these companies receive priority scoring boosts.
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              className="form-input"
              value={newCompany}
              onChange={e => setNewCompany(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCompany()}
              placeholder="e.g. OpenAI, DeepMind, Stripe"
              style={{ flex: 1, fontSize: '0.84rem' }}
            />
            <button onClick={addCompany} className="btn btn-secondary btn-sm" disabled={!newCompany.trim()}>
              <Plus size={14} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(settings.target_companies || []).map((company, index) => (
              <span
                key={company}
                className="badge"
                style={{
                  background: 'var(--np-bg-secondary)',
                  border: '1px solid var(--np-border)',
                  fontSize: '0.78rem',
                  padding: '5px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {company}
                <button
                  type="button"
                  onClick={() => removeCompany(index)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--np-text-tertiary)' }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="card animate-fade-in-up" style={{ padding: 20, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Briefcase size={18} style={{ color: 'var(--np-accent)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Target Executive Titles</h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--np-text-secondary)', marginBottom: 12 }}>
            Key decision-maker titles receiving urgency weighting.
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <input
              className="form-input"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTitle()}
              placeholder="e.g. Founder, CEO, Partner, VP"
              style={{ flex: 1, fontSize: '0.84rem' }}
            />
            <button onClick={addTitle} className="btn btn-secondary btn-sm" disabled={!newTitle.trim()}>
              <Plus size={14} /> Add
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(settings.target_titles || []).map((title, index) => (
              <span
                key={title}
                className="badge"
                style={{
                  background: 'var(--np-bg-secondary)',
                  border: '1px solid var(--np-border)',
                  fontSize: '0.78rem',
                  padding: '5px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {title}
                <button
                  type="button"
                  onClick={() => removeTitle(index)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--np-text-tertiary)' }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ENTERPRISE DATA GOVERNANCE & STORAGE STUDIO */}
      <div className="card animate-fade-in-up" style={{ padding: 24, borderRadius: 16, marginBottom: 24, border: '1px solid rgba(99, 102, 241, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HardDrive size={20} style={{ color: 'var(--np-accent)' }} />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Enterprise Data Governance &amp; Storage Studio</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--np-text-secondary)', margin: 0 }}>
                Live storage quota telemetry, full database snapshot export, and universal cascading purge controls.
              </p>
            </div>
          </div>

          <button
            onClick={handleRestoreBenchmark}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <RotateCcw size={13} /> Restore Benchmark Seeds
          </button>
        </div>

        {/* Live Storage Telemetry Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div style={{ padding: 12, background: 'var(--np-bg-secondary)', borderRadius: 10, border: '1px solid var(--np-border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', fontWeight: 700 }}>CONTACTS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--np-text-primary)' }}>{telemetry?.contactsCount ?? '—'}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--np-bg-secondary)', borderRadius: 10, border: '1px solid var(--np-border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', fontWeight: 700 }}>INTERACTIONS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--np-info)' }}>{telemetry?.interactionsCount ?? '—'}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--np-bg-secondary)', borderRadius: 10, border: '1px solid var(--np-border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', fontWeight: 700 }}>RELATIONSHIPS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8b5cf6' }}>{telemetry?.relationshipsCount ?? '—'}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--np-bg-secondary)', borderRadius: 10, border: '1px solid var(--np-border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', fontWeight: 700 }}>VIRTUALITY LINKS</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#06b6d4' }}>{telemetry?.virtualityLinksCount ?? '—'}</div>
          </div>
          <div style={{ padding: 12, background: 'var(--np-bg-secondary)', borderRadius: 10, border: '1px solid var(--np-border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', fontWeight: 700 }}>ESTIMATED SIZE</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {telemetry ? `${(telemetry.estimatedBytes / 1024).toFixed(1)} KB` : '—'}
            </div>
          </div>
        </div>

        {/* Export Action Strip */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <FileJson size={14} color="#6366f1" /> Export JSON Snapshot Backup
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <FileSpreadsheet size={14} color="#10b981" /> Export Contacts (CSV)
          </button>
        </div>

        {/* Universal Cascading Purge Danger Zone */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#ef4444' }}>
            <ShieldAlert size={16} />
            <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: 0 }}>Universal Cascading Purge Zone</h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', marginBottom: 12 }}>
            Permanently wipes all contacts, interaction audit history, and relationship corridors. To execute, type the exact phrase{' '}
            <code style={{ color: '#ef4444', fontWeight: 700 }}>PURGE NETPULSE STORE</code> below:
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={purgePhrase}
              onChange={e => setPurgePhrase(e.target.value)}
              placeholder="Type PURGE NETPULSE STORE"
              className="form-input"
              style={{ flex: 1, minWidth: 240, fontSize: '0.82rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            />
            <button
              onClick={handleUniversalPurge}
              disabled={purgePhrase.trim() !== 'PURGE NETPULSE STORE' || isPurging}
              className="btn btn-sm"
              style={{
                background: purgePhrase.trim() === 'PURGE NETPULSE STORE' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)',
                color: '#ffffff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: purgePhrase.trim() === 'PURGE NETPULSE STORE' ? 'pointer' : 'not-allowed',
              }}
            >
              <Trash2 size={13} /> {isPurging ? 'Purging...' : 'Execute Universal Purge'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <button
          onClick={resetToDefaultFormulas}
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--np-text-tertiary)' }}
        >
          <RotateCcw size={14} /> Reset Formulas to Defaults
        </button>

        <button
          onClick={saveSettings}
          className="btn btn-primary"
          disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', fontWeight: 700 }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
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