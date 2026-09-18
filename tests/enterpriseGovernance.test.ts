// ═══════════════════════════════════════════════════════
// Automated Test Suite: Enterprise Data Governance, Batch Ingestion & Quota Mesh
// NetPlus / NetPulse CRM Enterprise V5.0 Carrier-Grade Standard
// ═══════════════════════════════════════════════════════

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { netPulseStore } from '../src/lib/storage/db';
import type { Contact, RelationshipTier } from '../src/lib/types';

describe('Enterprise Data Governance & Batch Ingestion Suite', () => {
  beforeEach(async () => {
    // Reset database to clean factory demo baseline
    await netPulseStore.resetToFactoryDefaults();
  });

  test('1. Batch Ingestion — Ingests 5 new contacts with RFC 4180 style fields', async () => {
    const rawEntities: Array<Partial<Contact>> = [
      { full_name: 'Jensen Huang', email: 'jensen@nvidia.com', company: 'NVIDIA', title: 'President & CEO', relationship_tier: 'priority' },
      { full_name: 'Mira Murati', email: 'mira@thinkingmachines.ai', company: 'Thinking Machines', title: 'Founder & CEO', relationship_tier: 'priority' },
      { full_name: 'Andrej Karpathy', email: 'andrej@eurekalabs.ai', company: 'Eureka Labs', title: 'Founder', relationship_tier: 'priority' },
      { full_name: 'Nat Friedman', email: 'nat@aigrant.org', company: 'AI Grant', title: 'General Partner', relationship_tier: 'priority' },
      { full_name: 'Daniel Gross', email: 'daniel@pioneer.fund', company: 'Pioneer Fund', title: 'Co-Founder', relationship_tier: 'priority' },
    ];

    const result = await netPulseStore.batchIngestEntities(rawEntities);
    assert.equal(result.total, 5);
    assert.ok(result.inserted >= 1);
    assert.equal(result.errors.length, 0);

    const allContacts = await netPulseStore.getContacts();
    const foundJensen = allContacts.find(c => c.full_name === 'Jensen Huang');
    assert.ok(foundJensen);
    assert.equal(foundJensen.company, 'NVIDIA');
    assert.equal(foundJensen.relationship_tier, 'priority');
  });

  test('2. Batch Ingestion — Updates existing contact if duplicate email/name is encountered', async () => {
    const initialContacts = await netPulseStore.getContacts();
    const target = initialContacts[0];
    assert.ok(target);

    const updatePayload: Array<Partial<Contact>> = [
      {
        full_name: target.full_name,
        email: target.email || undefined,
        company: 'Updated Enterprise Labs',
        title: 'Chief Technology Officer',
        relationship_tier: 'priority',
      },
    ];

    const result = await netPulseStore.batchIngestEntities(updatePayload);
    assert.equal(result.total, 1);
    assert.equal(result.updated, 1);
    assert.equal(result.inserted, 0);

    const refreshed = await netPulseStore.getContactById(target.id);
    assert.ok(refreshed);
    assert.equal(refreshed.company, 'Updated Enterprise Labs');
    assert.equal(refreshed.title, 'Chief Technology Officer');
  });

  test('3. Batch Ingestion — Rejects malformed records without full_name gracefully', async () => {
    const malformed = [
      { company: 'Ghost Inc', title: 'Unknown' }, // missing full_name
      { full_name: 'Valid Leader', company: 'Real Co', relationship_tier: 'warm' },
    ];

    const result = await netPulseStore.batchIngestEntities(malformed as any);
    assert.equal(result.total, 1);
    assert.equal(result.errors.length, 1);
    assert.ok(result.errors[0].includes("Missing or invalid required field 'full_name'"));

    const all = await netPulseStore.getContacts();
    assert.ok(all.some(c => c.full_name === 'Valid Leader'));
  });

  test('4. Storage Telemetry — Computes contact counts, interaction counts, and quota byte usage', async () => {
    const telemetry = await netPulseStore.getStorageTelemetry();
    assert.ok(telemetry.contactsCount >= 5);
    assert.ok(telemetry.interactionsCount >= 1);
    assert.ok(telemetry.relationshipsCount >= 1);
    assert.ok(telemetry.estimatedBytes > 500);
    assert.equal(typeof telemetry.activePersona, 'string');
  });

  test('5. Database Snapshot — Exports complete structured JSON bundle with version and entity arrays', async () => {
    const snapshot = await netPulseStore.exportDatabaseSnapshot();
    assert.ok(snapshot.version >= 4);
    assert.ok(snapshot.exportedAt);
    assert.ok(Array.isArray(snapshot.contacts));
    assert.ok(Array.isArray(snapshot.interactions));
    assert.ok(Array.isArray(snapshot.relationships));
    assert.ok(snapshot.settings);
    assert.equal(typeof snapshot.decayOffsetDays, 'number');
  });

  test('6. Database Snapshot — Imports snapshot bundle and replaces database contents', async () => {
    const customContact: Contact = {
      id: 'custom-backup-1',
      user_id: 'local-user',
      full_name: 'Quantum Traveler',
      email: 'traveler@multiverse.org',
      company: 'Multiverse Corp',
      title: 'Temporal Architect',
      linkedin_url: null,
      previous_company: null,
      previous_title: null,
      source: 'manual',
      relationship_tier: 'priority',
      last_contacted_at: '2026-07-01',
      last_bulk_synced_at: null,
      last_enriched_at: null,
      notes: 'Imported from temporal snapshot',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const importBundle = {
      contacts: [customContact],
      interactions: [],
      relationships: [],
      decayOffsetDays: 15,
    };

    const importResult = await netPulseStore.importDatabaseSnapshot(importBundle);
    assert.equal(importResult.importedContacts, 1);

    const activeContacts = await netPulseStore.getContacts();
    assert.equal(activeContacts.length, 1);
    assert.equal(activeContacts[0].full_name, 'Quantum Traveler');

    const offset = await netPulseStore.getDecayOffsetDays();
    assert.equal(offset, 15);
  });

  test('7. Universal Cascading Purge — Rejects invalid confirmation phrase', async () => {
    await assert.rejects(
      async () => {
        await netPulseStore.universalPurge('DELETE ALL');
      },
      {
        message: 'Safety confirmation phrase does not match "PURGE NETPULSE STORE".',
      }
    );
  });

  test('8. Universal Cascading Purge — Completely purges contacts, interactions, and relationships upon valid phrase', async () => {
    const purgeResult = await netPulseStore.universalPurge('PURGE NETPULSE STORE');
    assert.equal(purgeResult.success, true);
    assert.ok(purgeResult.purgedRecords > 0);

    const telem = await netPulseStore.getStorageTelemetry();
    assert.equal(telem.contactsCount, 0);
    assert.equal(telem.interactionsCount, 0);
    assert.equal(telem.relationshipsCount, 0);
  });

  test('9. Factory Benchmark Reset — Repopulates standard Silicon Valley demo roster after purge', async () => {
    await netPulseStore.universalPurge('PURGE NETPULSE STORE');
    const emptyTelem = await netPulseStore.getStorageTelemetry();
    assert.equal(emptyTelem.contactsCount, 0);

    await netPulseStore.resetToBaseline();
    const restoredTelem = await netPulseStore.getStorageTelemetry();
    assert.ok(restoredTelem.contactsCount >= 5);
    assert.ok(restoredTelem.interactionsCount >= 1);
    assert.ok(restoredTelem.relationshipsCount >= 1);
  });

  test('10. Pipeline Stage Transitions — Updates and persists contact stage overrides', async () => {
    const contacts = await netPulseStore.getContacts();
    const firstContact = contacts[0];
    assert.ok(firstContact);

    await netPulseStore.updateContactStage(firstContact.id, 'anchor');
    const overrides = await netPulseStore.getStageOverrides();
    assert.equal(overrides[firstContact.id], 'anchor');

    await netPulseStore.updateContactStage(firstContact.id, 'meeting');
    const updatedOverrides = await netPulseStore.getStageOverrides();
    assert.equal(updatedOverrides[firstContact.id], 'meeting');
  });

  test('11. Touchpoint Logging — MarkContacted updates last_contacted_at and appends interaction log', async () => {
    const contacts = await netPulseStore.getContacts();
    const contact = contacts[0];
    assert.ok(contact);

    const initialInteractions = await netPulseStore.getInteractions(contact.id);
    const initialCount = initialInteractions.length;

    await netPulseStore.markContacted(contact.id);

    const updated = await netPulseStore.getContactById(contact.id);
    assert.ok(updated);
    const today = new Date().toISOString().split('T')[0];
    assert.equal(updated.last_contacted_at, today);

    const postInteractions = await netPulseStore.getInteractions(contact.id);
    assert.equal(postInteractions.length, initialCount + 1);
  });

  test('12. Cascading Contact Deletion — Dropping a contact removes connected relationships and interactions', async () => {
    const contacts = await netPulseStore.getContacts();
    const victim = contacts[0];
    assert.ok(victim);

    await netPulseStore.deleteContact(victim.id);

    const remaining = await netPulseStore.getContacts();
    assert.ok(!remaining.some(c => c.id === victim.id));

    const interactions = await netPulseStore.getInteractions(victim.id);
    assert.equal(interactions.length, 0);

    const rels = await netPulseStore.getRelationships(victim.id);
    assert.equal(rels.length, 0);
  });
});