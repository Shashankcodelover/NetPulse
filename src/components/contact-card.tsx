'use client';

// ═══════════════════════════════════════════════════════
// ContactCard — Animated CRM Contact Card
// Rich score ring, urgency heat, smooth hover actions
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Moon,
  Building2,
} from 'lucide-react';
import type { DigestContact } from '@/lib/types';
import { generateGoogleCalendarUrl } from '@/lib/calendar';
import { generateWhatsAppUrl } from '@/lib/whatsapp';

interface ContactCardProps {
  contact: DigestContact;
  isCompleted: boolean;
  onMarkContacted: (id: string) => void;
  onSnooze: (id: string, name: string) => void;
  index: number;
}

function getAvatarColor(name: string): string {
  const colors = ['#4F46E5','#7C3AED','#2563EB','#0891B2','#059669','#D97706','#DC2626','#DB2777','#9333EA','#4338CA'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getTierBadgeStyle(tier: string) {
  switch (tier) {
    case 'priority': return { background: 'var(--np-accent-light)', color: 'var(--np-accent)' };
    case 'warm': return { background: 'var(--np-warning-light)', color: 'var(--np-warning)' };
    case 'cold': return { background: 'var(--np-bg-tertiary)', color: 'var(--np-text-tertiary)' };
    default: return { background: 'var(--np-bg-tertiary)', color: 'var(--np-text-tertiary)' };
  }
}

export function ContactCard({ contact, isCompleted, onMarkContacted, onSnooze, index }: ContactCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const score = contact.priority_score?.score ?? 0;

  const scoreColor = score >= 80 ? '#EF4444' : score >= 60 ? '#F59E0B' : '#10B981';
  const urgencyClass = score >= 80 ? 'urgency-critical' : score >= 60 ? 'urgency-attention' : '';
  const glowClass = score >= 80 ? 'glow-red' : score >= 60 ? 'glow-amber' : '';

  // SVG ring
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const tierStyle = getTierBadgeStyle(contact.relationship_tier);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: -20, transition: { duration: 0.2 } }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.04, 0.4),
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`${urgencyClass} ${isHovered ? glowClass : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderRadius: 14,
        backgroundColor: isCompleted ? 'var(--np-bg-tertiary)' : 'var(--np-bg-card)',
        border: '1px solid var(--np-border)',
        cursor: 'default',
        opacity: isCompleted ? 0.65 : 1,
        transition: 'box-shadow 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Left: Score Ring + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
        <div style={{ position: 'relative', flexShrink: 0, width: 48, height: 48 }}>
          {/* SVG Score Ring */}
          <svg width="48" height="48" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle
              cx="24" cy="24" r={radius}
              fill="none"
              stroke="var(--np-border)"
              strokeWidth="2.5"
            />
            <motion.circle
              cx="24" cy="24" r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="2.5"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, delay: Math.min(index * 0.04, 0.4) + 0.2, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>

          {/* Avatar */}
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: getAvatarColor(contact.full_name),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            {getInitials(contact.full_name)}
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Link
              href={`/contacts/${contact.id}`}
              style={{
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--np-text-primary)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--np-accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--np-text-primary)')}
            >
              {contact.full_name}
            </Link>
            <span
              style={{
                ...tierStyle,
                padding: '1px 8px',
                borderRadius: 100,
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              {contact.relationship_tier}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Building2 size={13} color="var(--np-text-tertiary)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.title} &bull; {contact.company}</span>
          </div>

          <div style={{ fontSize: '0.74rem', color: contact.is_overdue ? '#ef4444' : 'var(--np-text-tertiary)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
            {contact.is_overdue ? <AlertCircle size={12} /> : <Clock size={12} />}
            <span>{contact.suggested_reason}</span>
          </div>
        </div>
      </div>

      {/* Right: Score + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Score */}
        <div style={{ textAlign: 'right', marginRight: 6 }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: Math.min(index * 0.04, 0.4) + 0.3, type: 'spring', stiffness: 400, damping: 15 }}
            style={{ fontSize: '1.1rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}
          >
            {score}
          </motion.div>
          <div style={{ fontSize: '0.62rem', color: 'var(--np-text-tertiary)', marginTop: 2 }}>Decay Score</div>
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="completed"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: '0.78rem', fontWeight: 700 }}
            >
              <CheckCircle2 size={16} />
              <span>Done</span>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 2 }}
            >
              {/* Snooze */}
              <button
                onClick={() => onSnooze(contact.id, contact.full_name)}
                className="btn btn-ghost btn-sm"
                style={{ padding: 6, borderRadius: '50%' }}
                title="Snooze 7 days"
              >
                <Moon size={15} color="var(--np-text-tertiary)" />
              </button>

              {/* WhatsApp */}
              <a
                href={generateWhatsAppUrl({ contact })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ padding: 6, borderRadius: '50%' }}
                title="WhatsApp"
              >
                <MessageSquare size={15} color="#10b981" />
              </a>

              {/* Calendar */}
              <a
                href={generateGoogleCalendarUrl({
                  contact,
                  agendaTopic: `Catch-up (${contact.relationship_tier.toUpperCase()} Tier)`,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ padding: 6, borderRadius: '50%' }}
                title="Schedule Meet"
              >
                <Calendar size={15} color="var(--np-text-secondary)" />
              </a>

              {/* Mark Done */}
              <button
                onClick={() => onMarkContacted(contact.id)}
                className="btn btn-primary btn-sm"
                style={{ padding: '5px 12px', fontSize: '0.76rem', fontWeight: 700, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <CheckCircle2 size={13} /> Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
