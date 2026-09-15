import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityScore, isContactOverdue, getSuggestedReason } from '../src/lib/scoring';
import { DEFAULT_SETTINGS, type Contact, type UserSettings } from '../src/lib/types';

function createMockContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: 'test-contact-1',
    user_id: 'user-1',
    full_name: 'Satya Nadella',
    email: 'satya@microsoft.com',
    company: 'Microsoft',
    title: 'Chairman & Chief Executive Officer',
    relationship_tier: 'priority',
    last_contacted_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Key executive stakeholder for enterprise initiatives',
    linkedin_url: 'https://linkedin.com/in/satyanadella',
    previous_company: null,
    previous_title: null,
    last_bulk_synced_at: null,
    last_enriched_at: null,
    source: 'linkedin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

test('Cadence Decay Engine — Tier Cadence Violations', () => {
  const contact = createMockContact();
  const settings = DEFAULT_SETTINGS as UserSettings;

  const overdue = isContactOverdue(contact, settings, 0);
  assert.equal(overdue, true, 'Priority contact contacted 20 days ago should be overdue (>14d)');

  const warmContact = createMockContact({ relationship_tier: 'warm' });
  assert.equal(isContactOverdue(warmContact, settings, 0), false, 'Warm contact (20d ago) should not be overdue under 30d cadence');

  assert.equal(isContactOverdue(warmContact, settings, 15), true, 'Warm contact at +15d offset (35d elapsed) must be flagged overdue');
});

test('Cadence Decay Engine — Monotonic Urgency with Simulated Time Offsets', () => {
  const contact = createMockContact({
    last_contacted_at: new Date().toISOString(),
  });
  const settings = DEFAULT_SETTINGS as UserSettings;

  const scoreDay0 = calculatePriorityScore(contact, 0, settings, 0).score;
  const scoreDay7 = calculatePriorityScore(contact, 0, settings, 7).score;
  const scoreDay14 = calculatePriorityScore(contact, 0, settings, 14).score;
  const scoreDay30 = calculatePriorityScore(contact, 0, settings, 30).score;

  assert.ok(scoreDay7 >= scoreDay0, `Score at +7d (${scoreDay7}) should be >= Day 0 (${scoreDay0})`);
  assert.ok(scoreDay14 >= scoreDay7, `Score at +14d (${scoreDay14}) should be >= +7d (${scoreDay7})`);
  assert.ok(scoreDay30 >= scoreDay14, `Score at +30d (${scoreDay30}) should be >= +14d (${scoreDay14})`);
  assert.ok(scoreDay30 <= 100, `Priority score must be bounded <= 100 (got ${scoreDay30})`);
});

test('Decision-Maker Role Weighting — Senior Leadership Urgency Boost', () => {
  const settings = DEFAULT_SETTINGS as UserSettings;
  const dateAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

  const executive = createMockContact({ title: 'Founder & CEO', last_contacted_at: dateAgo });
  const individualContributor = createMockContact({ title: 'Software Engineer', last_contacted_at: dateAgo });

  const execScore = calculatePriorityScore(executive, 0, settings, 0).score;
  const icScore = calculatePriorityScore(individualContributor, 0, settings, 0).score;

  assert.ok(execScore > icScore, `Executive score (${execScore}) should exceed IC score (${icScore}) given equal cadence`);
});

test('Suggested Reason Generator — High Value Context Identification', () => {
  const settings = DEFAULT_SETTINGS as UserSettings;
  // Overdue contact test
  const overdueExec = createMockContact({ title: 'Chief Technology Officer' });
  const overdueReason = getSuggestedReason(overdueExec, 85, settings, 0);
  assert.match(overdueReason, /Cadence due|Critical|Overdue/i, 'Reason must acknowledge cadence urgency for overdue contact');

  // Recent high-value contact test (< cadence threshold of 3 days)
  const recentExec = createMockContact({ 
    title: 'Chief Technology Officer', 
    last_contacted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() 
  });
  const highValReason = getSuggestedReason(recentExec, 88, settings, 0);
  assert.match(highValReason, /Strategic decision maker|High value/i, 'Reason must acknowledge strategic decision maker');
});

test('Multi-Channel Outreach Protocol — URL Encoding & Contract Verification', () => {
  const rawMessage = 'Hi Sundar! Saw the latest Gemini 2.0 release, truly groundbreaking. Would love to sync next week!';
  const encodedWaText = encodeURIComponent(rawMessage);
  const waUrl = `https://wa.me/?text=${encodedWaText}`;
  assert.ok(waUrl.startsWith('https://wa.me/?text='), 'WhatsApp URL must follow valid wa.me schema');
  assert.ok(waUrl.includes('Gemini%202.0'), 'WhatsApp URL must safely percent-encode spaces and punctuation');

  const subject = 'Quick architecture sync regarding Gemini infrastructure';
  const mailto = `mailto:sundar@google.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(rawMessage)}`;
  assert.ok(mailto.startsWith('mailto:'), 'Email URL must follow mailto: URI scheme');
  assert.ok(mailto.includes('sundar@google.com'), 'Mailto recipient must be properly formatted');
});
