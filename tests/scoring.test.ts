import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityScore, isContactOverdue, getSuggestedReason } from '../src/lib/scoring';
import type { Contact, UserSettings } from '../src/lib/types';

const mockContact: Contact = {
  id: 'c1',
  user_id: 'u1',
  full_name: 'Jane Doe',
  company: 'Acme Corp',
  title: 'CTO',
  email: 'jane@acme.com',
  linkedin_url: 'https://linkedin.com/in/janedoe',
  previous_company: null,
  previous_title: null,
  source: 'linkedin',
  relationship_tier: 'priority',
  last_contacted_at: '2026-08-01T00:00:00Z',
  last_bulk_synced_at: null,
  last_enriched_at: null,
  notes: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-08-01T00:00:00Z',
};

const mockSettings: UserSettings = {
  id: 's1',
  user_id: 'u1',
  scoring_weights: {
    recency_weight: 35,
    tier_weight: 25,
    title_weight: 20,
    engagement_weight: 20,
  },
  digest_count: 12,
  digest_email_time: '08:00',
  digest_email_enabled: false,
  cadence_priority_days: 3,
  cadence_warm_days: 30,
  cadence_cold_days: 90,
  target_companies: ['Acme Corp'],
  target_titles: ['CTO', 'Founder'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

test('Priority Score Calculation — Standard Case', () => {
  const result = calculatePriorityScore(mockContact, 5, mockSettings);
  assert.ok(result.score >= 0 && result.score <= 100, 'Score must be clamped between 0 and 100');
  assert.equal(result.tier_score, 100, 'Priority tier gets 100 tier sub-score');
  assert.equal(result.title_score, 100, 'Matching target title gets 100 title sub-score');
});

test('Priority Score Calculation — Never Contacted (Max Urgency)', () => {
  const neverContacted = { ...mockContact, last_contacted_at: null };
  const result = calculatePriorityScore(neverContacted, 0, mockSettings);
  assert.equal(result.recency_score, 100, 'Uncontacted contacts should get max recency score');
  assert.ok(result.score > 50, 'Overall score should reflect high urgency');
});

test('Priority Score Calculation — Future Scheduled Date Edge Case', () => {
  const futureContact = { ...mockContact, last_contacted_at: '2099-01-01T00:00:00Z' };
  const result = calculatePriorityScore(futureContact, 2, mockSettings);
  assert.equal(result.recency_score, 0, 'Future scheduled contact gets 0 recency urgency');
});

test('isContactOverdue — Tier Cadence Thresholds', () => {
  const overdueContact = { ...mockContact, last_contacted_at: '2026-08-01T00:00:00Z', relationship_tier: 'priority' as const };
  assert.equal(isContactOverdue(overdueContact, mockSettings), true, 'Contact uncontacted past cadence should be overdue');
});

test('getSuggestedReason — Decision-Maker Identification', () => {
  const reason = getSuggestedReason(mockContact, 85, mockSettings);
  assert.ok(reason.length > 0, 'Reason string should not be empty');
});
