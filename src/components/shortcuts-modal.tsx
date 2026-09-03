'use client';

// ═══════════════════════════════════════════════════════
// Power Keyboard Shortcuts Cheat Sheet Modal
// Linear-grade keyboard navigation reference
// ═══════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { X, Command, Keyboard, Zap, Sparkles } from 'lucide-react';

export function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const SHORTCUTS = [
    {
      category: 'GLOBAL NAVIGATION',
      items: [
        { keys: ['Ctrl', 'K'], label: 'Global Omnibar & Contact Search' },
        { keys: ['?'], label: 'Open Keyboard Shortcuts Guide' },
        { keys: ['Esc'], label: 'Close Active Modal / Drawer' },
      ],
    },
    {
      category: 'HIGH-VELOCITY ACTIONS',
      items: [
        { keys: ['S'], label: 'Trigger 60-Second Morning Speed Run' },
        { keys: ['T'], label: 'Launch Time-Travel Decay Simulator' },
        { keys: ['P'], label: 'Open Imagine Cup Pitch Deck' },
      ],
    },
    {
      category: 'ROUTING QUICK JUMPS',
      items: [
        { keys: ['G', 'D'], label: 'Go to Daily Digest' },
        { keys: ['G', 'P'], label: 'Go to Pipeline Kanban' },
        { keys: ['G', 'G'], label: 'Go to Network Topology Graph' },
        { keys: ['G', 'C'], label: 'Go to Contacts Directory' },
        { keys: ['G', 'R'], label: 'Go to Job Change Radar' },
      ],
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 580,
          backgroundColor: 'var(--np-bg-card)',
          borderRadius: 20,
          border: '1px solid var(--np-border)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: 'rgba(79, 70, 229, 0.15)',
                color: 'var(--np-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Keyboard size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.96rem', fontWeight: 800 }}>Keyboard Shortcuts</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--np-text-tertiary)' }}>
                Linear-grade speed navigation
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="btn-ghost"
            style={{ padding: 6, borderRadius: '50%' }}
            aria-label="Close shortcuts modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {SHORTCUTS.map(group => (
            <div key={group.category}>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--np-text-tertiary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                {group.category}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map(item => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 8,
                      backgroundColor: 'var(--np-bg-secondary)',
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', fontWeight: 500 }}>
                      {item.label}
                    </span>

                    <div style={{ display: 'flex', gap: 4 }}>
                      {item.keys.map(k => (
                        <kbd
                          key={k}
                          style={{
                            padding: '3px 7px',
                            backgroundColor: 'var(--np-bg-card)',
                            border: '1px solid var(--np-border)',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: 'var(--np-text-primary)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            fontSize: '0.74rem',
            color: 'var(--np-text-tertiary)',
            textAlign: 'center',
          }}
        >
          Press <kbd style={{ padding: '2px 5px', borderRadius: 4, background: 'var(--np-bg-card)', border: '1px solid var(--np-border)' }}>?</kbd> anytime to toggle this cheat sheet
        </div>
      </div>
    </div>
  );
}
