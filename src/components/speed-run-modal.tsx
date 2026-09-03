'use client';

// ═══════════════════════════════════════════════════════
// "Morning Speed Run" 60-Second Batch Outreach Engine
// High-velocity distraction-free power mode for daily relationships
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  Zap,
  X,
  CheckCircle2,
  Copy,
  MessageSquare,
  Calendar,
  ArrowRight,
  Sparkles,
  Trophy,
  RotateCcw,
  Building2,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { netPulseStore } from '@/lib/storage/db';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { generateGoogleCalendarUrl } from '@/lib/calendar';
import type { DigestContact } from '@/lib/types';

interface SpeedRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: DigestContact[];
  onCompletedAll?: () => void;
}

export function SpeedRunModal({ isOpen, onClose, contacts, onCompletedAll }: SpeedRunModalProps) {
  const [queue, setQueue] = useState<DigestContact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQueue(contacts.slice(0, 5));
      setCurrentIndex(0);
      setCompletedCount(0);
      setIsFinished(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeQueue = queue.length > 0 ? queue : contacts.slice(0, 5);
  const currentContact = activeQueue[currentIndex];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDoneAndNext = async () => {
    if (!currentContact) return;

    await netPulseStore.markContacted(currentContact.id);
    const nextCount = completedCount + 1;
    setCompletedCount(nextCount);

    if (currentIndex + 1 < activeQueue.length) {
      setCurrentIndex(prev => prev + 1);
      setCopied(false);
    } else {
      setIsFinished(true);
      if (onCompletedAll) onCompletedAll();
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setCompletedCount(0);
    setIsFinished(false);
  };

  const firstName = currentContact ? currentContact.full_name.split(' ')[0] : 'there';
  const icebreakerText = currentContact
    ? `Hi ${firstName}! Hope your week is off to a great start. Was thinking about your team's work at ${currentContact.company || 'your organization'}—would love to catch up for 15 mins sometime soon!`
    : '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 3500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: 640,
          backgroundColor: 'var(--np-bg-card)',
          borderRadius: 20,
          boxShadow: '0 25px 70px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          border: '1px solid var(--np-border)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {!isFinished && currentContact ? (
          <>
            {/* Header / Stepper */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--np-border)',
                background: 'var(--np-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-priority" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={12} /> SPEED RUN MODE
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--np-text-secondary)' }}>
                  Contact {currentIndex + 1} of {activeQueue.length}
                </span>
              </div>

              <button onClick={onClose} aria-label="Close speed run modal" className="btn-ghost" style={{ padding: 6, borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{ height: 4, width: '100%', backgroundColor: 'var(--np-bg-tertiary)' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((currentIndex + 1) / activeQueue.length) * 100}%`,
                  backgroundColor: 'var(--np-accent)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* Contact Hero */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{currentContact.full_name}</h2>
                    <span className={`badge badge-${currentContact.relationship_tier}`}>
                      {currentContact.relationship_tier.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--np-text-secondary)', marginTop: 4 }}>
                    {currentContact.title} &bull; {currentContact.company}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: (currentContact.priority_score?.score ?? 0) >= 80 ? '#ef4444' : '#f59e0b' }}>
                    {currentContact.priority_score?.score ?? 0}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--np-text-tertiary)' }}>Decay Score</div>
                </div>
              </div>

              {/* Status Banner */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  backgroundColor: 'var(--np-bg-secondary)',
                  border: '1px solid var(--np-border)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8rem',
                  color: currentContact.is_overdue ? '#ef4444' : 'var(--np-text-secondary)',
                }}
              >
                <Clock size={14} />
                <span>{currentContact.suggested_reason}</span>
              </div>

              {/* AI Suggested Opener */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
                    Suggested Contextual Opener
                  </label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--np-accent)', fontWeight: 600 }}>
                    1-Click Ready
                  </span>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--np-border)',
                    backgroundColor: 'var(--np-bg-card)',
                    fontSize: '0.88rem',
                    color: 'var(--np-text-primary)',
                    lineHeight: 1.5,
                  }}
                >
                  {icebreakerText}
                </div>
              </div>

              {/* Multi-Channel Outreach Actions */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleCopy(icebreakerText)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: 1 }}
                >
                  <Copy size={14} /> {copied ? 'Copied!' : 'Copy Opener'}
                </button>

                <a
                  href={generateWhatsAppUrl({ contact: currentContact, customMessage: icebreakerText })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: 1, color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                >
                  <MessageSquare size={14} /> Open WhatsApp
                </a>

                <a
                  href={generateGoogleCalendarUrl({ contact: currentContact, agendaTopic: `Catch-up with ${currentContact.full_name}` })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: 1 }}
                >
                  <Calendar size={14} /> Schedule
                </a>
              </div>

              {/* Advance Button */}
              <button
                onClick={handleDoneAndNext}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle2 size={16} /> Mark Contacted &amp; Advance ({currentIndex + 1}/{activeQueue.length}) &rarr;
              </button>
            </div>
          </>
        ) : (
          /* Completion Screen */
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Trophy size={32} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              Power Hour Completed!
            </h2>
            <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.92rem', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              You&apos;ve cleared <strong>{completedCount} high-priority relationship SLAs</strong> in under 60 seconds.
              Urgency clocks have been reset across your managed network.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={14} /> Run Again
              </button>
              <button onClick={onClose} className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                Return to Daily Digest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
