// ═══════════════════════════════════════════════════════
// Automated Test Suite: Creative Virtuality Linking & Dual-Persona Mesh
// NetPlus / NetPulse CRM Enterprise Gold Standard
// ═══════════════════════════════════════════════════════

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  netPulseStore,
  PERSONA_ALEX,
  PERSONA_ELENA,
  DEFAULT_PERSONAS,
} from '../src/lib/storage/db';
import type { Relationship, RelationshipType } from '../src/lib/types';

describe('Creative Virtuality Linking & Dual-Persona Mesh Suite', () => {
  beforeEach(async () => {
    // Reset database to clean factory demo state
    await netPulseStore.resetToFactoryDefaults();
  });

  test('1. Persona System — Initializes with Alex Mercer and supports switching to Dr. Elena Rostova', () => {
    const defaultPersona = netPulseStore.getActivePersona();
    assert.equal(defaultPersona.id, 'user-alex');
    assert.equal(defaultPersona.name, 'Alex Mercer');
    assert.equal(defaultPersona.networkRole, 'Venture Partner');

    // Switch to Elena Rostova
    const switched = netPulseStore.setActivePersona('user-elena');
    assert.equal(switched.id, 'user-elena');
    assert.equal(switched.name, 'Dr. Elena Rostova');
    assert.equal(switched.networkRole, 'Quantum Architect');

    // Switch back
    const restored = netPulseStore.setActivePersona('user-alex');
    assert.equal(restored.id, 'user-alex');
  });

  test('2. Persona System — Verifies persona roster credentials & focus domains', () => {
    assert.equal(DEFAULT_PERSONAS.length, 2);

    const alex = DEFAULT_PERSONAS.find(p => p.id === 'user-alex')!;
    assert.ok(alex);
    assert.equal(alex.company, 'Apex DeepTech Ventures');
    assert.ok(alex.focus.includes('AI Infrastructure'));

    const elena = DEFAULT_PERSONAS.find(p => p.id === 'user-elena')!;
    assert.ok(elena);
    assert.equal(elena.company, 'QuantumFoundry');
    assert.ok(elena.focus.includes('Quantum ML'));
  });

  test('3. Zero-Manual Auto-Synthesizer — Forges full virtuality mesh with 6 links and zero typing', async () => {
    const result = await netPulseStore.autoSynthesizeVirtualityMesh();
    assert.equal(result.linksCreated, 6);
    assert.ok(result.resonanceAvg >= 90);

    const rels = await netPulseStore.getRelationships();
    const virtualityLinks = rels.filter(r => r.id.startsWith('vlink-'));
    assert.equal(virtualityLinks.length, 6);

    // Verify presence of exotic dimensions
    const linkTypes = virtualityLinks.map(l => l.type);
    assert.ok(linkTypes.includes('quantum_entanglement'));
    assert.ok(linkTypes.includes('synaptic_resonator'));
    assert.ok(linkTypes.includes('gravitational_orbit'));
    assert.ok(linkTypes.includes('stealth_endorsement'));
    assert.ok(linkTypes.includes('holosphere_anchor'));
    assert.ok(linkTypes.includes('value_vortex'));
  });

  test('4. Exotic Dimensions — Verifies Quantum Entanglement attributes, pulse frequency, and shared tags', async () => {
    await netPulseStore.autoSynthesizeVirtualityMesh();
    const rels = await netPulseStore.getRelationships();
    const quantumLink = rels.find(r => r.type === 'quantum_entanglement')!;

    assert.ok(quantumLink);
    assert.equal(quantumLink.pulse_rate_hz, 528); // 528 Hz creation harmonic
    assert.equal(quantumLink.status, 'entangled');
    assert.equal(quantumLink.virtuality_layer, 'quantum');
    assert.ok(quantumLink.resonance && quantumLink.resonance >= 98);
    assert.ok(quantumLink.shared_tags?.includes('Quantum-ML'));
    assert.ok(quantumLink.notes?.includes('Quantum Co-Founder Entanglement'));
  });

  test('5. Single-Click Preset Forger — Forges Quantum link with bilateral handshake metadata', async () => {
    netPulseStore.setActivePersona('user-alex');
    const created = await netPulseStore.forgeVirtualityLink('quantum');

    assert.ok(created);
    assert.equal(created.type, 'quantum_entanglement');
    assert.equal(created.status, 'pending_handshake');
    assert.equal(created.initiator_user_id, 'user-alex');
    assert.equal(created.target_user_id, 'user-elena');
    assert.equal(created.pulse_rate_hz, 528);
    assert.ok(created.notes?.includes('Alex Mercer'));
  });

  test('6. Single-Click Preset Forger — Forges Gravitational Deal Orbit link', async () => {
    netPulseStore.setActivePersona('user-alex');
    const orbitLink = await netPulseStore.forgeVirtualityLink('orbit');

    assert.ok(orbitLink);
    assert.equal(orbitLink.type, 'gravitational_orbit');
    assert.equal(orbitLink.virtuality_layer, 'gravitational');
    assert.equal(orbitLink.pulse_rate_hz, 432);
    assert.ok(orbitLink.resonance && orbitLink.resonance > 90);
  });

  test('7. Single-Click Preset Forger — Forges Synaptic Resonance and ZK Stealth Vouch', async () => {
    netPulseStore.setActivePersona('user-elena');

    const synaptic = await netPulseStore.forgeVirtualityLink('synaptic');
    assert.equal(synaptic.type, 'synaptic_resonator');
    assert.equal(synaptic.virtuality_layer, 'synaptic');
    assert.equal(synaptic.pulse_rate_hz, 639);

    const stealth = await netPulseStore.forgeVirtualityLink('stealth');
    assert.equal(stealth.type, 'stealth_endorsement');
    assert.equal(stealth.virtuality_layer, 'stealth');
    assert.equal(stealth.pulse_rate_hz, 741);
    assert.ok(stealth.notes?.includes('Zero-Knowledge Stealth Vouch'));
  });

  test('8. Cross-User Handshake Protocol — Target user accepts handshake and locks entanglement', async () => {
    // 1. Alex initiates Quantum link to Elena
    netPulseStore.setActivePersona('user-alex');
    const pending = await netPulseStore.forgeVirtualityLink('quantum');
    assert.equal(pending.status, 'pending_handshake');

    // 2. Switch perspective to Elena
    netPulseStore.setActivePersona('user-elena');

    // 3. Elena accepts handshake
    const accepted = await netPulseStore.acceptVirtualityHandshake(pending.id);
    assert.ok(accepted);
    assert.equal(accepted.status, 'entangled');
    assert.ok(accepted.resonance && accepted.resonance > pending.resonance!);
    assert.ok(accepted.notes?.includes('Handshake reciprocated'));
  });

  test('9. Cascading Deletion — Dropping a virtuality link removes it cleanly from mesh', async () => {
    const created = await netPulseStore.forgeVirtualityLink('quantum');
    let rels = await netPulseStore.getRelationships();
    assert.ok(rels.some(r => r.id === created.id));

    // Delete the relationship
    await netPulseStore.deleteRelationship(created.id);
    rels = await netPulseStore.getRelationships();
    assert.equal(rels.some(r => r.id === created.id), false);
  });

  test('10. Integrity — Rejects corrupted handshake acceptance gracefully', async () => {
    const invalid = await netPulseStore.acceptVirtualityHandshake('non-existent-link-999');
    assert.equal(invalid, null);
  });
});
