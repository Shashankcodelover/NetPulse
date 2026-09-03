'use client';

// ═══════════════════════════════════════════════════════
// Notification Bell & SLA Cadence Watchdog
// Real-time alerts, tabs, 1-click reconnect, and zero-clipping layout
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Check,
  Zap,
  Sparkles,
  ArrowUpRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { netPulseStore } from '@/lib/storage/db';
import { isContactOverdue } from '@/lib/scoring';
import { DEFAULT_SETTINGS } from '@/lib/types';
import type { Contact } from '@/lib/types';

interface NotificationItem {
  id: string;
  contactId?: string;
  tier: 'priority' | 'warm' | 'cold' | 'system';
  type: 'sla_breach' | 'milestone' | 'upcoming';
  title: string;
  detail: string;
  time: string;
  link: string;
  read: boolean;
}

interface NotificationBellProps {
  placement?: 'sidebar' | 'header';
}

export function NotificationBell({ placement = 'sidebar' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'priority' | 'healthy'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshNotifications = async () => {
    const contacts = await netPulseStore.getContacts();
    const offsetDays = await netPulseStore.getDecayOffsetDays();

    const overdueContacts = contacts.filter(c => isContactOverdue(c, DEFAULT_SETTINGS, offsetDays));

    const generated: NotificationItem[] = overdueContacts.map((c, idx) => ({
      id: `notif-${c.id}-${idx}`,
      contactId: c.id,
      tier: c.relationship_tier,
      type: 'sla_breach',
      title: `${c.relationship_tier === 'priority' ? '🔴 Priority SLA Breach' : '⚠️ Cadence Warning'}: ${c.full_name}`,
      detail: `${c.title || 'Executive'} at ${c.company || 'Organization'} exceeded ${c.relationship_tier.toUpperCase()} cadence.`,
      time: offsetDays > 0 ? `+${offsetDays}d simulated` : 'Action Required',
      link: `/contacts/${c.id}`,
      read: false,
    }));

    if (generated.length === 0) {
      generated.push({
        id: 'notif-pristine',
        tier: 'system',
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

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read && n.tier !== 'system').length;
  const priorityBreachCount = notifications.filter(n => n.tier === 'priority' && !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === 'priority') return n.tier === 'priority';
    if (filterTab === 'healthy') return n.type === 'milestone';
    return true;
  });

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: isOpen ? 'var(--np-bg-hover)' : 'transparent',
          border: 'none',
          padding: 8,
          color: unreadCount > 0 ? 'var(--np-accent)' : 'var(--np-text-secondary)',
          cursor: 'pointer',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        aria-label="View notifications"
        title="Cadence Watchdog Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 17,
              height: 17,
              padding: '0 4px',
              borderRadius: '999px',
              backgroundColor: priorityBreachCount > 0 ? '#ef4444' : '#f59e0b',
              color: 'white',
              fontSize: '0.64rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: priorityBreachCount > 0 ? '0 0 8px rgba(239, 68, 68, 0.7)' : '0 0 8px rgba(245, 158, 11, 0.5)',
              border: '2px solid var(--np-bg-sidebar)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu — ZERO CLIPPING POSITIONING */}
      {isOpen && (
        <div
          className="animate-scale-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            ...(placement === 'sidebar'
              ? { left: 0, width: 340 }
              : { right: 0, width: 'min(360px, calc(100vw - 32px))' }),
            backgroundColor: 'var(--np-bg-card)',
            border: '1px solid var(--np-border)',
            borderRadius: 14,
            boxShadow: '0 16px 36px rgba(0,0,0,0.22)',
            zIndex: 2000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px 10px',
              borderBottom: '1px solid var(--np-border)',
              background: 'var(--np-bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="badge badge-priority" style={{ fontSize: '0.65rem' }}>
                  WATCHDOG
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>Cadence Alerts</span>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--np-accent)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--np-bg-tertiary)', padding: 3, borderRadius: 8 }}>
              <button
                onClick={() => setFilterTab('all')}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: filterTab === 'all' ? 700 : 500,
                  background: filterTab === 'all' ? 'var(--np-bg-card)' : 'transparent',
                  color: filterTab === 'all' ? 'var(--np-text-primary)' : 'var(--np-text-tertiary)',
                  cursor: 'pointer',
                  boxShadow: filterTab === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilterTab('priority')}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: filterTab === 'priority' ? 700 : 500,
                  background: filterTab === 'priority' ? 'var(--np-bg-card)' : 'transparent',
                  color: filterTab === 'priority' ? '#ef4444' : 'var(--np-text-tertiary)',
                  cursor: 'pointer',
                  boxShadow: filterTab === 'priority' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Priority ({notifications.filter(n => n.tier === 'priority').length})
              </button>
              <button
                onClick={() => setFilterTab('healthy')}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: filterTab === 'healthy' ? 700 : 500,
                  background: filterTab === 'healthy' ? 'var(--np-bg-card)' : 'transparent',
                  color: filterTab === 'healthy' ? '#10b981' : 'var(--np-text-tertiary)',
                  cursor: 'pointer',
                  boxShadow: filterTab === 'healthy' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Status
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--np-text-tertiary)', fontSize: '0.8rem' }}>
                No notifications in this filter.
              </div>
            ) : (
              filteredNotifications.map(n => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--np-border-light)',
                    backgroundColor: n.read ? 'transparent' : 'rgba(79, 70, 229, 0.04)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: n.read ? 600 : 800,
                          color: 'var(--np-text-primary)',
                          marginBottom: 3,
                          lineHeight: 1.3,
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--np-text-secondary)',
                          lineHeight: 1.4,
                          marginBottom: 8,
                        }}
                      >
                        {n.detail}
                      </div>

                      {/* Action buttons inside card */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="btn btn-primary btn-sm"
                          style={{
                            fontSize: '0.68rem',
                            padding: '3px 9px',
                            borderRadius: 6,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontWeight: 700,
                          }}
                        >
                          <Zap size={11} /> Reconnect <ArrowUpRight size={11} />
                        </Link>

                        {!n.read && n.tier !== 'system' && (
                          <button
                            onClick={e => markSingleRead(n.id, e)}
                            className="btn btn-ghost btn-sm"
                            style={{
                              fontSize: '0.68rem',
                              padding: '3px 8px',
                              borderRadius: 6,
                              color: 'var(--np-text-tertiary)',
                            }}
                          >
                            <Check size={11} /> Handled
                          </button>
                        )}

                        <span
                          style={{
                            marginLeft: 'auto',
                            fontSize: '0.66rem',
                            color: 'var(--np-text-tertiary)',
                          }}
                        >
                          {n.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--np-border)',
              background: 'var(--np-bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              style={{
                fontSize: '0.74rem',
                color: 'var(--np-accent)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Clock size={12} /> Configure Cadence SLAs &rarr;
            </Link>

            <span style={{ fontSize: '0.66rem', color: 'var(--np-text-tertiary)' }}>
              Live Algorithmic Watchdog
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
