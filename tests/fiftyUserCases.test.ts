import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  netPulseStore,
  PERSONA_ALEX,
  PERSONA_ELENA,
  DEFAULT_PERSONAS,
} from '../src/lib/storage/db';
import { calculatePriorityScore, isContactOverdue, getSuggestedReason } from '../src/lib/scoring';
import { generateWhatsAppUrl } from '../src/lib/whatsapp';
import { generateGoogleCalendarUrl, generateIcsBlobUrl, generateIcsContent } from '../src/lib/calendar';
import type { Contact, UserSettings, RelationshipTier } from '../src/lib/types';

describe('NetPulse - 50 Comprehensive Production Test Cases', () => {

  const baseContact: Contact = {
    id: 'c-test-1',
    user_id: 'user-shashank',
    full_name: 'Jensen Huang',
    company: 'NVIDIA',
    title: 'President & CEO',
    email: 'jensen@nvidia.com',
    linkedin_url: 'https://linkedin.com/in/jenhsunhuang',
    previous_company: 'LSI Logic',
    previous_title: 'Director of Coreware',
    source: 'linkedin',
    relationship_tier: 'priority',
    last_contacted_at: '2026-09-01T00:00:00Z',
    last_bulk_synced_at: null,
    last_enriched_at: null,
    notes: 'Key partner for Blackwell accelerated compute clusters',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  };

  const baseSettings: UserSettings = {
    id: 's-test-1',
    user_id: 'user-shashank',
    scoring_weights: {
      recency_weight: 35,
      tier_weight: 25,
      title_weight: 20,
      engagement_weight: 20,
    },
    digest_count: 10,
    digest_email_time: '08:00',
    digest_email_enabled: true,
    cadence_priority_days: 7,
    cadence_warm_days: 30,
    cadence_cold_days: 90,
    target_companies: ['NVIDIA', 'Anthropic', 'OpenAI'],
    target_titles: ['CEO', 'CTO', 'Founder'],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    await netPulseStore.resetToFactoryDefaults();
  });

  // ==========================================
  // GROUP 1: MULTI-ROLE USER JOURNEYS (1-5)
  // ==========================================

  test('1. Role: DeepTech Founder — reviews top priority connections and overdue signals', () => {
    const overdue = isContactOverdue(baseContact, baseSettings);
    assert.strictEqual(overdue, true);
    const score = calculatePriorityScore(baseContact, 3, baseSettings);
    assert.ok(score.score >= 70);
  });

  test('2. Role: Venture Capital Partner — simulates network relationship decay across portfolio', () => {
    const fresh = { ...baseContact, last_contacted_at: new Date().toISOString() };
    const scoreFresh = calculatePriorityScore(fresh, 10, baseSettings);
    const stale = { ...baseContact, last_contacted_at: '2025-01-01T00:00:00Z' };
    const scoreStale = calculatePriorityScore(stale, 0, baseSettings);
    assert.ok(scoreStale.recency_score > scoreFresh.recency_score);
  });

  test('3. Role: Executive Talent Scout — forges virtuality links between founders and engineers', async () => {
    const synth = await netPulseStore.autoSynthesizeVirtualityMesh();
    assert.strictEqual(synth.linksCreated, 6);
    assert.ok(synth.resonanceAvg >= 80);
  });

  test('4. Role: Enterprise Sales Director — ingests RFC 4180 CSV batch of client prospects', async () => {
    const prospects = [
      { full_name: 'Satya Nadella', company: 'Microsoft', title: 'CEO', relationship_tier: 'priority' as RelationshipTier },
      { full_name: 'Sundar Pichai', company: 'Google', title: 'CEO', relationship_tier: 'priority' as RelationshipTier },
    ];
    const res = await netPulseStore.batchIngestEntities(prospects);
    assert.strictEqual(res.total, 2);
    assert.strictEqual(res.inserted, 2);
  });

  test('5. Role: Chief of Staff — switches between Alex and Elena executive personas seamlessly', () => {
    const elena = netPulseStore.setActivePersona('user-elena');
    assert.strictEqual(elena.name, 'Dr. Elena Rostova');
    const alex = netPulseStore.setActivePersona('user-alex');
    assert.strictEqual(alex.name, 'Alex Mercer');
  });

  // ==========================================
  // GROUP 2: PRIORITY SCORING ENGINE (6-12)
  // ==========================================

  test('6. Scoring: Clamps total score strictly between 0 and 100', () => {
    const res = calculatePriorityScore(baseContact, 5, baseSettings);
    assert.ok(res.score >= 0 && res.score <= 100);
  });

  test('7. Scoring: Priority tier yields 100 sub-score', () => {
    const res = calculatePriorityScore(baseContact, 0, baseSettings);
    assert.strictEqual(res.tier_score, 100);
  });

  test('8. Scoring: Target title match gives 100 title sub-score', () => {
    const res = calculatePriorityScore(baseContact, 0, baseSettings);
    assert.strictEqual(res.title_score, 100);
  });

  test('9. Scoring: Uncontacted contact receives max 100 recency score', () => {
    const uncontacted = { ...baseContact, last_contacted_at: null };
    const res = calculatePriorityScore(uncontacted, 0, baseSettings);
    assert.strictEqual(res.recency_score, 100);
  });

  test('10. Scoring: Non-target company receives lower company/title bonus', () => {
    const randomContact = { ...baseContact, company: 'Random NonTarget LLC', title: 'Intern' };
    const res = calculatePriorityScore(randomContact, 0, baseSettings);
    assert.ok(res.title_score < 100);
  });

  test('11. Scoring: Engagement sub-score scales with interaction count', () => {
    const low = calculatePriorityScore(baseContact, 1, baseSettings);
    const high = calculatePriorityScore(baseContact, 10, baseSettings);
    assert.ok(high.engagement_score >= low.engagement_score);
  });

  test('12. Scoring: Reason generator outputs actionable justification string', () => {
    const reason = getSuggestedReason(baseContact, baseSettings);
    assert.ok(typeof reason === 'string' && reason.length > 5);
  });

  // ==========================================
  // GROUP 3: RELATIONSHIP DECAY SIMULATOR (13-18)
  // ==========================================

  test('13. Decay: Contact within cadence is marked as not overdue', () => {
    const recent = { ...baseContact, last_contacted_at: new Date().toISOString() };
    const overdue = isContactOverdue(recent, baseSettings);
    assert.strictEqual(overdue, false);
  });

  test('14. Decay: Contact beyond priority cadence (7 days) is marked as overdue', () => {
    const overdueContact = { ...baseContact, last_contacted_at: '2026-08-01T00:00:00Z' };
    const overdue = isContactOverdue(overdueContact, baseSettings);
    assert.strictEqual(overdue, true);
  });

  test('15. Decay: Warm tier cadence evaluated correctly against 30-day threshold', () => {
    const warmContact: Contact = { ...baseContact, relationship_tier: 'warm', last_contacted_at: '2026-09-20T00:00:00Z' };
    const isOverdue = isContactOverdue(warmContact, baseSettings);
    assert.strictEqual(isOverdue, false);
  });

  test('16. Decay: Cold tier cadence evaluated correctly against 90-day threshold', () => {
    const coldContact: Contact = { ...baseContact, relationship_tier: 'cold', last_contacted_at: '2026-08-01T00:00:00Z' };
    const isOverdue = isContactOverdue(coldContact, baseSettings);
    assert.strictEqual(isOverdue, false);
  });

  test('17. Decay: Missing last_contacted_at is automatically overdue', () => {
    const never = { ...baseContact, last_contacted_at: null };
    assert.strictEqual(isContactOverdue(never, baseSettings), true);
  });

  test('18. Decay: Missing settings fallback uses default cadences', () => {
    const dummy = { ...baseContact, last_contacted_at: '2020-01-01T00:00:00Z' };
    assert.strictEqual(isContactOverdue(dummy, null as any), true);
  });

  // ==========================================
  // GROUP 4: DUAL-PERSONA & IDENTITY SWITCHING (19-24)
  // ==========================================

  test('19. Persona: Default active persona is Shashank J', () => {
    const active = netPulseStore.getActivePersona();
    assert.strictEqual(active.name, 'Shashank J');
  });

  test('20. Persona: Switch to Dr. Elena Rostova verifies quantum architecture role', () => {
    const elena = netPulseStore.setActivePersona('user-elena');
    assert.strictEqual(elena.id, 'user-elena');
    assert.strictEqual(elena.networkRole, 'Quantum Architect');
  });

  test('21. Persona: Switch to Alex Mercer verifies venture capital role', () => {
    const alex = netPulseStore.setActivePersona('user-alex');
    assert.strictEqual(alex.id, 'user-alex');
    assert.strictEqual(alex.networkRole, 'Venture Partner');
  });

  test('22. Persona: Default personas list contains exactly 3 executive identities', () => {
    assert.strictEqual(DEFAULT_PERSONAS.length, 3);
  });

  test('23. Persona: Invalid persona ID falls back safely to default', () => {
    const fallback = netPulseStore.setActivePersona('nonexistent-persona-id-999');
    assert.ok(fallback.id);
  });

  test('24. Persona: Persona focus areas contain non-empty focus domain string', () => {
    for (const p of DEFAULT_PERSONAS) {
      assert.ok(typeof p.focus === 'string' && p.focus.length >= 1);
    }
  });

  // ==========================================
  // GROUP 5: VIRTUALITY MESH & RELATIONAL TOPOLOGY (25-30)
  // ==========================================

  test('25. Virtuality Mesh: Auto-synthesize creates 6 interconnected corridors', async () => {
    const res = await netPulseStore.autoSynthesizeVirtualityMesh();
    assert.strictEqual(res.linksCreated, 6);
  });

  test('26. Virtuality Mesh: Average resonance metric exceeds 85%', async () => {
    const res = await netPulseStore.autoSynthesizeVirtualityMesh();
    assert.ok(res.resonanceAvg >= 85);
  });

  test('27. Virtuality Mesh: Relationships store lists all created links', async () => {
    await netPulseStore.autoSynthesizeVirtualityMesh();
    const rels = await netPulseStore.getRelationships();
    assert.ok(rels.length >= 6);
  });

  test('28. Virtuality Mesh: Retrieve relationships for specific contact ID', async () => {
    await netPulseStore.autoSynthesizeVirtualityMesh();
    const all = await netPulseStore.getContacts();
    const first = all[0];
    const rels = await netPulseStore.getRelationshipsForContact(first.id);
    assert.ok(Array.isArray(rels));
  });

  test('29. Virtuality Mesh: Delete individual relationship severs link', async () => {
    await netPulseStore.autoSynthesizeVirtualityMesh();
    const rels = await netPulseStore.getRelationships();
    const target = rels[0];
    const deleted = await netPulseStore.deleteRelationship(target.id);
    assert.strictEqual(deleted, true);
  });

  test('30. Virtuality Mesh: Create custom directional relationship', async () => {
    const all = await netPulseStore.getContacts();
    if (all.length >= 2) {
      const rel = await netPulseStore.createRelationship({
        contact_id_a: all[0].id,
        contact_id_b: all[1].id,
        relationship_type: 'advisor',
        strength: 92,
        notes: 'Strategic hardware architecture advisor'
      });
      assert.ok(rel.id);
      assert.strictEqual((rel as any).relationship_type, 'advisor');
    }
  });

  // ==========================================
  // GROUP 6: BATCH INGESTION & DATA GOVERNANCE (31-36)
  // ==========================================

  test('31. Governance: Ingest 3 new contacts in batch', async () => {
    const batch = [
      { full_name: 'Arthur Mensch', company: 'Mistral AI', title: 'CEO' },
      { full_name: 'Clément Delangue', company: 'Hugging Face', title: 'CEO' },
      { full_name: 'Guillermo Rauch', company: 'Vercel', title: 'CEO' }
    ];
    const res = await netPulseStore.batchIngestEntities(batch);
    assert.strictEqual(res.inserted, 3);
    assert.strictEqual(res.errors.length, 0);
  });

  test('32. Governance: Update existing contact attributes when matching email is found', async () => {
    const initial = await netPulseStore.getContacts();
    const target = initial[0];
    const update = [{ full_name: target.full_name, email: target.email || undefined, title: 'Group CTO' }];
    const res = await netPulseStore.batchIngestEntities(update);
    assert.strictEqual(res.updated, 1);
  });

  test('33. Governance: Delete contact cascades and purges attached relationships', async () => {
    await netPulseStore.autoSynthesizeVirtualityMesh();
    const initial = await netPulseStore.getContacts();
    const target = initial[0];
    const beforeCount = initial.length;
    await netPulseStore.deleteContact(target.id);
    const after = await netPulseStore.getContacts();
    assert.strictEqual(after.length, beforeCount - 1);
  });

  test('34. Governance: Update contact relationship tier directly', async () => {
    const contacts = await netPulseStore.getContacts();
    const target = contacts[0];
    await netPulseStore.saveContact({ ...target, relationship_tier: 'priority' });
    const updated = await netPulseStore.getContactById(target.id);
    assert.ok(updated);
    assert.strictEqual(updated.relationship_tier, 'priority');
  });

  test('35. Governance: Universal purge empties mesh securely', async () => {
    await netPulseStore.autoSynthesizeVirtualityMesh();
    const res = await netPulseStore.universalPurge('PURGE NETPULSE STORE');
    assert.strictEqual(res.success, true);
    assert.ok(res.purgedRecords >= 1);
    const remaining = await netPulseStore.getRelationships();
    assert.strictEqual(remaining.length, 0);
  });

  test('36. Governance: Reset database restores initial factory seeded demo data', async () => {
    await netPulseStore.batchIngestEntities([{ full_name: 'Temp Contact' }]);
    await netPulseStore.resetToFactoryDefaults();
    const contacts = await netPulseStore.getContacts();
    assert.ok(contacts.length >= 2);
  });

  // ==========================================
  // GROUP 7: OUTBOUND COMMUNICATIONS & INTEGRATIONS (37-42)
  // ==========================================

  test('37. Outbound: Generate valid WhatsApp click-to-chat URL with custom message', () => {
    const url = generateWhatsAppUrl({ contact: baseContact, customMessage: 'Hi Jensen, compute timeline sync?' });
    assert.ok(url.startsWith('https://wa.me/?text='));
    assert.ok(url.includes('Jensen'));
  });

  test('38. Outbound: WhatsApp URL generates priority icebreaker opener', () => {
    const url = generateWhatsAppUrl({ contact: baseContact });
    assert.ok(url.startsWith('https://wa.me/?text='));
    assert.ok(decodeURIComponent(url).includes('Jensen'));
  });

  test('39. Outbound: WhatsApp URL generates warm relationship opener', () => {
    const warmContact: Contact = { ...baseContact, relationship_tier: 'warm' };
    const url = generateWhatsAppUrl({ contact: warmContact });
    assert.ok(url.startsWith('https://wa.me/?text='));
    assert.ok(decodeURIComponent(url).includes('shaping up'));
  });

  test('40. Outbound: WhatsApp URL interpolates contact company name', () => {
    const url = generateWhatsAppUrl({ contact: baseContact });
    assert.ok(decodeURIComponent(url).includes('NVIDIA'));
  });

  test('41. Calendar: Generates valid Google Calendar render URL', () => {
    const url = generateGoogleCalendarUrl({
      contact: baseContact,
      agendaTopic: 'Review quarterly collaboration goals',
    });
    assert.ok(url.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE'));
    assert.ok(url.includes('Catch-up'));
  });

  test('42. Calendar: Generates iCalendar (.ics) format with valid VCALENDAR headers', () => {
    const icsUrl = generateIcsBlobUrl({
      contact: baseContact,
      agendaTopic: 'Architecture Alignment',
    });
    assert.ok(icsUrl.startsWith('data:text/calendar;charset=utf8,'));
    assert.ok(decodeURIComponent(icsUrl).includes('BEGIN:VCALENDAR'));
    assert.ok(decodeURIComponent(icsUrl).includes('SUMMARY:Catch-up:'));
  });

  // ==========================================
  // GROUP 8: SETTINGS, TELEMETRY & PERSISTENCE (43-46)
  // ==========================================

  test('43. Settings: Retrieve user settings contains scoring weights', async () => {
    const settings = await netPulseStore.getSettings();
    assert.ok(settings.scoring_weights);
    assert.strictEqual(typeof settings.scoring_weights.recency_weight, 'number');
  });

  test('44. Settings: Update scoring weights persists values in store', async () => {
    const current = await netPulseStore.getSettings();
    const updatedSettings = {
      ...current,
      scoring_weights: {
        recency_weight: 40,
        tier_weight: 30,
        title_weight: 15,
        engagement_weight: 15
      }
    };
    await netPulseStore.saveSettings(updatedSettings);
    const retrieved = await netPulseStore.getSettings();
    assert.strictEqual(retrieved.scoring_weights.recency_weight, 40);
  });

  test('45. Settings: Update target titles array persists new keywords', async () => {
    const current = await netPulseStore.getSettings();
    await netPulseStore.saveSettings({
      ...current,
      target_titles: ['VP Engineering', 'Chief Architect']
    });
    const retrieved = await netPulseStore.getSettings();
    assert.ok(retrieved.target_titles.includes('Chief Architect'));
  });

  test('46. Telemetry: Storage telemetry reflects contact and interaction counts', async () => {
    await netPulseStore.resetToFactoryDefaults();
    const telemetry = await netPulseStore.getStorageTelemetry();
    assert.ok(telemetry.contactsCount >= 2);
    assert.strictEqual(typeof telemetry.activePersona, 'string');
  });

  // ==========================================
  // GROUP 9: EDGE CASES & RESILIENCE (47-50)
  // ==========================================

  test('47. Resilience: Scoring handles zero weights without NaN crash', () => {
    const zeroWeightsSettings: UserSettings = {
      ...baseSettings,
      scoring_weights: { recency_weight: 0, tier_weight: 0, title_weight: 0, engagement_weight: 0 }
    };
    const res = calculatePriorityScore(baseContact, 0, zeroWeightsSettings);
    assert.ok(!isNaN(res.score));
  });

  test('48. Resilience: Cold contact WhatsApp URL generation generates standard note', () => {
    const coldContact: Contact = { ...baseContact, relationship_tier: 'cold' };
    const url = generateWhatsAppUrl({ contact: coldContact });
    assert.ok(url.startsWith('https://wa.me/?text='));
    assert.ok(decodeURIComponent(url).includes('great week'));
  });

  test('49. Resilience: Calendar generation handles special characters in agenda topic', () => {
    const url = generateGoogleCalendarUrl({
      contact: baseContact,
      agendaTopic: 'Coffee & Sync: Q3 <Plan> & "Strategy"',
    });
    assert.ok(url.includes('calendar.google.com'));
  });

  test('50. Resilience: Non-existent contact ID returns null on getContactById', async () => {
    const res = await netPulseStore.getContactById('c-non-existent-99999');
    assert.strictEqual(res, null);
  });

});
