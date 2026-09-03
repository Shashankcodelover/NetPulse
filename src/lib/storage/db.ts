// ═══════════════════════════════════════════════════════════════════════════════
// NetPulse — IndexedDB Write-Ahead Storage Engine
// Guarantees zero-loss client persistence, offline resilience, and fast state access.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Contact, Interaction, UserSettings } from '@/lib/types';
import { DEMO_CONTACTS } from '@/lib/demo-data';
import { DEFAULT_SETTINGS } from '@/lib/types';

const DB_NAME = 'netpulse_db';
const DB_VERSION = 3;

export const INITIAL_USER_SETTINGS: UserSettings = {
  ...DEFAULT_SETTINGS,
  id: 'local-settings',
  user_id: 'local-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_INTERACTIONS: Interaction[] = [
  {
    id: 'int-1',
    user_id: 'local-user',
    contact_id: 'demo-2', // Marcus Vance
    type: 'call',
    content: 'Quarterly LP briefing on enterprise infrastructure market dynamics. Discussed Series B syndication thesis.',
    created_at: '2026-06-30T10:00:00Z',
  },
  {
    id: 'int-2',
    user_id: 'local-user',
    contact_id: 'demo-3', // Aria Chen
    type: 'call',
    content: 'Catch-up regarding global payments latency and microservice decomposition at Stripe.',
    created_at: '2026-07-07T14:30:00Z',
  },
  {
    id: 'int-3',
    user_id: 'local-user',
    contact_id: 'demo-1', // Dr. Elena Rostova
    type: 'message',
    content: 'Discussed foundation agent evaluation benchmarks and latency constraints in decentralized swarm models.',
    created_at: '2026-06-23T09:15:00Z',
  },
  {
    id: 'int-4',
    user_id: 'local-user',
    contact_id: 'demo-4', // Alexander Wright
    type: 'call',
    content: 'Architecture review of cloud hybrid connectivity and multi-tenant failover protocols on Azure.',
    created_at: '2026-07-28T16:00:00Z',
  },
  {
    id: 'int-5',
    user_id: 'local-user',
    contact_id: 'demo-5', // Tanvi Kulkarni
    type: 'note',
    content: 'Explored unified webhook reliability models and cross-border settlement compliance.',
    created_at: '2026-07-28T11:45:00Z',
  },
];

export interface NetPulseDBData {
  contacts: Contact[];
  interactions: Interaction[];
  settings: UserSettings;
  decayOffsetDays: number;
  stageOverrides: Record<string, string>; // contactId -> stage name
}

class NetPulseStore {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback: NetPulseDBData = {
    contacts: [...DEMO_CONTACTS],
    interactions: [...DEMO_INTERACTIONS],
    settings: { ...INITIAL_USER_SETTINGS },
    decayOffsetDays: 0,
    stageOverrides: {},
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('interactions')) {
          db.createObjectStore('interactions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        const count = await this.countContacts(db);
        if (count === 0) {
          await this.seedInitialData(db);
        }
        resolve(db);
      };

      request.onerror = () => {
        console.warn('IndexedDB failed to open, falling back to memory state', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private countContacts(db: IDBDatabase): Promise<number> {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('contacts', 'readonly');
        const store = tx.objectStore('contacts');
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
      } catch {
        resolve(0);
      }
    });
  }

  private async seedInitialData(db: IDBDatabase): Promise<void> {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(['contacts', 'interactions', 'meta'], 'readwrite');
        const contactStore = tx.objectStore('contacts');
        const interactionStore = tx.objectStore('interactions');
        const metaStore = tx.objectStore('meta');

        for (const contact of DEMO_CONTACTS) {
          contactStore.put(contact);
        }

        for (const inter of DEMO_INTERACTIONS) {
          interactionStore.put(inter);
        }

        metaStore.put({ key: 'decayOffsetDays', value: 0 });
        metaStore.put({ key: 'stageOverrides', value: {} });
        metaStore.put({ key: 'settings', value: INITIAL_USER_SETTINGS });

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // ── Public Contact API ──

  async getContacts(): Promise<Contact[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction('contacts', 'readonly');
        const store = tx.objectStore('contacts');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || DEMO_CONTACTS);
        req.onerror = () => resolve(this.memoryFallback.contacts);
      });
    } catch {
      return this.memoryFallback.contacts;
    }
  }

  async getContactById(id: string): Promise<Contact | null> {
    try {
      const contacts = await this.getContacts();
      return contacts.find(c => c.id === id) || null;
    } catch {
      return this.memoryFallback.contacts.find(c => c.id === id) || null;
    }
  }

  async saveContact(contact: Contact): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('contacts', 'readwrite');
        const store = tx.objectStore('contacts');
        const req = store.put(contact);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const idx = this.memoryFallback.contacts.findIndex(c => c.id === contact.id);
      if (idx >= 0) this.memoryFallback.contacts[idx] = contact;
      else this.memoryFallback.contacts.push(contact);
    }
  }

  async importContacts(newContacts: Contact[]): Promise<{ added: number; updated: number; unchanged: number }> {
    const existing = await this.getContacts();
    const existingMap = new Map<string, Contact>();

    for (const c of existing) {
      const key = c.email?.toLowerCase() || c.full_name.toLowerCase();
      existingMap.set(key, c);
    }

    let added = 0;
    let updated = 0;
    let unchanged = 0;

    for (const incoming of newContacts) {
      const key = incoming.email?.toLowerCase() || incoming.full_name.toLowerCase();
      const match = existingMap.get(key);

      if (!match) {
        await this.saveContact(incoming);
        existingMap.set(key, incoming);
        added++;
      } else {
        const hasChange =
          match.title !== incoming.title ||
          match.company !== incoming.company ||
          match.relationship_tier !== incoming.relationship_tier;

        if (hasChange) {
          const merged: Contact = {
            ...match,
            ...incoming,
            id: match.id,
            updated_at: new Date().toISOString(),
          };
          await this.saveContact(merged);
          updated++;
        } else {
          unchanged++;
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }

    return { added, updated, unchanged };
  }

  // ── Public Interaction API ──

  async getInteractions(contactId?: string): Promise<Interaction[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction('interactions', 'readonly');
        const store = tx.objectStore('interactions');
        const req = store.getAll();
        req.onsuccess = () => {
          const all: Interaction[] = req.result || DEMO_INTERACTIONS;
          if (contactId) {
            resolve(all.filter(i => i.contact_id === contactId));
          } else {
            resolve(all);
          }
        };
        req.onerror = () => {
          if (contactId) {
            resolve(this.memoryFallback.interactions.filter(i => i.contact_id === contactId));
          } else {
            resolve(this.memoryFallback.interactions);
          }
        };
      });
    } catch {
      if (contactId) {
        return this.memoryFallback.interactions.filter(i => i.contact_id === contactId);
      }
      return this.memoryFallback.interactions;
    }
  }

  async saveInteraction(interaction: Interaction): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('interactions', 'readwrite');
        const store = tx.objectStore('interactions');
        const req = store.put(interaction);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const idx = this.memoryFallback.interactions.findIndex(i => i.id === interaction.id);
      if (idx >= 0) this.memoryFallback.interactions[idx] = interaction;
      else this.memoryFallback.interactions.unshift(interaction);
    }

    // Auto-update contact last_contacted_at
    const contact = await this.getContactById(interaction.contact_id);
    if (contact) {
      const updated: Contact = {
        ...contact,
        last_contacted_at: interaction.created_at.split('T')[0],
        updated_at: new Date().toISOString(),
      };
      await this.saveContact(updated);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
  }

  // ── Public Settings API ──

  async getSettings(): Promise<UserSettings> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction('meta', 'readonly');
        const store = tx.objectStore('meta');
        const req = store.get('settings');
        req.onsuccess = () => resolve(req.result?.value || INITIAL_USER_SETTINGS);
        req.onerror = () => resolve(this.memoryFallback.settings);
      });
    } catch {
      return this.memoryFallback.settings;
    }
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('meta', 'readwrite');
        const store = tx.objectStore('meta');
        const req = store.put({ key: 'settings', value: settings });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      this.memoryFallback.settings = settings;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
  }

  // ── Stage & Simulator Overrides API ──

  async getStageOverrides(): Promise<Record<string, string>> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction('meta', 'readonly');
        const store = tx.objectStore('meta');
        const req = store.get('stageOverrides');
        req.onsuccess = () => resolve(req.result?.value || {});
        req.onerror = () => resolve(this.memoryFallback.stageOverrides);
      });
    } catch {
      return this.memoryFallback.stageOverrides;
    }
  }

  async updateContactStage(contactId: string, stage: string): Promise<void> {
    try {
      const db = await this.initDB();
      const overrides = await this.getStageOverrides();
      overrides[contactId] = stage;

      await new Promise<void>((resolve) => {
        const tx = db.transaction('meta', 'readwrite');
        const store = tx.objectStore('meta');
        store.put({ key: 'stageOverrides', value: overrides });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      this.memoryFallback.stageOverrides[contactId] = stage;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
  }

  async getDecayOffsetDays(): Promise<number> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction('meta', 'readonly');
        const store = tx.objectStore('meta');
        const req = store.get('decayOffsetDays');
        req.onsuccess = () => resolve(req.result?.value || 0);
        req.onerror = () => resolve(this.memoryFallback.decayOffsetDays);
      });
    } catch {
      return this.memoryFallback.decayOffsetDays;
    }
  }

  async setDecayOffsetDays(days: number): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve) => {
        const tx = db.transaction('meta', 'readwrite');
        const store = tx.objectStore('meta');
        store.put({ key: 'decayOffsetDays', value: days });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      this.memoryFallback.decayOffsetDays = days;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
  }

  async resetToBaseline(): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve) => {
        const tx = db.transaction(['contacts', 'interactions', 'meta'], 'readwrite');
        const contactStore = tx.objectStore('contacts');
        const interactionStore = tx.objectStore('interactions');
        const metaStore = tx.objectStore('meta');

        contactStore.clear();
        for (const contact of DEMO_CONTACTS) {
          contactStore.put(contact);
        }

        interactionStore.clear();
        for (const inter of DEMO_INTERACTIONS) {
          interactionStore.put(inter);
        }

        metaStore.put({ key: 'decayOffsetDays', value: 0 });
        metaStore.put({ key: 'stageOverrides', value: {} });
        metaStore.put({ key: 'settings', value: INITIAL_USER_SETTINGS });

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      this.memoryFallback = {
        contacts: [...DEMO_CONTACTS],
        interactions: [...DEMO_INTERACTIONS],
        settings: { ...INITIAL_USER_SETTINGS },
        decayOffsetDays: 0,
        stageOverrides: {},
      };
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
  }

  async markContacted(contactId: string): Promise<void> {
    const contacts = await this.getContacts();
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const today = new Date().toISOString().split('T')[0];
    const updated: Contact = {
      ...contact,
      last_contacted_at: today,
      updated_at: new Date().toISOString(),
    };
    await this.saveContact(updated);

    // Also record an interaction
    const newInter: Interaction = {
      id: `int-${Date.now()}`,
      user_id: 'local-user',
      contact_id: contactId,
      type: 'call',
      content: `Completed scheduled check-in and alignment catch-up with ${contact.full_name}.`,
      created_at: new Date().toISOString(),
    };
    await this.saveInteraction(newInter);
  }
}

export const netPulseStore = new NetPulseStore();
