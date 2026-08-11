'use client';

// ═══════════════════════════════════════════════════════
// Daily Digest — Home Page
// "10-15 people to reach out to today"
// ═══════════════════════════════════════════════════════

import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import {
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Briefcase,
  Upload,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Contact, UserSettings, DigestContact } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';
import { calculatePriorityScore, getSuggestedReason, isContactOverdue } from '@/lib/scoring';

// Deterministic avatar color from name
function getAvatarColor(name: string): string {
  const colors = [
    '#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669',
    '#D97706', '#DC2626', '#DB2777', '#9333EA', '#4338CA',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getScoreClass(score: number): string {
  if (score >= 70) return 'score-high';
  if (score >= 40) return 'score-medium';
  return 'score-low';
}

function getTierBadgeClass(tier: string): string {
  switch (tier) {
    case 'priority': return 'badge-priority';
    case 'warm': return 'badge-warm';
    case 'cold': return 'badge-cold';
    default: return 'badge-cold';
  }
}

export default function DigestPage() {
  const [contacts, setContacts] = useState<DigestContact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactedToday, setContactedToday] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const didLoad = useRef(false);

  const supabase = createClient();

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;

    let cancelled = false;

    async function loadDigest() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        // Load settings
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const userSettings: UserSettings = settingsData || {
          ...DEFAULT_SETTINGS,
          id: '',
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserSettings;

        // Load all contacts
        const { data: contactsData } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id);

        if (cancelled) return;

        if (!contactsData || contactsData.length === 0) {
          setAllContacts([]);
          setContacts([]);
          setLoading(false);
          return;
        }

        setAllContacts(contactsData);

        // Load interaction counts for scoring
        const { data: interactionsData } = await supabase
          .from('interactions')
          .select('contact_id')
          .eq('user_id', user.id);

        const interactionCounts: Record<string, number> = {};
        interactionsData?.forEach(i => {
          interactionCounts[i.contact_id] = (interactionCounts[i.contact_id] || 0) + 1;
        });

        // Score and rank all contacts
        const scored: DigestContact[] = contactsData.map(contact => {
          const interactionCount = interactionCounts[contact.id] || 0;
          const scoreData = calculatePriorityScore(contact, interactionCount, userSettings);
          const overdue = isContactOverdue(contact, userSettings);
          const daysSince = contact.last_contacted_at
            ? Math.floor((Date.now() - new Date(contact.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return {
            ...contact,
            priority_score: {
              id: '',
              contact_id: contact.id,
              user_id: user.id,
              last_calculated_at: new Date().toISOString(),
              ...scoreData,
            },
            days_since_contact: daysSince,
            is_overdue: overdue,
            suggested_reason: getSuggestedReason(contact, scoreData.score, userSettings),
          };
        });

        // Sort by score descending
        scored.sort((a, b) => (b.priority_score?.score || 0) - (a.priority_score?.score || 0));

        // Take top N for digest
        const digestCount = userSettings.digest_count || 12;
        if (!cancelled) {
          setContacts(scored.slice(0, digestCount));
        }
      } catch (err) {
        console.error('Failed to load digest:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDigest();
    return () => { cancelled = true; };
  }, [supabase]);

  const markContacted = async (contactId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update last_contacted_at
      await supabase
        .from('contacts')
        .update({ last_contacted_at: new Date().toISOString() })
        .eq('id', contactId);

      // Create interaction record
      await supabase
        .from('interactions')
        .insert({
          contact_id: contactId,
          user_id: user.id,
          type: 'note',
          content: 'Marked as contacted from digest',
        });

      setContactedToday(prev => new Set([...prev, contactId]));
      showToast('Contact marked as reached out ✓');
    } catch (err) {
      console.error('Failed to mark contacted:', err);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const today = format(new Date(), 'EEEE, MMMM d');
  const overdueCount = contacts.filter(c => c.is_overdue && !contactedToday.has(c.id)).length;
  const completedCount = contactedToday.size;

  // ─── Empty State: No contacts yet ───
  if (!loading && allContacts.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state animate-fade-in-up">
          <div className="empty-icon">
            <Upload size={28} />
          </div>
          <h3>Welcome to NetPulse</h3>
          <p>
            Import your LinkedIn connections to get started with your personalized daily digest.
          </p>
          <Link href="/import" className="btn btn-primary btn-lg" style={{ marginTop: 24 }}>
            <Upload size={18} />
            Import Connections
          </Link>
        </div>
      </div>
    );
  }

  // ─── Empty State: All caught up ───
  if (!loading && contacts.length > 0 && contactedToday.size >= contacts.length) {
    return (
      <div className="page-container">
        <div className="page-header animate-fade-in">
          <h1>Today&apos;s Digest</h1>
          <p>{today}</p>
        </div>
        <div className="empty-state animate-fade-in-up">
          <div className="empty-icon" style={{ background: 'var(--np-success-light)' }}>
            <CheckCircle2 size={28} style={{ color: 'var(--np-success)' }} />
          </div>
          <h3>You&apos;re all caught up!</h3>
          <p>
            You&apos;ve reached out to everyone on today&apos;s digest. Great work keeping your network warm.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header animate-fade-in">
        <h1>Today&apos;s Digest</h1>
        <p>{today}</p>
      </div>

      {/* Hero Card */}
      <div className="digest-hero animate-fade-in-up" style={{ marginBottom: 28 }}>
        <h2>
          <Zap size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          {contacts.length - completedCount} people to reach out to
        </h2>
        <p>Prioritized by recency, relationship tier, and role importance</p>
        <div className="digest-stats">
          <div className="digest-stat">
            <div className="stat-value">{overdueCount}</div>
            <div className="stat-label">Overdue</div>
          </div>
          <div className="digest-stat">
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Done Today</div>
          </div>
          <div className="digest-stat">
            <div className="stat-value">{allContacts.length}</div>
            <div className="stat-label">Total Contacts</div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--np-radius)' }} />
          ))}
        </div>
      )}

      {/* Contact List */}
      {!loading && (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contacts.map(contact => {
            const isCompleted = contactedToday.has(contact.id);
            const score = contact.priority_score?.score || 0;

            return (
              <div
                key={contact.id}
                className="contact-card"
                style={{
                  opacity: isCompleted ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Score Ring */}
                <div className={`score-ring ${getScoreClass(score)}`}>
                  {score}
                </div>

                {/* Avatar */}
                <div
                  className="contact-avatar"
                  style={{ background: getAvatarColor(contact.full_name) }}
                >
                  {getInitials(contact.full_name)}
                </div>

                {/* Info */}
                <div className="contact-info" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="contact-name">{contact.full_name}</span>
                    <span className={`badge ${getTierBadgeClass(contact.relationship_tier)}`}>
                      {contact.relationship_tier}
                    </span>
                  </div>
                  <div className="contact-meta" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
                    {contact.title && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Briefcase size={12} />
                        {contact.title}
                      </span>
                    )}
                    {contact.company && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={12} />
                        {contact.company}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: contact.is_overdue ? 'var(--np-danger)' : 'var(--np-text-tertiary)',
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    {contact.is_overdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                    {contact.suggested_reason}
                  </div>
                </div>

                {/* Actions */}
                <div className="contact-actions">
                  {!isCompleted ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); markContacted(contact.id); }}
                        className="btn btn-primary btn-sm"
                        title="Mark as contacted"
                      >
                        <CheckCircle2 size={14} />
                        Done
                      </button>
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </>
                  ) : (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      color: 'var(--np-success)', fontSize: '0.8125rem', fontWeight: 600
                    }}>
                      <CheckCircle2 size={14} />
                      Contacted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
