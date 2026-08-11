'use client';

// ═══════════════════════════════════════════════════════
// Settings Page
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
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { UserSettings, ScoringWeights } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<UserSettings>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings(data);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    setSettings(prev => ({
      ...prev,
      scoring_weights: {
        ...DEFAULT_SETTINGS.scoring_weights,
        ...prev.scoring_weights,
        [key]: value,
      },
    }));
  };

  const addCompany = () => {
    if (!newCompany.trim()) return;
    setSettings(prev => ({
      ...prev,
      target_companies: [...(prev.target_companies || []), newCompany.trim()],
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
    setSettings(prev => ({
      ...prev,
      target_titles: [...(prev.target_titles || []), newTitle.trim()],
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      scoring_weights: settings.scoring_weights,
      digest_count: settings.digest_count,
      digest_email_time: settings.digest_email_time,
      digest_email_enabled: settings.digest_email_enabled,
      cadence_priority_days: settings.cadence_priority_days,
      cadence_warm_days: settings.cadence_warm_days,
      cadence_cold_days: settings.cadence_cold_days,
      target_companies: settings.target_companies,
      target_titles: settings.target_titles,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_settings')
      .upsert(payload, { onConflict: 'user_id' });

    if (!error) {
      showToast('Settings saved');
    }
    setSaving(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--np-radius)' }} />
      </div>
    );
  }

  const weights = settings.scoring_weights || DEFAULT_SETTINGS.scoring_weights;

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1>Settings</h1>
        <p>Configure your priority scoring, cadence targets, and digest preferences</p>
      </div>

      {/* Priority Scoring Weights */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={18} style={{ color: 'var(--np-accent)' }} />
            Priority Scoring Weights
          </h3>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
            Adjust how much each factor influences your daily digest ranking
          </p>

          {[
            { key: 'recency_weight' as keyof ScoringWeights, label: 'Recency', desc: 'How long since last contact' },
            { key: 'tier_weight' as keyof ScoringWeights, label: 'Relationship Tier', desc: 'Priority > Warm > Cold' },
            { key: 'title_weight' as keyof ScoringWeights, label: 'Role/Title', desc: 'Decision-maker titles score higher' },
            { key: 'engagement_weight' as keyof ScoringWeights, label: 'Engagement History', desc: 'Past interaction frequency' },
          ].map(({ key, label, desc }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{label}</span>
                  <span style={{ color: 'var(--np-text-tertiary)', fontSize: '0.8125rem', marginLeft: 8 }}>{desc}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--np-accent)', minWidth: 30, textAlign: 'right' }}>
                  {weights[key]}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights[key]}
                onChange={e => updateWeight(key, parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--np-accent)' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Cadence Settings */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} style={{ color: 'var(--np-accent)' }} />
            Contact Cadence
          </h3>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
            How often you want to reach out to contacts in each tier
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Priority (days)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="30"
                value={settings.cadence_priority_days || 3}
                onChange={e => setSettings({ ...settings, cadence_priority_days: parseInt(e.target.value) || 3 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Warm (days)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="180"
                value={settings.cadence_warm_days || 30}
                onChange={e => setSettings({ ...settings, cadence_warm_days: parseInt(e.target.value) || 30 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cold (days)</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max="365"
                value={settings.cadence_cold_days || 90}
                onChange={e => setSettings({ ...settings, cadence_cold_days: parseInt(e.target.value) || 90 })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Digest Settings */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Digest Preferences</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Contacts per digest</label>
              <input
                type="number"
                className="form-input"
                min="5"
                max="25"
                value={settings.digest_count || 12}
                onChange={e => setSettings({ ...settings, digest_count: parseInt(e.target.value) || 12 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email digest time</label>
              <input
                type="time"
                className="form-input"
                value={settings.digest_email_time || '08:00'}
                onChange={e => setSettings({ ...settings, digest_email_time: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Target Companies */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} style={{ color: 'var(--np-accent)' }} />
            Target Companies
          </h3>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
            Contacts at these companies get a scoring bonus
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {(settings.target_companies || []).map((company, i) => (
              <span key={i} className="badge badge-priority" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px' }}>
                {company}
                <button onClick={() => removeCompany(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              value={newCompany}
              onChange={e => setNewCompany(e.target.value)}
              placeholder="Add a company..."
              onKeyDown={e => e.key === 'Enter' && addCompany()}
              style={{ maxWidth: 300 }}
            />
            <button onClick={addCompany} className="btn btn-secondary btn-sm">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Target Titles */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={18} style={{ color: 'var(--np-accent)' }} />
            Target Titles
          </h3>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
            Contacts with these titles get a scoring bonus
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {(settings.target_titles || []).map((title, i) => (
              <span key={i} className="badge badge-priority" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px' }}>
                {title}
                <button onClick={() => removeTitle(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Add a title..."
              onKeyDown={e => e.key === 'Enter' && addTitle()}
              style={{ maxWidth: 300 }}
            />
            <button onClick={addTitle} className="btn btn-secondary btn-sm">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button onClick={saveSettings} className="btn btn-primary btn-lg" disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={16} style={{ color: 'var(--np-success)' }} />
          {toast}
        </div>
      )}
    </div>
  );
}
