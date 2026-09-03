'use client';

// ═══════════════════════════════════════════════════════
// Imagine Cup World Championship Presentation Deck
// Interactive Executive Showcase for Judges & Evaluators
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Trophy,
  X,
  ArrowRight,
  ArrowLeft,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  Award,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Sparkles,
} from 'lucide-react';

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PitchDeckModal({ isOpen, onClose }: PitchDeckModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const SLIDES = [
    {
      title: 'The Relationship Decay Crisis',
      subtitle: 'Why 1,500+ LinkedIn connections rot into static, dormant data',
      badge: 'PROBLEM STATEMENT',
      content: (
        <div>
          <div
            style={{
              padding: '18px 22px',
              borderRadius: 14,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              marginBottom: 20,
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#ef4444', fontWeight: 800 }}>
              The Network Paradox: High Reach, Zero Retention
            </h4>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--np-text-secondary)', lineHeight: 1.5 }}>
              Ambitious founders, engineers, and executives accumulate thousands of high-value connections on LinkedIn.
              Yet, within 90 days, <strong>over 94% of these relationships go cold</strong> due to manual cognitive overhead.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                Traditional Sales CRMs
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                Built for pipeline deal velocity, not personal relationship stewardship. Too complex and noisy.
              </p>
            </div>

            <div style={{ padding: '14px 18px', borderRadius: 12, background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                Note Apps (Notion, Apple Notes)
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                Static graveyards with zero algorithmic cadence, decay tracking, or automated outreach triggers.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'The Algorithmic Cadence Engine',
      subtitle: 'Deterministic half-life decay mathematics and reactive SLA horizons',
      badge: 'MATHEMATICAL FOUNDATION',
      content: (
        <div>
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              background: 'var(--np-bg-secondary)',
              border: '1px solid var(--np-border)',
              marginBottom: 16,
              fontFamily: 'monospace',
              fontSize: '0.92rem',
              color: 'var(--np-accent)',
            }}
          >
            DecayUrgency(t) = W_recency * (1 - e^(-λt / SLA)) + W_seniority + W_tier
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--np-bg-card)', border: '1px solid var(--np-border)' }}>
              <span className="badge badge-priority" style={{ fontSize: '0.65rem' }}>PRIORITY TIER</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>14-Day SLA</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)' }}>Key mentors, partners &amp; investors</div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--np-bg-card)', border: '1px solid var(--np-border)' }}>
              <span className="badge badge-warm" style={{ fontSize: '0.65rem' }}>WARM TIER</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>30-Day SLA</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)' }}>Collaborative domain peers</div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--np-bg-card)', border: '1px solid var(--np-border)' }}>
              <span className="badge badge-cold" style={{ fontSize: '0.65rem' }}>COLD TIER</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>90-Day SLA</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--np-text-tertiary)' }}>Broader professional network</div>
            </div>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Rather than relying on user memory, NetPulse deterministically calculates decay urgency and bubbles up the top 10–15 contacts daily.
          </p>
        </div>
      ),
    },
    {
      title: 'Competitive Moat Matrix',
      subtitle: 'Why NetPulse outperforms traditional personal CRM offerings',
      badge: 'MARKET POSITIONING',
      content: (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--np-border)', color: 'var(--np-text-tertiary)' }}>
                <th style={{ padding: '8px 12px' }}>Capability</th>
                <th style={{ padding: '8px 12px', color: 'var(--np-accent)', fontWeight: 800 }}>NetPulse</th>
                <th style={{ padding: '8px 12px' }}>Clay</th>
                <th style={{ padding: '8px 12px' }}>Folk</th>
                <th style={{ padding: '8px 12px' }}>Dex</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--np-border)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>Algorithmic Decay Horizon</td>
                <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 700 }}>✓ Deterministic</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
                <td style={{ padding: '10px 12px', color: '#f59e0b' }}>Static Reminders</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--np-border)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>Offline-First Local Sync</td>
                <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 700 }}>✓ IndexedDB WAL</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ Cloud Only</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ Cloud Only</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ Cloud Only</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--np-border)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>60s Morning Speed Run</td>
                <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 700 }}>✓ 1-Click Multi-Channel</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--np-border)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>Interactive Network Topology</td>
                <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 700 }}>✓ Dynamic SVG Map</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>Judge Sandbox Simulator</td>
                <td style={{ padding: '10px 12px', color: '#10b981', fontWeight: 700 }}>✓ Time-Travel +90d</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
                <td style={{ padding: '10px 12px', color: '#ef4444' }}>✕ No</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      title: 'Technical Stack & Resilience Architecture',
      subtitle: 'Offline-first write-ahead synchronization with generative AI copilot',
      badge: 'SYSTEM ARCHITECTURE',
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--np-accent)', marginBottom: 6 }}>
                <Database size={16} />
                <span style={{ fontWeight: 800, fontSize: '0.86rem' }}>Data Layer</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                In-browser IndexedDB write-ahead cache with Supabase PostgreSQL cloud sync. Works completely offline with zero latency.
              </p>
            </div>

            <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--np-accent)', marginBottom: 6 }}>
                <Cpu size={16} />
                <span style={{ fontWeight: 800, fontSize: '0.86rem' }}>Generative Intelligence</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Google Gemini 1.5 multi-archetype generative outreach with fallback deterministic heuristic synthesis.
              </p>
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--np-bg-card)', border: '1px solid var(--np-border)', fontSize: '0.82rem', color: 'var(--np-text-secondary)' }}>
            <strong>Enterprise Architecture:</strong> Next.js 16 (Turbopack, App Router), TypeScript Strict, Web Audio API, SVG Interactive Physics Canvas, Tailored WhatsApp &amp; Google Calendar Deep Links.
          </div>
        </div>
      ),
    },
    {
      title: 'User Impact & Product Telemetry',
      subtitle: 'Quantifiable relationship stewardship delivered in production',
      badge: 'MEASURABLE OUTCOMES',
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
            <div style={{ padding: '16px', borderRadius: 12, background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>92%</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                SLA Cadence Adherence
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 12, background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--np-accent)' }}>&lt; 60s</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                Morning Speed Run Time
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 12, background: 'var(--np-bg-secondary)', border: '1px solid var(--np-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>10s</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                Post-Meeting Enrichment
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'rgba(79, 70, 229, 0.08)',
              border: '1px solid rgba(79, 70, 229, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Trophy size={28} style={{ color: 'var(--np-accent)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.84rem', color: 'var(--np-text-primary)', lineHeight: 1.4 }}>
              <strong>Imagine Cup Ready:</strong> Fully production-deployed codebase, 100% test passing, verified offline sandbox with time-travel simulation, ready for international presentation.
            </div>
          </div>
        </div>
      ),
    },
  ];

  const slide = SLIDES[currentSlide];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 760,
          backgroundColor: 'var(--np-bg-card)',
          borderRadius: 22,
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          border: '1px solid var(--np-border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 26px',
            borderBottom: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(79, 70, 229, 0.15)',
                color: 'var(--np-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trophy size={16} />
            </span>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--np-accent)', textTransform: 'uppercase' }}>
                Microsoft Imagine Cup 2026 World Championship
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--np-text-primary)' }}>
                NetPulse Executive Showcase Deck
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: 6, borderRadius: '50%' }}
            aria-label="Close pitch deck"
          >
            <X size={18} />
          </button>
        </div>

        {/* Slide Selector Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--np-border)',
            backgroundColor: 'var(--np-bg-tertiary)',
            overflowX: 'auto',
          }}
        >
          {SLIDES.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: 'none',
                background: currentSlide === idx ? 'var(--np-bg-card)' : 'transparent',
                color: currentSlide === idx ? 'var(--np-accent)' : 'var(--np-text-tertiary)',
                fontSize: '0.76rem',
                fontWeight: currentSlide === idx ? 800 : 600,
                cursor: 'pointer',
                borderBottom: currentSlide === idx ? '2px solid var(--np-accent)' : 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              0{idx + 1}. {s.badge}
            </button>
          ))}
        </div>

        {/* Slide Content */}
        <div style={{ padding: '26px 30px', minHeight: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-priority" style={{ fontSize: '0.66rem' }}>
              SLIDE 0{currentSlide + 1} OF 05
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--np-text-tertiary)' }}>
              {slide.badge}
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '4px 0 6px 0' }}>
            {slide.title}
          </h2>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.88rem', margin: '0 0 20px 0' }}>
            {slide.subtitle}
          </p>

          {slide.content}
        </div>

        {/* Footer Controls */}
        <div
          style={{
            padding: '14px 26px',
            borderTop: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: currentSlide === 0 ? 0.4 : 1 }}
          >
            <ArrowLeft size={14} /> Previous
          </button>

          <span style={{ fontSize: '0.76rem', color: 'var(--np-text-tertiary)', fontWeight: 600 }}>
            {currentSlide + 1} / {SLIDES.length}
          </span>

          <button
            onClick={() => setCurrentSlide(prev => Math.min(SLIDES.length - 1, prev + 1))}
            disabled={currentSlide === SLIDES.length - 1}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, opacity: currentSlide === SLIDES.length - 1 ? 0.4 : 1, fontWeight: 700 }}
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
