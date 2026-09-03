'use client';

// ═══════════════════════════════════════════════════════
// Notification Bell & SLA Cadence Watchdog
// Real-time alerts for relationship decay & title milestones
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Briefcase, Calendar, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';
import { netPulseStore } from '@/lib/storage/db';
import { isContactOverdue } from '@/lib/scoring';
import { DEFAULT_SETTINGS } from '@/lib/types';

interface NotificationItem {
  id: string;
  type: 'sla_breach' | 'milestone' | 'upcoming';
  title: string;
  detail: string;
  time: string;
  link: string;
  read: boolean;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refreshNotifications = async () => {
    const contacts = await netPulseStore.getContacts();
    const offsetDays = await netPulseStore.getDecayOffsetDays();

    const overdueContacts = contacts.filter(c => isContactOverdue(c, DEFAULT_SETTINGS, offsetDays));

    const generated: NotificationItem[] = overdueContacts.slice(0, 5).map((c, idx) => ({
      id: `notif-${c.id}-${idx}`,
      type: 'sla_breach',
      title: `${offsetDays > 14 ? '🔴 Critical SLA Breach' : '⚠️ Cadence Warning'}: ${c.full_name}`,
      detail: `${c.title || 'Executive'} at ${c.company || 'Partner'} has exceeded target cadence by ${offsetDays + 4} days. Reconnect advised.`,
      time: offsetDays > 0 ? `+${offsetDays}d simulated` : 'Active SLA',
      link: '/contacts',
      read: false,
    }));

    if (generated.length === 0) {
      generated.push({
        id: 'notif-pristine',
        type: 'milestone',
        title: '🟢 All Relationship SLAs Healthy',
        detail: 'Zero overdue contacts detected in current cadence horizon.',
        time: 'Just now',
        link: '/pipeline',
        read: false,
      });
    }

    setNotifications(generated);
  };

  useEffect(() => {
    refreshNotifications();
    const handleUpdate = () => refreshNotifications();
    window.addEventListener('netpulse:state-changed', handleUpdate);
    return () => window.removeEventListener('netpulse:state-changed', handleUpdate);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          padding: 8,
          color: 'var(--np-text-secondary)',
          cursor: 'pointer',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="View notifications"
        title="Cadence Watchdog Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 'min(360px, calc(100vw - 32px))',
            backgroundColor: 'var(--np-bg-card)',
            border: '1px solid var(--np-border)',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--np-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--np-bg-secondary)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Cadence Watchdog</div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--np-accent)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.map(n => (
              <Link
                key={n.id}
                href={n.link}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--np-border-light)',
                  textDecoration: 'none',
                  backgroundColor: n.read ? 'transparent' : 'rgba(79, 70, 229, 0.04)',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: n.read ? 600 : 700,
                        color: 'var(--np-text-primary)',
                        marginBottom: 3,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--np-text-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      {n.detail}
                    </div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--np-text-tertiary)',
                        marginTop: 4,
                      }}
                    >
                      {n.time}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--np-text-tertiary)', marginTop: 2 }} />
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--np-border)',
              background: 'var(--np-bg-secondary)',
              textAlign: 'center',
            }}
          >
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: '0.75rem',
                color: 'var(--np-text-secondary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Configure SLA Thresholds &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
