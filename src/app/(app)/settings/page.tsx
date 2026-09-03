'use client';

// ═══════════════════════════════════════════════════════
// NetPulse — Cadence SLA & Relationship Scoring Settings
// Reactive local write-ahead storage with cloud fallback.
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
} from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';
import type { UserSettings, ScoringWeights } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';

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

  useEffect(() => {
    async function load() {
      const data = await netPulseStore.getSettings();
      setSettings(data);
      setLoading(false);
    }
    load();
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
    showToast('Reset configuration to default mathematical baseline');
  };

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 880 }}>
        <div className="skeleton" style={{ height: 180, borderRadius: 16, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 260, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="page-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
            ENGINE CONFIGURATION
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
            Real-Time SLA Cadences &bull; Algorithmic Urgency Weights
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>System Settings</h1>
        <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
          Calibrate cadence thresholds, seniority priorities, and mathematical decay curves
        </p>
      </div>

      {/* Cadence Intervals Card */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20, padding: 22, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Clock size={20} style={{ color: 'var(--np-accent)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Cadence SLA Thresholds</h2>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', marginTop: -8, marginBottom: 20 }}>
          Define maximum inactive days before relationships trigger Cadence Watchdog warnings.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {/* Priority Tier SLA */}
          <div style={{ padding: 16, background: 'var(--np-bg-secondary)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Priority Tier SLA</span>
              <span className="badge badge-priority" style={{ fontSize: '0.72rem' }}>
                {settings.cadence_priority_days} Days
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={settings.cadence_priority_days}
              onChange={e => setSettings({ ...settings, cadence_priority_days: Number(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--np-text-tertiary)', marginTop: 4 }}>
              <span>3 days (Hyper-active)</span>
              <span>30 days</span>
            </div>
          </div>

          {/* Warm Tier SLA */}
          <div style={{ padding: 16, background: 'var(--np-bg-secondary)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Warm Tier SLA</span>
              <span className="badge badge-warm" style={{ fontSize: '0.72rem' }}>
                {settings.cadence_warm_days} Days
              </span>
            </div>
            <input
              type="range"
              min={14}
              max={90}
              step={1}
              value={settings.cadence_warm_days}
              onChange={e => setSettings({ ...settings, cadence_warm_days: Number(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--np-text-tertiary)', marginTop: 4 }}>
              <span>14 days</span>
              <span>90 days (Quarterly)</span>
            </div>
          </div>

          {/* Cold Tier SLA */}
          <div style={{ padding: 16, background: 'var(--np-bg-secondary)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Cold Tier SLA</span>
              <span className="badge badge-cold" style={{ fontSize: '0.72rem' }}>
                {settings.cadence_cold_days} Days
              </span>
            </div>
            <input
              type="range"
              min={30}
              max={180}
              step={5}
              value={settings.cadence_cold_days}
              onChange={e => setSettings({ ...settings, cadence_cold_days: Number(e.target.value) })}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--np-text-tertiary)', marginTop: 4 }}>
              <span>30 days</span>
              <span>180 days (Semi-annual)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Scoring Weights Card */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20, padding: 22, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Sliders size={20} style={{ color: 'var(--np-accent)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Decay Scoring Weights</h2>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', marginTop: -8, marginBottom: 20 }}>
          Adjust the relative mathematical weights powering the deterministic priority formula.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {/* Recency Decay Weight */}
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

          {/* Tier Multiplier */}
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

          {/* Title Seniority */}
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

          {/* Engagement Frequency */}
          <div style={{ padding: 14, background: 'var(--np-bg-secondary)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', fontWeight: 700 }}>
              <span>Engagement Frequency</span>
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
        {/* Target Companies */}
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

        {/* Target Seniority Titles */}
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

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <button
          onClick={resetToDefaultFormulas}
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--np-text-tertiary)' }}
        >
          <RotateCcw size={14} /> Reset to Defaults
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
