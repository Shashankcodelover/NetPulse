import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLinkedInCSV, detectChanges } from '../src/lib/csv-parser';
import type { Contact } from '../src/lib/types';

test('detecting changes between existing and incoming contact', () => {
  const existing: Pick<Contact, 'full_name' | 'company' | 'title'> = {
    full_name: 'Alex Mercer',
    company: 'Old Corp',
    title: 'Senior Engineer',
  };

  const incoming = {
    full_name: 'Alex Mercer',
    email: 'alex@newcorp.com',
    company: 'New Horizon AI',
    title: 'VP of AI Engineering',
    linkedin_url: 'https://linkedin.com/in/alex',
    connected_on: '2026-05-10',
  };

  const diff = detectChanges(existing, incoming);
  assert.equal(diff.changed, true, 'Should detect company and title changes');
  assert.equal(diff.changes.length, 2, 'Should identify exactly 2 field changes');
  assert.ok(diff.changes[0].includes('Company'), 'First change should mention Company');
  assert.ok(diff.changes[1].includes('Title'), 'Second change should mention Title');
});

test('detecting no changes when incoming matches existing', () => {
  const existing: Pick<Contact, 'full_name' | 'company' | 'title'> = {
    full_name: 'Sarah Connor',
    company: 'Cyberdyne',
    title: 'Security Lead',
  };

  const incoming = {
    full_name: 'Sarah Connor',
    email: null,
    company: 'Cyberdyne',
    title: 'Security Lead',
    linkedin_url: null,
    connected_on: null,
  };

  const diff = detectChanges(existing, incoming);
  assert.equal(diff.changed, false, 'No changes should be detected');
  assert.equal(diff.changes.length, 0, 'Change list should be empty');
});
