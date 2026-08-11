'use client';

// ═══════════════════════════════════════════════════════
// Contact Detail Page
// ═══════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Mail,
  Clock,
  Edit3,
  Save,
  X,
  MessageSquare,
  Phone,
  FileText,
  Plus,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { Contact, Interaction, RelationshipTier } from '@/lib/types';

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

const interactionIcons = {
  message: MessageSquare,
  comment: MessageSquare,
  call: Phone,
  note: FileText,
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  const supabase = createClient();

  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Contact>>({});
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [contactRes, interactionsRes] = await Promise.all([
        supabase.from('contacts').select('*').eq('id', contactId).single(),
        supabase.from('interactions').select('*').eq('contact_id', contactId).order('created_at', { ascending: false }),
      ]);

      if (contactRes.data) {
        setContact(contactRes.data);
        setEditData(contactRes.data);
      }
      setInteractions(interactionsRes.data || []);
      setLoading(false);
    }
    load();
  }, [contactId, supabase]);

  const saveEdits = async () => {
    if (!contact) return;
    setSaving(true);
    const { error } = await supabase
      .from('contacts')
      .update({
        full_name: editData.full_name,
        company: editData.company,
        title: editData.title,
        email: editData.email,
        relationship_tier: editData.relationship_tier,
        notes: editData.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contact.id);

    if (!error) {
      setContact({ ...contact, ...editData } as Contact);
      setEditing(false);
      showToast('Contact updated');
    }
    setSaving(false);
  };

  const addNote = async () => {
    if (!newNote.trim() || !contact) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('interactions')
      .insert({
        contact_id: contact.id,
        user_id: user.id,
        type: 'note',
        content: newNote.trim(),
      })
      .select()
      .single();

    if (data) {
      setInteractions([data, ...interactions]);
      setNewNote('');
      showToast('Note added');
    }
  };

  const markContacted = async () => {
    if (!contact) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('contacts')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', contact.id);

    const { data } = await supabase
      .from('interactions')
      .insert({
        contact_id: contact.id,
        user_id: user.id,
        type: 'note',
        content: 'Marked as contacted',
      })
      .select()
      .single();

    setContact({ ...contact, last_contacted_at: new Date().toISOString() });
    if (data) setInteractions([data, ...interactions]);
    showToast('Marked as contacted');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--np-radius-lg)', marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--np-radius)' }} />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Contact not found</h3>
          <button onClick={() => router.push('/contacts')} className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Contacts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="btn btn-ghost btn-sm animate-fade-in"
        style={{ marginBottom: 20 }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Profile Header */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div
            className="contact-avatar"
            style={{
              background: getAvatarColor(contact.full_name),
              width: 72, height: 72, fontSize: '1.5rem',
            }}
          >
            {getInitials(contact.full_name)}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="form-input" value={editData.full_name || ''} onChange={e => setEditData({ ...editData, full_name: e.target.value })} placeholder="Full Name" />
                <input className="form-input" value={editData.title || ''} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="Title" />
                <input className="form-input" value={editData.company || ''} onChange={e => setEditData({ ...editData, company: e.target.value })} placeholder="Company" />
                <input className="form-input" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} placeholder="Email" />
                <select
                  className="form-input form-select"
                  value={editData.relationship_tier || 'warm'}
                  onChange={e => setEditData({ ...editData, relationship_tier: e.target.value as RelationshipTier })}
                >
                  <option value="priority">Priority</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
                <textarea
                  className="form-input form-textarea"
                  value={editData.notes || ''}
                  onChange={e => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Notes about this contact..."
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={saveEdits} className="btn btn-primary btn-sm" disabled={saving}>
                    <Save size={14} /> Save
                  </button>
                  <button onClick={() => { setEditing(false); setEditData(contact); }} className="btn btn-ghost btn-sm">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{contact.full_name}</h2>
                  <span className={`badge badge-${contact.relationship_tier === 'priority' ? 'priority' : contact.relationship_tier === 'warm' ? 'warm' : 'cold'}`}>
                    {contact.relationship_tier}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--np-text-secondary)', fontSize: '0.9375rem' }}>
                  {contact.title && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Briefcase size={14} /> {contact.title}
                    </span>
                  )}
                  {contact.company && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building2 size={14} /> {contact.company}
                    </span>
                  )}
                  {contact.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={14} /> {contact.email}
                    </span>
                  )}
                  {contact.last_contacted_at && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> Last contacted {formatDistanceToNow(new Date(contact.last_contacted_at), { addSuffix: true })}
                    </span>
                  )}
                </div>

                {/* Job Change Detection */}
                {contact.previous_company && contact.previous_company !== contact.company && (
                  <div className="badge badge-success" style={{ marginTop: 10 }}>
                    <Star size={12} style={{ marginRight: 4 }} />
                    Changed jobs: {contact.previous_company} → {contact.company}
                  </div>
                )}

                {contact.notes && (
                  <p style={{ marginTop: 12, fontSize: '0.875rem', color: 'var(--np-text-secondary)', lineHeight: 1.6 }}>
                    {contact.notes}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          {!editing && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={markContacted} className="btn btn-primary btn-sm">
                <CheckCircle2 size={14} /> Mark Contacted
              </button>
              <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">
                <Edit3 size={14} /> Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Note */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Add a Note</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Quick note, conversation summary, or update..."
              onKeyDown={e => e.key === 'Enter' && addNote()}
              style={{ flex: 1 }}
            />
            <button onClick={addNote} className="btn btn-primary btn-sm" disabled={!newNote.trim()}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Interaction History */}
      <div className="card animate-fade-in-up">
        <div className="card-body">
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>History ({interactions.length})</h3>
          {interactions.length === 0 ? (
            <p style={{ color: 'var(--np-text-tertiary)', fontSize: '0.875rem' }}>
              No interactions recorded yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {interactions.map((interaction, index) => {
                const Icon = interactionIcons[interaction.type] || FileText;
                return (
                  <div
                    key={interaction.id}
                    style={{
                      display: 'flex', gap: 12, padding: '14px 0',
                      borderBottom: index < interactions.length - 1 ? '1px solid var(--np-border-light)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--np-bg-tertiary)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={14} style={{ color: 'var(--np-text-tertiary)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--np-text-primary)' }}>
                        {interaction.content || `${interaction.type} interaction`}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)', marginTop: 2 }}>
                        {format(new Date(interaction.created_at), 'MMM d, yyyy · h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
