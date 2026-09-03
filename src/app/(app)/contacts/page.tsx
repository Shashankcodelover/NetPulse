'use client';

// ═══════════════════════════════════════════════════════
// NetPulse — Contacts Directory & Management Suite
// Write-ahead IndexedDB search, filters, quick contact modal,
// and export engine.
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
  Plus,
  Download,
  X,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { netPulseStore } from '@/lib/storage/db';
import type { Contact, RelationshipTier } from '@/lib/types';

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

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<RelationshipTier | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // New Contact Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTier, setNewTier] = useState<RelationshipTier>('priority');
  const [newNotes, setNewNotes] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const loadContacts = async () => {
    const data = await netPulseStore.getContacts();
    setContacts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadContacts();
    const handleUpdate = () => loadContacts();
    window.addEventListener('netpulse:state-changed', handleUpdate);
    return () => window.removeEventListener('netpulse:state-changed', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    const now = new Date().toISOString();
    const newContact: Contact = {
      id: `manual-${Date.now()}`,
      user_id: 'local-user',
      full_name: newFullName.trim(),
      company: newCompany.trim() || null,
      title: newTitle.trim() || null,
      email: newEmail.trim() || null,
      linkedin_url: null,
      relationship_tier: newTier,
      last_contacted_at: now.split('T')[0],
      source: 'manual',
      previous_company: null,
      previous_title: null,
      last_bulk_synced_at: now,
      last_enriched_at: null,
      notes: newNotes.trim() || null,
      created_at: now,
      updated_at: now,
    };

    await netPulseStore.saveContact(newContact);
    setShowAddModal(false);
    setNewFullName('');
    setNewTitle('');
    setNewCompany('');
    setNewEmail('');
    setNewNotes('');
    showToast(`Added ${newContact.full_name} to your relationship directory!`);
    await loadContacts();
  };

  const exportContactsJson = () => {
    const jsonStr = JSON.stringify(contacts, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netpulse_contacts_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Exported active contact database as JSON');
  };

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
    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.full_name.localeCompare(b.full_name);
      } else if (sortField === 'company') {
        cmp = (a.company || '').localeCompare(b.company || '');
      } else if (sortField === 'last_contacted') {
        const dateA = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0;
        const dateB = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0;
        cmp = dateA - dateB;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [contacts, search, tierFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
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
      {/* Header with Add and Export Actions */}
      <div className="page-header animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
              RELATIONSHIP DIRECTORY
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
              {contacts.length} Connected Leaders &bull; IndexedDB Persistence
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Contacts</h1>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={exportContactsJson}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={14} /> Export JSON
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <Plus size={14} /> Add Contact
          </button>
        </div>
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
          <p>Import your LinkedIn connections or add a contact manually.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              Add First Contact
            </button>
            <Link href="/import" className="btn btn-secondary">
              Import LinkedIn CSV
            </Link>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && contacts.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <Search size={28} />
          </div>
          <h3>No matches found</h3>
          <p>Try adjusting your search or tier filters.</p>
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
                  <span className={`badge badge-${contact.relationship_tier}`}>
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

      {/* Quick Add Contact Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card animate-scale-in"
            style={{
              width: '100%',
              maxWidth: 480,
              padding: 24,
              borderRadius: 18,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Add New Connection</h2>
              <button onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ padding: 6 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 4 }}>
                  Full Name *
                </label>
                <input
                  className="form-input"
                  required
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  placeholder="e.g. Demis Hassabis"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 4 }}>
                    Title
                  </label>
                  <input
                    className="form-input"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. CEO & Co-Founder"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 4 }}>
                    Company
                  </label>
                  <input
                    className="form-input"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    placeholder="e.g. Google DeepMind"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 4 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="demis@deepmind.com"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 4 }}>
                    Cadence Tier
                  </label>
                  <select
                    className="form-input form-select"
                    value={newTier}
                    onChange={e => setNewTier(e.target.value as RelationshipTier)}
                    style={{ width: '100%' }}
                  >
                    <option value="priority">Priority (14d SLA)</option>
                    <option value="warm">Warm (30d SLA)</option>
                    <option value="cold">Cold (90d SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--np-text-secondary)', marginBottom: 4 }}>
                  Initial Notes &amp; Context
                </label>
                <textarea
                  className="form-input form-textarea"
                  rows={2}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Key milestones, discussion topics..."
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                  Create Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="toast animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} style={{ color: 'var(--np-success)' }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
