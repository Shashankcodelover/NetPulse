'use client';

// ═══════════════════════════════════════════════════════
// Contacts List Page
// ═══════════════════════════════════════════════════════

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  Building2,
  Briefcase,
  Clock,
  ChevronRight,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { Contact, RelationshipTier } from '@/lib/types';
import { DEMO_CONTACTS } from '@/lib/demo-data';

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

type SortField = 'name' | 'company' | 'last_contacted';
type SortDir = 'asc' | 'desc';

import { netPulseStore } from '@/lib/storage/db';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<RelationshipTier | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    async function load() {
      const data = await netPulseStore.getContacts();
      setContacts(data);
      setLoading(false);
    }
    load();
    const handleUpdate = () => load();
    window.addEventListener('netpulse:state-changed', handleUpdate);
    return () => window.removeEventListener('netpulse:state-changed', handleUpdate);
  }, []);

  const filtered = useMemo(() => {
    let result = contacts;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.full_name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }

    // Tier filter
    if (tierFilter !== 'all') {
      result = result.filter(c => c.relationship_tier === tierFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.full_name.localeCompare(b.full_name);
          break;
        case 'company':
          cmp = (a.company || '').localeCompare(b.company || '');
          break;
        case 'last_contacted':
          const aDate = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0;
          const bDate = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0;
          cmp = aDate - bDate;
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [contacts, search, tierFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const tierCounts = useMemo(() => ({
    all: contacts.length,
    priority: contacts.filter(c => c.relationship_tier === 'priority').length,
    warm: contacts.filter(c => c.relationship_tier === 'warm').length,
    cold: contacts.filter(c => c.relationship_tier === 'cold').length,
  }), [contacts]);

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1>Contacts</h1>
        <p>{contacts.length} connections in your network</p>
      </div>

      {/* Filters Bar */}
      <div className="animate-fade-in" style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--np-text-tertiary)'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, company, or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Tier Filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'priority', 'warm', 'cold'] as const).map(tier => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`btn btn-sm ${tierFilter === tier ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {tier} ({tierCounts[tier]})
            </button>
          ))}
        </div>
      </div>

      {/* Sort Controls */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 16, fontSize: '0.8125rem',
        color: 'var(--np-text-tertiary)'
      }}>
        <span>Sort by:</span>
        {[
          { field: 'name' as SortField, label: 'Name' },
          { field: 'company' as SortField, label: 'Company' },
          { field: 'last_contacted' as SortField, label: 'Last Contact' },
        ].map(({ field, label }) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className="btn-ghost btn-sm"
            style={{
              padding: '2px 8px',
              fontWeight: sortField === field ? 600 : 400,
              color: sortField === field ? 'var(--np-accent)' : undefined,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {label}
            {sortField === field && (
              sortDir === 'asc' ? <SortAsc size={12} /> : <SortDesc size={12} />
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--np-radius)' }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && contacts.length === 0 && (
        <div className="empty-state animate-fade-in-up">
          <div className="empty-icon">
            <Users size={28} />
          </div>
          <h3>No contacts yet</h3>
          <p>Import your LinkedIn connections to get started.</p>
          <Link href="/import" className="btn btn-primary" style={{ marginTop: 20 }}>
            Import Connections
          </Link>
        </div>
      )}

      {/* No Results */}
      {!loading && contacts.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={28} />
          </div>
          <h3>No matches found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Contact List */}
      {!loading && filtered.length > 0 && (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(contact => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="contact-card"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="contact-avatar"
                style={{ background: getAvatarColor(contact.full_name) }}
              >
                {getInitials(contact.full_name)}
              </div>
              <div className="contact-info" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="contact-name">{contact.full_name}</span>
                  <span className={`badge badge-${contact.relationship_tier === 'priority' ? 'priority' : contact.relationship_tier === 'warm' ? 'warm' : 'cold'}`}>
                    {contact.relationship_tier}
                  </span>
                </div>
                <div className="contact-meta" style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                  {contact.title && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Briefcase size={12} /> {contact.title}
                    </span>
                  )}
                  {contact.company && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={12} /> {contact.company}
                    </span>
                  )}
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                color: 'var(--np-text-tertiary)', fontSize: '0.8125rem',
              }}>
                {contact.last_contacted_at && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })}
                  </span>
                )}
                <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
