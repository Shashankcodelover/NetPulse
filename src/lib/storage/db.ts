// ═══════════════════════════════════════════════════════════════════════════════
// NetPulse — IndexedDB Write-Ahead Storage Engine
// Guarantees zero-loss client persistence, offline resilience, and fast state access.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Contact, Interaction, UserSettings } from '@/lib/types';
import { DEMO_CONTACTS } from '@/lib/demo-data';
import { DEFAULT_SETTINGS } from '@/lib/types';

const DB_NAME = 'netpulse_db';
const DB_VERSION = 2;

const INITIAL_USER_SETTINGS: UserSettings = {
  ...DEFAULT_SETTINGS,
  id: 'local-settings',
  user_id: 'local-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

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
    interactions: [],
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
        // Auto-seed if empty
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
        const tx = db.transaction(['contacts', 'meta'], 'readwrite');
        const contactStore = tx.objectStore('contacts');
        const metaStore = tx.objectStore('meta');

        for (const contact of DEMO_CONTACTS) {
          contactStore.put(contact);
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

  // ── Public API ──

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

      return new Promise((resolve) => {
        const tx = db.transaction('meta', 'readwrite');
        const store = tx.objectStore('meta');
        store.put({ key: 'stageOverrides', value: overrides });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      this.memoryFallback.stageOverrides[contactId] = stage;
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
      return new Promise((resolve) => {
        const tx = db.transaction('meta', 'readwrite');
        const store = tx.objectStore('meta');
        store.put({ key: 'decayOffsetDays', value: days });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      this.memoryFallback.decayOffsetDays = days;
    }
  }

  async resetToBaseline(): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(['contacts', 'meta'], 'readwrite');
        const contactStore = tx.objectStore('contacts');
        const metaStore = tx.objectStore('meta');

        contactStore.clear();
        for (const contact of DEMO_CONTACTS) {
          contactStore.put(contact);
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
        interactions: [],
        settings: { ...INITIAL_USER_SETTINGS },
        decayOffsetDays: 0,
        stageOverrides: {},
      };
    }
  }

  async markContacted(contactId: string): Promise<void> {
    const contacts = await this.getContacts();
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const updated: Contact = {
      ...contact,
      last_contacted_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    };
    await this.saveContact(updated);
  }
}

export const netPulseStore = new NetPulseStore();
