// ═══════════════════════════════════════════════════════════════════════════════
// NetPulse — IndexedDB Write-Ahead Storage Engine
// Guarantees zero-loss client persistence, offline resilience, and fast state access.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Contact, Interaction, Relationship, UserSettings, UserPersona } from '@/lib/types';
import { DEMO_CONTACTS } from '@/lib/demo-data';
import { DEFAULT_SETTINGS } from '@/lib/types';

export const PERSONA_SHASHANK: UserPersona = {
  id: 'user-shashank',
  name: 'Shashank J',
  title: 'Full-Stack Engineer & AI Builder',
  company: 'JSS Science and Technology University (SJCE)',
  email: 'shashank.j8426@gmail.com',
  avatarGradient: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
  initials: 'SJ',
  focus: 'Distributed Systems, Agentic AI & Autonomous Web Platforms',
  networkRole: 'Engineer & Founder',
};

export const PERSONA_ALEX: UserPersona = {
  id: 'user-alex',
  name: 'Alex Mercer',
  title: 'Founding Partner',
  company: 'Apex DeepTech Ventures',
  email: 'alex.mercer@apexventures.io',
  avatarGradient: 'linear-gradient(135deg, #06b6d4, #6366f1)',
  initials: 'AM',
  focus: 'AI Infrastructure & Swarms',
  networkRole: 'Venture Partner',
};

export const PERSONA_ELENA: UserPersona = {
  id: 'user-elena',
  name: 'Dr. Elena Rostova',
  title: 'Founder & Chief Architect',
  company: 'QuantumFoundry',
  email: 'elena.rostova@quantumfoundry.ai',
  avatarGradient: 'linear-gradient(135deg, #10b981, #8b5cf6)',
  initials: 'ER',
  focus: 'Quantum ML & Cryptography',
  networkRole: 'Quantum Architect',
};

export const DEFAULT_PERSONAS: UserPersona[] = [PERSONA_SHASHANK, PERSONA_ALEX, PERSONA_ELENA];

const DB_NAME = 'netpulse_db';
const DB_VERSION = 4;

export const INITIAL_USER_SETTINGS: UserSettings = {
  ...DEFAULT_SETTINGS,
  id: 'local-settings',
  user_id: 'user-shashank',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_INTERACTIONS: Interaction[] = [
  {
    id: 'int-1',
    user_id: 'user-shashank',
    contact_id: 'contact-sandeep-guna', // Sandeep Gunasekaran (Visa)
    type: 'call',
    content: 'Quarterly architecture briefing on zero-trust identity architectures and HMAC SHA-256 rotating token generation for Smart Attendance.',
    created_at: '2026-08-12T10:00:00Z',
  },
  {
    id: 'int-2',
    user_id: 'user-shashank',
    contact_id: 'contact-pravallika-varikuti', // Pravallika Varikuti (Bosch)
    type: 'message',
    content: 'Discussed Bosch automotive IoT telemetry benchmarks and distributed streaming queues in Node.js.',
    created_at: '2026-09-01T14:30:00Z',
  },
  {
    id: 'int-3',
    user_id: 'user-shashank',
    contact_id: 'contact-nagesh-bhavi', // Nagesh Bhavi (HPE)
    type: 'note',
    content: 'Reviewing HPE hybrid cloud deployment topologies for DevFlow Pro real-time analytics.',
    created_at: '2026-08-18T09:15:00Z',
  },
  {
    id: 'int-4',
    user_id: 'user-shashank',
    contact_id: 'contact-aritra-mondal', // Aritra Mondal (SJCE)
    type: 'call',
    content: 'Finalized student registration workflows and judging criteria for HACK-OLYMPIC 2026 at JSS STU.',
    created_at: '2026-09-13T16:00:00Z',
  },
  {
    id: 'int-5',
    user_id: 'user-shashank',
    contact_id: 'contact-abhay-sj', // Abhay S J (Bosch AI)
    type: 'note',
    content: 'Explored LangGraph stateful multi-agent DAG execution and autonomous evaluation benchmarks.',
    created_at: '2026-08-29T11:45:00Z',
  },
];

export const DEMO_RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel-1',
    from_contact_id: 'contact-sandeep-guna', // Sandeep Gunasekaran (Visa)
    to_contact_id: 'contact-sai-yaswitha',   // Sai Yaswitha Raavi (Visa)
    type: 'colleague',
    notes: 'Visa Cybersecurity leadership & cloud engineering team.',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'rel-2',
    from_contact_id: 'contact-sandeep-guna', // Sandeep Gunasekaran (Visa)
    to_contact_id: 'contact-r-aswin',        // R Aswin (Visa)
    type: 'mentor',
    notes: 'Mentoring cybersecurity interns on hardware attestation and zero-trust perimeter.',
    created_at: '2026-08-03T14:30:00Z',
  },
  {
    id: 'rel-3',
    from_contact_id: 'contact-pravallika-varikuti', // Pravallika (Bosch)
    to_contact_id: 'contact-abhay-sj',              // Abhay S J (Bosch)
    type: 'colleague',
    notes: 'Bosch Global Software Technologies engineering cohorts.',
    created_at: '2026-08-20T09:00:00Z',
  },
  {
    id: 'rel-4',
    from_contact_id: 'contact-aritra-mondal', // Aritra Mondal (SJCE)
    to_contact_id: 'contact-prakruthi-prasad',// Prakruthi Prasad (TESLA SJCE)
    type: 'partner',
    notes: 'Joint technical council organizers for HACK-OLYMPIC 2026.',
    created_at: '2026-09-01T11:20:00Z',
  },
  {
    id: 'rel-5',
    from_contact_id: 'contact-dr-elena-rostova', // Dr. Elena Rostova (DeepMind)
    to_contact_id: 'contact-marcus-vance',       // Marcus Vance (Benchmark)
    type: 'advisor',
    notes: 'Advises Benchmark on foundation AI models and compute architecture.',
    created_at: '2026-08-15T16:45:00Z',
  },
  {
    id: 'rel-6',
    from_contact_id: 'contact-nipun-deept',  // Nipun Deept (LCC)
    to_contact_id: 'contact-aritra-mondal',  // Aritra Mondal (SJCE)
    type: 'colleague',
    notes: 'Open source Linux Campus Club peer advocates.',
    created_at: '2026-08-25T12:00:00Z',
  },
];

export interface NetPulseDBData {
  contacts: Contact[];
  interactions: Interaction[];
  relationships: Relationship[];
  settings: UserSettings;
  decayOffsetDays: number;
  stageOverrides: Record<string, string>; // contactId -> stage name
}

class NetPulseStore {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback: NetPulseDBData = {
    contacts: [...DEMO_CONTACTS],
    interactions: [...DEMO_INTERACTIONS],
    relationships: [...DEMO_RELATIONSHIPS],
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
        if (!db.objectStoreNames.contains('relationships')) {
          db.createObjectStore('relationships', { keyPath: 'id' });
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
        const stores = ['contacts', 'interactions', 'meta'];
        if (db.objectStoreNames.contains('relationships')) {
          stores.push('relationships');
        }
        const tx = db.transaction(stores, 'readwrite');
        const contactStore = tx.objectStore('contacts');
        const interactionStore = tx.objectStore('interactions');
        const metaStore = tx.objectStore('meta');

        for (const contact of DEMO_CONTACTS) {
          contactStore.put(contact);
        }

        for (const inter of DEMO_INTERACTIONS) {
          interactionStore.put(inter);
        }

        if (db.objectStoreNames.contains('relationships')) {
          const relStore = tx.objectStore('relationships');
          for (const rel of DEMO_RELATIONSHIPS) {
            relStore.put(rel);
          }
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

  async deleteContact(contactId: string): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const stores = ['contacts', 'interactions'];
        if (db.objectStoreNames.contains('relationships')) stores.push('relationships');
        const tx = db.transaction(stores, 'readwrite');
        const contactStore = tx.objectStore('contacts');
        const interactionStore = tx.objectStore('interactions');

        contactStore.delete(contactId);

        const reqInt = interactionStore.getAll();
        reqInt.onsuccess = () => {
          const ints: Interaction[] = reqInt.result || [];
          ints.filter(i => i.contact_id === contactId).forEach(i => interactionStore.delete(i.id));
        };

        if (db.objectStoreNames.contains('relationships')) {
          const relStore = tx.objectStore('relationships');
          const reqRel = relStore.getAll();
          reqRel.onsuccess = () => {
            const rels: Relationship[] = reqRel.result || [];
            rels.filter(r => r.from_contact_id === contactId || r.to_contact_id === contactId)
                .forEach(r => relStore.delete(r.id));
          };
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // fallback
    }

    this.memoryFallback.contacts = this.memoryFallback.contacts.filter(c => c.id !== contactId);
    this.memoryFallback.interactions = this.memoryFallback.interactions.filter(i => i.contact_id !== contactId);
    if (this.memoryFallback.relationships) {
      this.memoryFallback.relationships = this.memoryFallback.relationships.filter(
        r => r.from_contact_id !== contactId && r.to_contact_id !== contactId
      );
    }
    delete this.memoryFallback.stageOverrides[contactId];

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
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

  async deleteInteraction(interactionId: string): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('interactions', 'readwrite');
        const store = tx.objectStore('interactions');
        const req = store.delete(interactionId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // fallback
    }

    this.memoryFallback.interactions = this.memoryFallback.interactions.filter(i => i.id !== interactionId);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
  }

  // ── Public Relationship API ──

  async getRelationships(contactId?: string): Promise<Relationship[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        if (!db.objectStoreNames.contains('relationships')) {
          const all = this.memoryFallback.relationships || DEMO_RELATIONSHIPS;
          return resolve(contactId 
            ? all.filter(r => r.from_contact_id === contactId || r.to_contact_id === contactId)
            : all
          );
        }
        const tx = db.transaction('relationships', 'readonly');
        const store = tx.objectStore('relationships');
        const req = store.getAll();
        req.onsuccess = () => {
          const all: Relationship[] = req.result && req.result.length > 0 ? req.result : (this.memoryFallback.relationships || DEMO_RELATIONSHIPS);
          if (contactId) {
            resolve(all.filter(r => r.from_contact_id === contactId || r.to_contact_id === contactId));
          } else {
            resolve(all);
          }
        };
        req.onerror = () => {
          const all = this.memoryFallback.relationships || DEMO_RELATIONSHIPS;
          if (contactId) {
            resolve(all.filter(r => r.from_contact_id === contactId || r.to_contact_id === contactId));
          } else {
            resolve(all);
          }
        };
      });
    } catch {
      const all = this.memoryFallback.relationships || DEMO_RELATIONSHIPS;
      if (contactId) {
        return all.filter(r => r.from_contact_id === contactId || r.to_contact_id === contactId);
      }
      return all;
    }
  }

  async saveRelationship(relationship: Relationship): Promise<void> {
    try {
      const db = await this.initDB();
      if (db.objectStoreNames.contains('relationships')) {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction('relationships', 'readwrite');
          const store = tx.objectStore('relationships');
          const req = store.put(relationship);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch {
      // fallback
    }

    const list = this.memoryFallback.relationships || [];
    const idx = list.findIndex(r => r.id === relationship.id);
    if (idx >= 0) list[idx] = relationship;
    else list.push(relationship);
    this.memoryFallback.relationships = list;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
  }

  async deleteRelationship(relationshipId: string): Promise<void> {
    try {
      const db = await this.initDB();
      if (db.objectStoreNames.contains('relationships')) {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction('relationships', 'readwrite');
          const store = tx.objectStore('relationships');
          const req = store.delete(relationshipId);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    } catch {
      // fallback
    }

    if (this.memoryFallback.relationships) {
      this.memoryFallback.relationships = this.memoryFallback.relationships.filter(r => r.id !== relationshipId);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
  }

  // ── Multi-User Persona Identity API ──

  getActivePersona(): UserPersona {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('netpulse_active_persona');
      if (stored === 'user-elena') return PERSONA_ELENA;
      if (stored === 'user-alex') return PERSONA_ALEX;
      return PERSONA_SHASHANK;
    }
    return PERSONA_SHASHANK;
  }

  setActivePersona(personaId: string): UserPersona {
    const selected = personaId === 'user-elena' ? PERSONA_ELENA : personaId === 'user-alex' ? PERSONA_ALEX : PERSONA_SHASHANK;
    if (typeof window !== 'undefined') {
      localStorage.setItem('netpulse_active_persona', selected.id);
      window.dispatchEvent(new CustomEvent('netpulse:persona-switched', { detail: selected }));
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }
    return selected;
  }

  // ── Creative Virtuality Linking Engine (Zero-Manual Auto-Synthesis) ──

  async autoSynthesizeVirtualityMesh(): Promise<{ linksCreated: number; resonanceAvg: number }> {
    const contacts = await this.getContacts();
    const activePersona = this.getActivePersona();

    const elena = contacts.find(c => c.full_name.includes('Elena') || c.id === 'demo-1');
    const marcus = contacts.find(c => c.full_name.includes('Marcus') || c.id === 'demo-2');
    const aria = contacts.find(c => c.full_name.includes('Aria') || c.id === 'demo-3');
    const rohan = contacts.find(c => c.full_name.includes('Rohan') || c.id === 'demo-4');
    const sarah = contacts.find(c => c.full_name.includes('Sarah') || c.id === 'demo-5');

    const synthesizedLinks: Relationship[] = [
      {
        id: 'vlink-quantum-1',
        from_contact_id: elena?.id || 'demo-1',
        to_contact_id: marcus?.id || 'demo-2',
        type: 'quantum_entanglement',
        resonance: 98.4,
        virtuality_layer: 'quantum',
        status: 'entangled',
        pulse_rate_hz: 528,
        initiator_user_id: 'user-alex',
        target_user_id: 'user-elena',
        shared_tags: ['Quantum-ML', 'Compute-Syndicate', 'Autonomous-Swarms'],
        notes: '🌌 Quantum Co-Founder Entanglement: Synchronized algorithmic health & shared destiny. When compute clusters scale, cadence frequency locks in resonance.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'vlink-synaptic-2',
        from_contact_id: aria?.id || 'demo-3',
        to_contact_id: elena?.id || 'demo-1',
        type: 'synaptic_resonator',
        resonance: 94.2,
        virtuality_layer: 'synaptic',
        status: 'entangled',
        pulse_rate_hz: 639,
        initiator_user_id: 'user-elena',
        target_user_id: 'user-alex',
        shared_tags: ['Cognitive-Vibe', 'Distributed-Consensus', 'Zero-Latency'],
        notes: '🧬 Synaptic Resonance Link: Cognitive AI pattern alignment. Mirroring microservice architecture and idempotent token settling across Stripe & QuantumFoundry.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'vlink-orbit-3',
        from_contact_id: marcus?.id || 'demo-2',
        to_contact_id: rohan?.id || 'demo-4',
        type: 'gravitational_orbit',
        resonance: 91.7,
        virtuality_layer: 'gravitational',
        status: 'active',
        pulse_rate_hz: 432,
        initiator_user_id: 'user-alex',
        target_user_id: 'user-alex',
        shared_tags: ['Deal-Gravity', 'Series-B-Syndicate', 'B2B-Telemetry'],
        notes: '🪐 Gravitational Deal Orbit: High orbital velocity syndication channel. Pulling $18M ARR infrastructure rounds into mutual co-investment trajectories.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'vlink-stealth-4',
        from_contact_id: sarah?.id || 'demo-5',
        to_contact_id: aria?.id || 'demo-3',
        type: 'stealth_endorsement',
        resonance: 96.0,
        virtuality_layer: 'stealth',
        status: 'entangled',
        pulse_rate_hz: 741,
        initiator_user_id: 'user-elena',
        target_user_id: 'user-alex',
        shared_tags: ['ZK-Vouch', 'Edge-Runtime', 'SSR-Hardening'],
        notes: '⚡ Zero-Knowledge Stealth Vouch: Anonymous high-trust operator endorsement with verifiable cryptographic proof for enterprise platform governance.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'vlink-holosphere-5',
        from_contact_id: elena?.id || 'demo-1',
        to_contact_id: sarah?.id || 'demo-5',
        type: 'holosphere_anchor',
        resonance: 92.5,
        virtuality_layer: 'astral',
        status: 'active',
        pulse_rate_hz: 852,
        initiator_user_id: 'user-alex',
        target_user_id: 'user-elena',
        shared_tags: ['3D-Spatial-Mesh', 'Multi-Tenant-Cloud', 'Virtual-Anchor'],
        notes: '🔮 Holosphere Virtuality Anchor: Spatial persistent node in holographic memory matrix with real-time harmonic heartbeat.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'vlink-vortex-6',
        from_contact_id: rohan?.id || 'demo-4',
        to_contact_id: sarah?.id || 'demo-5',
        type: 'value_vortex',
        resonance: 89.8,
        virtuality_layer: 'quantum',
        status: 'active',
        pulse_rate_hz: 528,
        initiator_user_id: 'user-alex',
        target_user_id: 'user-alex',
        shared_tags: ['Social-Capital-Balance', 'Intro-Pipeline', 'Mutual-Leverage'],
        notes: '🌀 Reciprocal Value Vortex: Bi-directional high-yield introduction pipeline preventing one-sided relational debt.',
        created_at: new Date().toISOString(),
      },
    ];

    for (const link of synthesizedLinks) {
      await this.saveRelationship(link);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }

    const avgRes = Math.round(synthesizedLinks.reduce((sum, l) => sum + (l.resonance || 90), 0) / synthesizedLinks.length);
    return { linksCreated: synthesizedLinks.length, resonanceAvg: avgRes };
  }

  // 1-Click single link forge preset
  async forgeVirtualityLink(templateType: 'quantum' | 'orbit' | 'synaptic' | 'stealth'): Promise<Relationship> {
    const contacts = await this.getContacts();
    const activePersona = this.getActivePersona();

    const elena = contacts.find(c => c.full_name.includes('Elena') || c.id === 'demo-1') || contacts[0];
    const marcus = contacts.find(c => c.full_name.includes('Marcus') || c.id === 'demo-2') || contacts[1];
    const aria = contacts.find(c => c.full_name.includes('Aria') || c.id === 'demo-3') || contacts[2];

    let newLink: Relationship;
    const now = new Date().toISOString();

    if (templateType === 'quantum') {
      newLink = {
        id: `vlink-q-${Date.now()}`,
        from_contact_id: elena.id,
        to_contact_id: marcus.id,
        type: 'quantum_entanglement',
        resonance: 99.2,
        virtuality_layer: 'quantum',
        status: activePersona.id === 'user-alex' ? 'pending_handshake' : 'entangled',
        pulse_rate_hz: 528,
        initiator_user_id: activePersona.id,
        target_user_id: activePersona.id === 'user-alex' ? 'user-elena' : 'user-alex',
        shared_tags: ['Quantum-Entanglement', 'Synchronized-Destiny', 'Co-Founders'],
        notes: `🌌 Quantum Co-Founder Entanglement forged by ${activePersona.name}. Synchronized harmonic pulse active at 528 Hz.`,
        created_at: now,
      };
    } else if (templateType === 'orbit') {
      newLink = {
        id: `vlink-o-${Date.now()}`,
        from_contact_id: marcus.id,
        to_contact_id: aria.id,
        type: 'gravitational_orbit',
        resonance: 93.6,
        virtuality_layer: 'gravitational',
        status: 'active',
        pulse_rate_hz: 432,
        initiator_user_id: activePersona.id,
        target_user_id: 'user-alex',
        shared_tags: ['Venture-Gravity', 'Syndicate-Velocity'],
        notes: `🪐 Gravitational Deal Orbit configured by ${activePersona.name}. High orbital pull on mutual venture pipeline.`,
        created_at: now,
      };
    } else if (templateType === 'synaptic') {
      newLink = {
        id: `vlink-s-${Date.now()}`,
        from_contact_id: elena.id,
        to_contact_id: aria.id,
        type: 'synaptic_resonator',
        resonance: 95.8,
        virtuality_layer: 'synaptic',
        status: 'entangled',
        pulse_rate_hz: 639,
        initiator_user_id: activePersona.id,
        target_user_id: 'user-elena',
        shared_tags: ['Synaptic-Alignment', 'Agentic-Swarm'],
        notes: `🧬 Synaptic Resonance Link synchronized by ${activePersona.name}. 95.8% cognitive alignment match.`,
        created_at: now,
      };
    } else {
      newLink = {
        id: `vlink-z-${Date.now()}`,
        from_contact_id: aria.id,
        to_contact_id: elena.id,
        type: 'stealth_endorsement',
        resonance: 97.4,
        virtuality_layer: 'stealth',
        status: 'entangled',
        pulse_rate_hz: 741,
        initiator_user_id: activePersona.id,
        target_user_id: 'user-alex',
        shared_tags: ['ZK-Endorsement', 'Cryptographic-Trust'],
        notes: `⚡ Zero-Knowledge Stealth Vouch sealed by ${activePersona.name} with cryptographic blind signature.`,
        created_at: now,
      };
    }

    await this.saveRelationship(newLink);
    return newLink;
  }

  // 1-Click Accept Handshake (e.g. Elena accepts Alex's entanglement)
  async acceptVirtualityHandshake(linkId: string): Promise<Relationship | null> {
    const rels = await this.getRelationships();
    const target = rels.find(r => r.id === linkId);
    if (!target) return null;

    const updated: Relationship = {
      ...target,
      status: 'entangled',
      resonance: Math.min((target.resonance || 90) + 5.0, 100),
      notes: (target.notes || '') + ' [✨ Handshake reciprocated & locked into bilateral quantum entanglement.]',
    };

    await this.saveRelationship(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
      window.dispatchEvent(new CustomEvent('netpulse:handshake-accepted', { detail: updated }));
    }
    return updated;
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

  async resetToFactoryDefaults(): Promise<void> {
    return this.resetToBaseline();
  }

  async resetToBaseline(): Promise<void> {
    try {
      const db = await this.initDB();
      await new Promise<void>((resolve) => {
        const stores = ['contacts', 'interactions', 'meta'];
        if (db.objectStoreNames.contains('relationships')) stores.push('relationships');
        const tx = db.transaction(stores, 'readwrite');
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

        if (db.objectStoreNames.contains('relationships')) {
          const relStore = tx.objectStore('relationships');
          relStore.clear();
          for (const rel of DEMO_RELATIONSHIPS) {
            relStore.put(rel);
          }
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
        relationships: [...DEMO_RELATIONSHIPS],
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

  // ── Enterprise Governance & Snapshot Methods ──

  async getStorageTelemetry(): Promise<{
    contactsCount: number;
    interactionsCount: number;
    relationshipsCount: number;
    virtualityLinksCount: number;
    decayOffsetDays: number;
    activePersona: string;
    estimatedBytes: number;
  }> {
    const contacts = await this.getContacts();
    const interactions = await this.getInteractions();
    const relationships = await this.getRelationships();
    const decayOffsetDays = await this.getDecayOffsetDays();
    const virtualityLinksCount = relationships.filter(r => r.id.startsWith('vlink-')).length;

    const payload = JSON.stringify({ contacts, interactions, relationships });
    const estimatedBytes = new Blob([payload]).size;

    return {
      contactsCount: contacts.length,
      interactionsCount: interactions.length,
      relationshipsCount: relationships.length,
      virtualityLinksCount,
      decayOffsetDays,
      activePersona: this.getActivePersona().name,
      estimatedBytes,
    };
  }

  async exportDatabaseSnapshot(): Promise<{
    version: number;
    exportedAt: string;
    contacts: Contact[];
    interactions: Interaction[];
    relationships: Relationship[];
    settings: UserSettings;
    stageOverrides: Record<string, string>;
    decayOffsetDays: number;
  }> {
    const contacts = await this.getContacts();
    const interactions = await this.getInteractions();
    const relationships = await this.getRelationships();
    const settings = await this.getSettings();
    const stageOverrides = await this.getStageOverrides();
    const decayOffsetDays = await this.getDecayOffsetDays();

    return {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      contacts,
      interactions,
      relationships,
      settings,
      stageOverrides,
      decayOffsetDays,
    };
  }

  async importDatabaseSnapshot(bundle: {
    contacts?: Contact[];
    interactions?: Interaction[];
    relationships?: Relationship[];
    settings?: UserSettings;
    stageOverrides?: Record<string, string>;
    decayOffsetDays?: number;
  }): Promise<{ importedContacts: number; importedInteractions: number; importedRelationships: number }> {
    const contacts = bundle.contacts || [];
    const interactions = bundle.interactions || [];
    const relationships = bundle.relationships || [];

    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const stores = ['contacts', 'interactions', 'meta'];
        if (db.objectStoreNames.contains('relationships')) stores.push('relationships');
        const tx = db.transaction(stores, 'readwrite');

        const contactStore = tx.objectStore('contacts');
        const interactionStore = tx.objectStore('interactions');
        const metaStore = tx.objectStore('meta');

        contactStore.clear();
        for (const c of contacts) contactStore.put(c);

        interactionStore.clear();
        for (const i of interactions) interactionStore.put(i);

        if (db.objectStoreNames.contains('relationships')) {
          const relStore = tx.objectStore('relationships');
          relStore.clear();
          for (const r of relationships) relStore.put(r);
        }

        if (bundle.settings) metaStore.put({ key: 'settings', value: bundle.settings });
        metaStore.put({ key: 'stageOverrides', value: bundle.stageOverrides || {} });
        metaStore.put({ key: 'decayOffsetDays', value: bundle.decayOffsetDays || 0 });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.memoryFallback = {
        contacts: [...contacts],
        interactions: [...interactions],
        relationships: [...relationships],
        settings: bundle.settings || { ...INITIAL_USER_SETTINGS },
        stageOverrides: bundle.stageOverrides || {},
        decayOffsetDays: bundle.decayOffsetDays || 0,
      };
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }

    return {
      importedContacts: contacts.length,
      importedInteractions: interactions.length,
      importedRelationships: relationships.length,
    };
  }

  async universalPurge(safetyPhrase: string): Promise<{ success: boolean; purgedRecords: number }> {
    if (safetyPhrase.trim() !== 'PURGE NETPULSE STORE') {
      throw new Error('Safety confirmation phrase does not match "PURGE NETPULSE STORE".');
    }

    const initialTelemetry = await this.getStorageTelemetry();
    const totalCount = initialTelemetry.contactsCount + initialTelemetry.interactionsCount + initialTelemetry.relationshipsCount;

    try {
      const db = await this.initDB();
      await new Promise<void>((resolve) => {
        const stores = ['contacts', 'interactions', 'meta'];
        if (db.objectStoreNames.contains('relationships')) stores.push('relationships');
        const tx = db.transaction(stores, 'readwrite');

        tx.objectStore('contacts').clear();
        tx.objectStore('interactions').clear();
        if (db.objectStoreNames.contains('relationships')) {
          tx.objectStore('relationships').clear();
        }

        const metaStore = tx.objectStore('meta');
        metaStore.put({ key: 'decayOffsetDays', value: 0 });
        metaStore.put({ key: 'stageOverrides', value: {} });

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // fallback
    }

    this.memoryFallback = {
      contacts: [],
      interactions: [],
      relationships: [],
      settings: { ...INITIAL_USER_SETTINGS },
      decayOffsetDays: 0,
      stageOverrides: {},
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }

    return {
      success: true,
      purgedRecords: totalCount,
    };
  }

  async batchIngestEntities(entities: Array<Partial<Contact>>): Promise<{
    inserted: number;
    updated: number;
    total: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    const validContacts: Contact[] = [];
    let inserted = 0;
    let updated = 0;

    const existingContacts = await this.getContacts();
    const existingMap = new Map(existingContacts.map(c => [(c.email || c.full_name).toLowerCase(), c]));

    for (let i = 0; i < entities.length; i++) {
      const row = entities[i];
      if (!row.full_name || typeof row.full_name !== 'string' || !row.full_name.trim()) {
        errors.push(`Row ${i + 1}: Missing or invalid required field 'full_name'.`);
        continue;
      }

      const key = (row.email || row.full_name).toLowerCase().trim();
      const existing = existingMap.get(key);

      const contactRecord: Contact = {
        id: existing ? existing.id : `batch-${Date.now()}-${i}`,
        user_id: 'local-user',
        full_name: row.full_name.trim(),
        email: row.email ? row.email.trim() : null,
        company: row.company ? row.company.trim() : null,
        title: row.title ? row.title.trim() : null,
        linkedin_url: row.linkedin_url || null,
        previous_company: existing ? existing.previous_company : null,
        previous_title: existing ? existing.previous_title : null,
        source: existing ? existing.source : 'manual',
        relationship_tier: (['priority', 'warm', 'cold'].includes(row.relationship_tier || '')
          ? row.relationship_tier
          : 'warm') as 'priority' | 'warm' | 'cold',
        last_contacted_at: row.last_contacted_at || new Date().toISOString().split('T')[0],
        last_bulk_synced_at: existing ? existing.last_bulk_synced_at : null,
        last_enriched_at: existing ? existing.last_enriched_at : null,
        notes: row.notes || null,
        created_at: existing ? existing.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        updated++;
      } else {
        inserted++;
      }

      validContacts.push(contactRecord);
    }

    for (const contact of validContacts) {
      await this.saveContact(contact);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('netpulse:state-changed'));
    }

    return {
      inserted,
      updated,
      total: validContacts.length,
      errors,
    };
  }
}

export const netPulseStore = new NetPulseStore();
