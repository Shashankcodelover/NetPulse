'use client';

// ═══════════════════════════════════════════════════════
// Dual-Persona Switcher & Handshake Monitor
// Seamless role-playing between Alex Mercer & Dr. Elena Rostova
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Sparkles, ChevronDown, ArrowRightLeft, ShieldCheck, Zap } from 'lucide-react';
import { netPulseStore, PERSONA_ALEX, PERSONA_ELENA, DEFAULT_PERSONAS } from '@/lib/storage/db';
import type { UserPersona, Relationship } from '@/lib/types';
import { soundFx } from '@/lib/sound';

interface PersonaSwitcherProps {
  compact?: boolean;
}

export function PersonaSwitcher({ compact = false }: PersonaSwitcherProps) {
  const [activePersona, setActivePersona] = useState<UserPersona>(PERSONA_ALEX);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingHandshakes, setPendingHandshakes] = useState<Relationship[]>([]);

  const refreshState = async () => {
    const current = netPulseStore.getActivePersona();
    setActivePersona(current);

    // Check for pending handshakes targeted at this persona
    const rels = await netPulseStore.getRelationships();
    const pending = rels.filter(
      r => r.status === 'pending_handshake' && r.target_user_id === current.id
    );
    setPendingHandshakes(pending);
  };

  useEffect(() => {
    refreshState();

    const handlePersonaSwitch = () => refreshState();
    const handleStateChange = () => refreshState();

    window.addEventListener('netpulse:persona-switched', handlePersonaSwitch);
    window.addEventListener('netpulse:state-changed', handleStateChange);

    return () => {
      window.removeEventListener('netpulse:persona-switched', handlePersonaSwitch);
      window.removeEventListener('netpulse:state-changed', handleStateChange);
    };
  }, []);

  const handleSwitch = (persona: UserPersona) => {
    if (persona.id === activePersona.id) {
      setIsOpen(false);
      return;
    }
    soundFx.playPersonaSwitchWhoosh();
    netPulseStore.setActivePersona(persona.id);
    setActivePersona(persona);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Active Persona Pill / Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: compact ? '6px 10px' : '9px 12px',
          borderRadius: '12px',
          background: 'var(--np-bg-card)',
          border: '1px solid var(--np-border)',
          boxShadow: 'var(--np-shadow-sm)',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="persona-switcher-btn"
        title="Switch user role & active identity"
      >
        {/* Avatar with Gradient */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '10px',
            background: activePersona.avatarGradient,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
            letterSpacing: '-0.02em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          {activePersona.initials}
          <span
            style={{
              position: 'absolute',
              bottom: -1,
              right: -1,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#10B981',
              border: '2px solid var(--np-bg-card)',
            }}
          />
        </div>

        {/* Text Info */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--np-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activePersona.name}
            </span>
            {pendingHandshakes.length > 0 && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: 10,
                  background: '#EF4444',
                  color: '#FFFFFF',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                {pendingHandshakes.length}
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              color: 'var(--np-text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activePersona.networkRole} • {activePersona.company.split(' ')[0]}
          </div>
        </div>

        <ChevronDown
          size={14}
          style={{
            color: 'var(--np-text-tertiary)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 998,
              }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                background: 'var(--np-bg-card)',
                border: '1px solid var(--np-border)',
                borderRadius: '14px',
                boxShadow: 'var(--np-shadow-lg)',
                padding: '10px',
                zIndex: 999,
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 800,
                  color: 'var(--np-text-tertiary)',
                  padding: '4px 8px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Select User Identity</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--np-accent)' }}>
                  <ArrowRightLeft size={10} /> 2-User Role Play
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DEFAULT_PERSONAS.map(persona => {
                  const isCurrent = persona.id === activePersona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => handleSwitch(persona)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: isCurrent ? 'var(--np-bg-active)' : 'transparent',
                        border: isCurrent ? '1px solid var(--np-accent)' : '1px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isCurrent) e.currentTarget.style.background = 'var(--np-bg-hover)';
                      }}
                      onMouseLeave={e => {
                        if (!isCurrent) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '8px',
                          background: persona.avatarGradient,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          flexShrink: 0,
                        }}
                      >
                        {persona.initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: 'var(--np-text-primary)',
                            }}
                          >
                            {persona.name}
                          </span>
                          {isCurrent && (
                            <span
                              style={{
                                fontSize: '0.62rem',
                                color: 'var(--np-accent)',
                                fontWeight: 800,
                                background: 'rgba(99, 102, 241, 0.15)',
                                padding: '1px 5px',
                                borderRadius: 4,
                              }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--np-text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {persona.title} • {persona.company}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {pendingHandshakes.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: '0.72rem',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Sparkles size={13} />
                  <span>
                    <strong>{pendingHandshakes.length}</strong> connection handshake pending acceptance in Virtuality Studio.
                  </span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
