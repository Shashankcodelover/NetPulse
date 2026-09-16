import { Contact, Interaction, Relationship, RelationshipType } from '@/lib/types';
import { DEMO_CONTACTS } from '@/lib/demo-data';
import { DEMO_INTERACTIONS, DEMO_RELATIONSHIPS } from '@/lib/storage/db';

class ServerStore {
  private contacts: Contact[] = [...DEMO_CONTACTS];
  private interactions: Interaction[] = [...DEMO_INTERACTIONS];
  private relationships: Relationship[] = [...DEMO_RELATIONSHIPS];

  getContacts(query?: { search?: string; tier?: string; limit?: number; offset?: number }): Contact[] {
    let result = [...this.contacts];
    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(c =>
        c.full_name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }
    if (query?.tier && query.tier !== 'all') {
      result = result.filter(c => c.relationship_tier === query.tier);
    }
    if (query?.offset) {
      result = result.slice(query.offset);
    }
    if (query?.limit) {
      result = result.slice(0, query.limit);
    }
    return result;
  }

  getContactById(id: string): Contact | null {
    return this.contacts.find(c => c.id === id) || null;
  }

  createContact(data: Partial<Contact>): Contact {
    const now = new Date().toISOString();
    const contact: Contact = {
      id: data.id || `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: data.user_id || 'local-user',
      full_name: data.full_name || 'Anonymous Executive',
      company: data.company || null,
      title: data.title || null,
      email: data.email || null,
      linkedin_url: data.linkedin_url || null,
      previous_company: data.previous_company || null,
      previous_title: data.previous_title || null,
      source: data.source || 'manual',
      relationship_tier: data.relationship_tier || 'priority',
      last_contacted_at: data.last_contacted_at || now.split('T')[0],
      last_bulk_synced_at: now,
      last_enriched_at: null,
      notes: data.notes || null,
      created_at: now,
      updated_at: now,
    };
    this.contacts.unshift(contact);
    return contact;
  }

  updateContact(id: string, data: Partial<Contact>): Contact | null {
    const idx = this.contacts.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.contacts[idx] = {
      ...this.contacts[idx],
      ...data,
      id,
      updated_at: new Date().toISOString(),
    };
    return this.contacts[idx];
  }

  deleteContact(id: string): boolean {
    const initialLen = this.contacts.length;
    this.contacts = this.contacts.filter(c => c.id !== id);
    this.interactions = this.interactions.filter(i => i.contact_id !== id);
    this.relationships = this.relationships.filter(r => r.from_contact_id !== id && r.to_contact_id !== id);
    return this.contacts.length < initialLen;
  }

  getRelationships(contactId?: string): Relationship[] {
    if (contactId) {
      return this.relationships.filter(r => r.from_contact_id === contactId || r.to_contact_id === contactId);
    }
    return [...this.relationships];
  }

  createRelationship(data: { from_contact_id: string; to_contact_id: string; type: RelationshipType; notes?: string | null }): Relationship {
    const rel: Relationship = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      from_contact_id: data.from_contact_id,
      to_contact_id: data.to_contact_id,
      type: data.type,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
    };
    this.relationships.unshift(rel);
    return rel;
  }

  deleteRelationship(id: string): boolean {
    const initialLen = this.relationships.length;
    this.relationships = this.relationships.filter(r => r.id !== id);
    return this.relationships.length < initialLen;
  }

  getInteractions(contactId?: string): Interaction[] {
    if (contactId) {
      return this.interactions.filter(i => i.contact_id === contactId);
    }
    return [...this.interactions];
  }

  createInteraction(data: Partial<Interaction> & { contact_id: string }): Interaction {
    const inter: Interaction = {
      id: data.id || `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      contact_id: data.contact_id,
      user_id: data.user_id || 'local-user',
      type: data.type || 'note',
      content: data.content || null,
      created_at: data.created_at || new Date().toISOString(),
    };
    this.interactions.unshift(inter);
    return inter;
  }

  deleteInteraction(id: string): boolean {
    const initialLen = this.interactions.length;
    this.interactions = this.interactions.filter(i => i.id !== id);
    return this.interactions.length < initialLen;
  }
}

const globalForStore = globalThis as unknown as { serverStore?: ServerStore };
export const serverStore = globalForStore.serverStore || new ServerStore();
if (process.env.NODE_ENV !== 'production') globalForStore.serverStore = serverStore;
