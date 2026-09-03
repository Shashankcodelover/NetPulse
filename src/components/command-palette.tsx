'use client';

// ═══════════════════════════════════════════════════════
// Global Command Palette (Ctrl + K / Cmd + K)
// Linear / Raycast style keyboard-first navigation & actions
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Zap,
  Kanban,
  Users,
  Inbox,
  Upload,
  Settings,
  Sparkles,
  Compass,
  RotateCcw,
  Clock,
  FileText,
  Sun,
  Moon,
  ArrowRight,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { netPulseStore } from '@/lib/storage/db';
import { useTheme } from '@/components/theme-provider';
import type { Contact } from '@/lib/types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      netPulseStore.getContacts().then(setContacts);
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent('netpulse:open-command-palette'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Navigation commands
  const pageCommands = [
    { label: 'Daily Digest', path: '/', icon: Zap, category: 'Pages' },
    { label: 'Pipeline Kanban', path: '/pipeline', icon: Kanban, category: 'Pages' },
    { label: 'Contacts Directory', path: '/contacts', icon: Users, category: 'Pages' },
    { label: 'Job Change Radar', path: '/radar', icon: Compass, category: 'Pages' },
    { label: 'New-Connection Triage', path: '/triage', icon: Sparkles, category: 'Pages' },
    { label: 'AI Relationship Inbox', path: '/inbox', icon: Inbox, category: 'Pages' },
    { label: 'Import Connections', path: '/import', icon: Upload, category: 'Pages' },
    { label: 'Cadence SLA Settings', path: '/settings', icon: Settings, category: 'Pages' },
  ].filter(cmd => !q || cmd.label.toLowerCase().includes(q));

  // Matched contacts
  const matchedContacts = contacts.filter(c =>
    !q ||
    c.full_name.toLowerCase().includes(q) ||
    (c.company && c.company.toLowerCase().includes(q)) ||
    (c.title && c.title.toLowerCase().includes(q))
  ).slice(0, 5);

  // Quick actions
  const actionCommands = [
    {
      id: 'fast-forward',
      label: 'Simulate +30 Days Relationship Decay',
      icon: Clock,
      action: async () => {
        await netPulseStore.setDecayOffsetDays(30);
        onClose();
      },
      category: 'Actions',
    },
    {
      id: 'reset-decay',
      label: 'Reset Decay Horizon to Baseline Today',
      icon: RotateCcw,
      action: async () => {
        await netPulseStore.setDecayOffsetDays(0);
        onClose();
      },
      category: 'Actions',
    },
    {
      id: 'toggle-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      },
      category: 'Actions',
    },
  ].filter(act => !q || act.label.toLowerCase().includes(q));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={onClose}
    >
      <div
        className="card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: 'var(--np-bg-card)',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          border: '1px solid var(--np-border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            borderBottom: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
          }}
        >
          <Search size={18} style={{ color: 'var(--np-text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a contact name, company, page, or action..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--np-text-primary)',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          />
          <kbd
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '3px 6px',
              borderRadius: 6,
              background: 'var(--np-bg-tertiary)',
              color: 'var(--np-text-tertiary)',
              border: '1px solid var(--np-border)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {/* Contacts Section */}
          {matchedContacts.length > 0 && (
            <div>
              <div style={{ padding: '6px 18px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                Contacts ({matchedContacts.length})
              </div>
              {matchedContacts.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    router.push(`/contacts/${c.id}`);
                    onClose();
                  }}
                  className="command-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 18px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: 'var(--np-accent-light)',
                        color: 'var(--np-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {c.full_name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--np-text-primary)' }}>
                        {c.full_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--np-text-tertiary)' }}>
                        {c.title} &bull; {c.company}
                      </div>
                    </div>
                  </div>

                  <span className={`badge badge-${c.relationship_tier}`} style={{ fontSize: '0.64rem' }}>
                    {c.relationship_tier.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Section */}
          {pageCommands.length > 0 && (
            <div>
              <div style={{ padding: '8px 18px 6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                Navigation
              </div>
              {pageCommands.map(cmd => {
                const Icon = cmd.icon;
                return (
                  <div
                    key={cmd.path}
                    onClick={() => {
                      router.push(cmd.path);
                      onClose();
                    }}
                    className="command-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 18px',
                      cursor: 'pointer',
                      fontSize: '0.86rem',
                      fontWeight: 500,
                      color: 'var(--np-text-primary)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--np-text-secondary)' }} />
                    <span>{cmd.label}</span>
                    <ArrowRight size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions Section */}
          {actionCommands.length > 0 && (
            <div>
              <div style={{ padding: '8px 18px 6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                Executive Actions
              </div>
              {actionCommands.map(act => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    onClick={act.action}
                    className="command-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 18px',
                      cursor: 'pointer',
                      fontSize: '0.86rem',
                      fontWeight: 500,
                      color: 'var(--np-text-primary)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--np-accent)' }} />
                    <span>{act.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--np-border)',
            background: 'var(--np-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--np-text-tertiary)',
          }}
        >
          <span>Use <strong>&uarr; &darr;</strong> to navigate &bull; <strong>Enter</strong> to select</span>
          <span>Linear-grade Omnibar UX</span>
        </div>
      </div>
    </div>
  );
}
