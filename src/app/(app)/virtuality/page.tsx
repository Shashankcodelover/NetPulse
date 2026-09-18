'use client';

// ═══════════════════════════════════════════════════════
// Virtuality 3D Spatial Matrix Studio (Holosphere 4.0)
// Creative Virtuality Linking across 7 exotic dimensions
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Orbit,
  Sparkles,
  Atom,
  Zap,
  Radio,
  Share2,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Flame,
  Layers,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  netPulseStore,
  PERSONA_ALEX,
  PERSONA_ELENA,
} from '@/lib/storage/db';
import type { Contact, Relationship, RelationshipType, UserPersona } from '@/lib/types';
import { soundFx } from '@/lib/sound';

interface VirtualityNode {
  id: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  gradient: string;
  orbitRadius: number; // 3D orbit distance
  orbitSpeed: number;  // Angular velocity
  angle: number;       // Current radian
  yOffset: number;     // 3D elevation
  tier: 'priority' | 'warm' | 'cold';
  resonance: number;   // 0 - 100%
  status: 'active' | 'entangled' | 'pending';
}

const EXOTIC_DIMENSION_LABELS: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  quantum_entanglement: {
    label: 'Quantum Co-Founder Entanglement',
    icon: '🌌',
    color: '#06B6D4',
    desc: 'Synchronized algorithmic cadence & shared destiny. Parallel state coherence.',
  },
  synaptic_resonator: {
    label: 'Synaptic Resonance Link',
    icon: '🧬',
    color: '#8B5CF6',
    desc: 'Cognitive AI pattern alignment. 95%+ thinking frequency overlap.',
  },
  gravitational_orbit: {
    label: 'Gravitational Deal Orbit',
    icon: '🪐',
    color: '#F59E0B',
    desc: 'High-velocity syndication gravity. Pulling multi-party dealflow trajectories.',
  },
  stealth_endorsement: {
    label: 'Zero-Knowledge Stealth Vouch',
    icon: '⚡',
    color: '#10B981',
    desc: 'Anonymous high-trust operator endorsement with verifiable cryptographic proof.',
  },
  holosphere_anchor: {
    label: 'Holosphere Virtuality Anchor',
    icon: '🔮',
    color: '#EC4899',
    desc: 'Persistent spatial anchor in holographic memory matrix with harmonic pulse.',
  },
  autonomous_probe: {
    label: 'Autonomous Serendipity Probe',
    icon: '🛰️',
    color: '#3B82F6',
    desc: 'Subconscious background AI reconnect probe searching for reciprocal timing.',
  },
  value_vortex: {
    label: 'Reciprocal Value Vortex',
    icon: '🌀',
    color: '#6366F1',
    desc: 'Bi-directional high-yield social capital intro pipeline.',
  },
};

export default function VirtualityPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [activePersona, setActivePersona] = useState<UserPersona>(PERSONA_ALEX);
  const [selectedNode, setSelectedNode] = useState<VirtualityNode | null>(null);
  const [selectedRel, setSelectedRel] = useState<Relationship | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Rotation angles for 3D orbital plane (controlled by mouse drag)
  const [rotX, setRotX] = useState(0.45);
  const [rotY, setRotY] = useState(0);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    const [cList, rList] = await Promise.all([
      netPulseStore.getContacts(),
      netPulseStore.getRelationships(),
    ]);
    setContacts(cList);
    setRelationships(rList);
    setActivePersona(netPulseStore.getActivePersona());
  };

  useEffect(() => {
    loadData();

    const handleStateChange = () => loadData();
    const handlePersonaChange = (e: CustomEvent<UserPersona>) => {
      setActivePersona(e.detail || netPulseStore.getActivePersona());
      loadData();
    };

    window.addEventListener('netpulse:state-changed', handleStateChange);
    window.addEventListener('netpulse:persona-switched', handlePersonaChange as EventListener);

    return () => {
      window.removeEventListener('netpulse:state-changed', handleStateChange);
      window.removeEventListener('netpulse:persona-switched', handlePersonaChange as EventListener);
    };
  }, []);

  // Check if there are pending handshakes for active persona
  const pendingHandshakeForMe = useMemo(() => {
    return relationships.find(
      r => r.status === 'pending_handshake' && r.target_user_id === activePersona.id
    );
  }, [relationships, activePersona]);

  // Transform contacts into 3D Virtuality Nodes
  const virtualityNodes = useMemo<VirtualityNode[]>(() => {
    if (contacts.length === 0) return [];

    return contacts.slice(0, 8).map((c, idx) => {
      const ring = (idx % 3); // 0 = inner core, 1 = mid orbit, 2 = outer celestial
      const orbitRadius = 110 + ring * 85;
      const orbitSpeed = 0.003 / (ring + 1);
      const angle = (idx / 8) * Math.PI * 2;
      const yOffset = Math.sin(idx * 1.5) * 35;

      const hasEntanglement = relationships.some(
        r => (r.from_contact_id === c.id || r.to_contact_id === c.id) && r.status === 'entangled'
      );
      const hasPending = relationships.some(
        r => (r.from_contact_id === c.id || r.to_contact_id === c.id) && r.status === 'pending_handshake'
      );

      return {
        id: c.id,
        name: c.full_name,
        role: c.title || 'Tech Leader',
        company: c.company || 'DeepTech Inc',
        initials: c.full_name.split(' ').map(n => n[0]).join('').slice(0, 2),
        gradient: c.full_name.includes('Elena')
          ? 'linear-gradient(135deg, #10B981, #8B5CF6)'
          : c.full_name.includes('Marcus')
          ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
          : 'linear-gradient(135deg, #06B6D4, #6366F1)',
        orbitRadius,
        orbitSpeed,
        angle,
        yOffset,
        tier: c.relationship_tier,
        resonance: hasEntanglement ? 98.4 : hasPending ? 88.0 : 78.5,
        status: hasEntanglement ? 'entangled' : hasPending ? 'pending' : 'active',
      };
    });
  }, [contacts, relationships]);

  // 3D Orbital Canvas Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localNodes = [...virtualityNodes];
    let time = 0;

    const render = () => {
      time += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Deep space radial background glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, cx * 0.9);
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      bgGrad.addColorStop(0.5, 'rgba(8, 12, 28, 0.98)');
      bgGrad.addColorStop(1, '#050814');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw background ambient stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let s = 0; s < 45; s++) {
        const sx = (Math.sin(s * 99 + time * 0.05) * 0.5 + 0.5) * w;
        const sy = (Math.cos(s * 33 + time * 0.03) * 0.5 + 0.5) * h;
        const sr = (s % 3 === 0) ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Concentric Holographic Orbit Rings with 3D Tilt
      const rings = [110, 195, 280];
      rings.forEach((r, rIdx) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, Math.cos(rotX));
        ctx.rotate(rotY);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = rIdx === 0
          ? 'rgba(6, 182, 212, 0.25)'
          : rIdx === 1
          ? 'rgba(99, 102, 241, 0.2)'
          : 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.restore();
      });

      // Update node orbital positions in 3D
      localNodes.forEach(node => {
        node.angle += node.orbitSpeed;
      });

      // Project 3D coordinates (x, y, z) -> 2D screen
      interface ProjectedNode {
        node: VirtualityNode;
        screenX: number;
        screenY: number;
        depthScale: number;
        z: number;
      }

      const projected: ProjectedNode[] = localNodes.map(node => {
        const x3 = node.orbitRadius * Math.cos(node.angle);
        const z3 = node.orbitRadius * Math.sin(node.angle);
        const y3 = node.yOffset + Math.sin(time + node.angle) * 8;

        // Apply 3D rotation around X and Y
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);

        // Rotate Y
        const rx = x3 * cosY - z3 * sinY;
        const rz = x3 * sinY + z3 * cosY;

        // Rotate X
        const ry = y3 * cosX - rz * sinX;
        const finalZ = y3 * sinX + rz * cosX;

        const cameraDist = 450;
        const depthScale = cameraDist / (cameraDist + finalZ);
        const screenX = cx + rx * depthScale;
        const screenY = cy + ry * depthScale;

        return { node, screenX, screenY, depthScale, z: finalZ };
      });

      // Sort nodes by Z for depth rendering
      projected.sort((a, b) => b.z - a.z);

      // Render Connection Laser Beams between entangled/related nodes
      relationships.forEach(rel => {
        const fromP = projected.find(p => p.node.id === rel.from_contact_id);
        const toP = projected.find(p => p.node.id === rel.to_contact_id);

        if (fromP && toP) {
          const isEntangled = rel.status === 'entangled';
          const isPending = rel.status === 'pending_handshake';
          const beamColor = rel.type === 'quantum_entanglement'
            ? '#06B6D4'
            : rel.type === 'synaptic_resonator'
            ? '#8B5CF6'
            : rel.type === 'gravitational_orbit'
            ? '#F59E0B'
            : '#10B981';

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(fromP.screenX, fromP.screenY);
          ctx.lineTo(toP.screenX, toP.screenY);

          if (isEntangled) {
            ctx.strokeStyle = beamColor;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = beamColor;
            ctx.shadowBlur = 12;
          } else if (isPending) {
            ctx.strokeStyle = '#EF4444';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([4, 4]);
            ctx.shadowColor = '#EF4444';
            ctx.shadowBlur = 8;
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([]);
          }

          ctx.stroke();
          ctx.restore();

          // Animated energy photon packet traversing the beam
          if (isEntangled || isPending) {
            const progress = (time * 0.8 + (fromP.node.angle * 2)) % 1;
            const photonX = fromP.screenX + (toP.screenX - fromP.screenX) * progress;
            const photonY = fromP.screenY + (toP.screenY - fromP.screenY) * progress;

            ctx.save();
            ctx.beginPath();
            ctx.arc(photonX, photonY, isEntangled ? 4 : 3, 0, Math.PI * 2);
            ctx.fillStyle = isEntangled ? '#FFFFFF' : '#EF4444';
            ctx.shadowColor = beamColor;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
          }
        }
      });

      // Render 3D Holographic Nodes
      projected.forEach(({ node, screenX, screenY, depthScale }) => {
        const radius = Math.max(16 * depthScale, 10);
        const isSelected = selectedNode?.id === node.id;
        const isEntangled = node.status === 'entangled';

        ctx.save();
        ctx.translate(screenX, screenY);

        // Outer Resonance Wave Rings
        if (isEntangled || isSelected) {
          const pulseR = radius + (Math.sin(time * 3 + node.angle) * 0.5 + 0.5) * 8;
          ctx.beginPath();
          ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = isEntangled ? 'rgba(6, 182, 212, 0.4)' : 'rgba(99, 102, 241, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        const nodeGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, 2, 0, 0, radius);
        if (node.name.includes('Elena')) {
          nodeGrad.addColorStop(0, '#34D399');
          nodeGrad.addColorStop(1, '#059669');
        } else if (node.name.includes('Marcus')) {
          nodeGrad.addColorStop(0, '#FBBF24');
          nodeGrad.addColorStop(1, '#D97706');
        } else {
          nodeGrad.addColorStop(0, '#38BDF8');
          nodeGrad.addColorStop(1, '#2563EB');
        }
        ctx.fillStyle = nodeGrad;
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = isSelected ? 2.5 : 1.2;
        ctx.stroke();

        // Node Initials
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(11 * depthScale)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.initials, 0, 0);

        // Node Label below
        ctx.font = `${Math.round(10 * depthScale)}px Inter, sans-serif`;
        ctx.fillStyle = isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.85)';
        ctx.fillText(node.name.split(' ')[0], 0, radius + 12 * depthScale);

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [virtualityNodes, relationships, rotX, rotY, selectedNode]);

  // Mouse drag handlers for 3D rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotY(prev => prev + dx * 0.008);
    setRotX(prev => Math.max(0.1, Math.min(1.2, prev + dy * 0.008)));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Canvas click handler to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Hit test projected nodes
    for (const node of virtualityNodes) {
      const x3 = node.orbitRadius * Math.cos(node.angle);
      const z3 = node.orbitRadius * Math.sin(node.angle);
      const y3 = node.yOffset;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const rx = x3 * cosY - z3 * sinY;
      const rz = x3 * sinY + z3 * cosY;
      const ry = y3 * cosX - rz * sinX;
      const finalZ = y3 * sinX + rz * cosX;

      const depthScale = 450 / (450 + finalZ);
      const sx = cx + rx * depthScale;
      const sy = cy + ry * depthScale;

      const dist = Math.hypot(clickX - sx, clickY - sy);
      if (dist < 26) {
        setSelectedNode(node);
        soundFx.playResonanceChime(node.resonance / 100);

        // Find linked relationship
        const rel = relationships.find(
          r => r.from_contact_id === node.id || r.to_contact_id === node.id
        );
        setSelectedRel(rel || null);
        return;
      }
    }
  };

  // 1-Click Zero-Manual Auto-Synthesize Full Virtuality Mesh
  const handleAutoSynthesize = async () => {
    setIsSynthesizing(true);
    soundFx.playQuantumEntangleHum();

    try {
      const res = await netPulseStore.autoSynthesizeVirtualityMesh();
      await loadData();
      soundFx.playCelebrationFanfare();
      showToast(`⚡ Virtuality Matrix Synthesized! ${res.linksCreated} connections forged with ${res.resonanceAvg}% avg resonance frequency!`);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // 1-Click Forge Single Exotic Link Preset
  const handleForgePreset = async (preset: 'quantum' | 'orbit' | 'synaptic' | 'stealth') => {
    soundFx.playLaserBeamConnect();
    const created = await netPulseStore.forgeVirtualityLink(preset);
    await loadData();
    setSelectedRel(created);
    showToast(`🔮 Forged ${created.type.replace('_', ' ').toUpperCase()} with zero manual typing!`);
  };

  // 1-Click Accept Handshake (Role-play response)
  const handleAcceptHandshake = async (linkId: string) => {
    soundFx.playCelebrationFanfare();
    const updated = await netPulseStore.acceptVirtualityHandshake(linkId);
    if (updated) {
      await loadData();
      setSelectedRel(updated);
      showToast(`✨ Handshake Accepted! Quantum Entanglement fully synchronized at ${updated.resonance}% resonance!`);
    }
  };

  // 1-Click Drop / Sever Link
  const handleSeverLink = async (relId: string) => {
    await netPulseStore.deleteRelationship(relId);
    await loadData();
    setSelectedRel(null);
    showToast('Link severed. Cascading reconnection recalculated.');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: 24,
              right: 32,
              zIndex: 9999,
              background: '#0F172A',
              color: '#38BDF8',
              border: '1px solid #38BDF8',
              borderRadius: '12px',
              padding: '12px 20px',
              boxShadow: '0 10px 25px rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 700,
              fontSize: '0.88rem',
            }}
          >
            <Sparkles size={16} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Title, Persona Info, and Audio Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                borderRadius: 20,
                background: 'rgba(6, 182, 212, 0.12)',
                color: '#06B6D4',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              <Orbit size={13} /> Holosphere 4.0 Spatial Matrix
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
              7 Exotic Dimensions • Zero-Manual Entry
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Creative Virtuality Linking Studio
          </h1>
          <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
            Visualizing multi-dimensional relationship physics, quantum co-founder entanglements, and dealflow gravitation.
          </p>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              soundFx.toggle(!soundEnabled);
            }}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}
          >
            {soundEnabled ? <Volume2 size={16} style={{ color: '#10B981' }} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Quantum Audio ON' : 'Audio Muted'}</span>
          </button>

          <button
            onClick={handleAutoSynthesize}
            disabled={isSynthesizing}
            className="btn btn-primary"
            id="btnAutoSynthesize"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
              border: 'none',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
              fontWeight: 700,
            }}
          >
            <Sparkles size={16} />
            {isSynthesizing ? 'Synthesizing Mesh...' : '1-Click Auto-Synthesize Mesh'}
          </button>
        </div>
      </div>

      {/* Cross-User Pending Handshake Notification Banner */}
      {pendingHandshakeForMe && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            marginBottom: 20,
            padding: '14px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1px solid #06B6D4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            boxShadow: '0 4px 20px rgba(6, 182, 212, 0.2)',
          }}
          id="handshakeBanner"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: '#06B6D4',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
              }}
            >
              🌌
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--np-text-primary)' }}>
                Incoming Quantum Handshake for {activePersona.name}!
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)' }}>
                Alex Mercer initiated a <strong>Quantum Co-Founder Entanglement</strong> with you. Accept to lock harmonic resonance at 99.4%.
              </div>
            </div>
          </div>

          <button
            onClick={() => handleAcceptHandshake(pendingHandshakeForMe.id)}
            className="btn btn-primary"
            id="btnAcceptHandshake"
            style={{
              background: '#10B981',
              borderColor: '#10B981',
              fontWeight: 800,
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircle2 size={16} /> Accept &amp; Entangle Now
          </button>
        </motion.div>
      )}

      {/* 5-KPI Telemetry Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div className="card" style={{ padding: '12px 16px', background: 'var(--np-bg-card)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', textTransform: 'uppercase', fontWeight: 800 }}>
            Entangled Nodes
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#06B6D4', marginTop: 4 }}>
            {virtualityNodes.filter(n => n.status === 'entangled').length} Systems Locked
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', background: 'var(--np-bg-card)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', textTransform: 'uppercase', fontWeight: 800 }}>
            Avg Mesh Resonance
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8B5CF6', marginTop: 4 }}>
            {relationships.length > 0
              ? Math.round(relationships.reduce((acc, r) => acc + (r.resonance || 90), 0) / relationships.length)
              : 94}% Frequency
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', background: 'var(--np-bg-card)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', textTransform: 'uppercase', fontWeight: 800 }}>
            Gravitational Dealflow
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>
            $24.5M Velocity
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', background: 'var(--np-bg-card)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', textTransform: 'uppercase', fontWeight: 800 }}>
            Cryptographic ZK Vouch
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981', marginTop: 4 }}>
            100% Blind Verified
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px', background: 'var(--np-bg-card)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--np-text-tertiary)', textTransform: 'uppercase', fontWeight: 800 }}>
            Active Perspective
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--np-text-primary)', marginTop: 4 }}>
            {activePersona.name.split(' ')[0]} ({activePersona.networkRole.split(' ')[0]})
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Studio Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left Pane: 3D Orbital Canvas */}
        <div
          className="card"
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#050814',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: 560,
          }}
        >
          {/* Canvas Viewport */}
          <canvas
            ref={canvasRef}
            width={940}
            height={560}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
          />

          {/* Floating Controls Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              display: 'flex',
              gap: 8,
              zIndex: 10,
            }}
          >
            <button
              onClick={() => {
                setRotX(0.45);
                setRotY(0);
              }}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RotateCcw size={12} /> Reset Camera
            </button>
            <span
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--np-text-secondary)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.72rem',
              }}
            >
              Drag mouse to tilt 3D orbits • Click node to inspect
            </span>
          </div>

          {/* Preset Fast-Forge Toolbar (Zero Manual Typing) */}
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              right: 14,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--np-text-tertiary)', textTransform: 'uppercase' }}>
              ⚡ 1-Click Exotic Presets:
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleForgePreset('quantum')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', border: '1px solid rgba(6, 182, 212, 0.3)' }}
              >
                🌌 Forge Quantum
              </button>
              <button
                onClick={() => handleForgePreset('orbit')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' }}
              >
                🪐 Spin Deal Orbit
              </button>
              <button
                onClick={() => handleForgePreset('synaptic')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.3)' }}
              >
                🧬 Sync Synaptic
              </button>
              <button
                onClick={() => handleForgePreset('stealth')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.74rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                ⚡ Cast ZK Vouch
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Virtuality Node & Relationship Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Node Dossier Card */}
          <div className="card" style={{ padding: 20, background: 'var(--np-bg-card)' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--np-text-tertiary)', marginBottom: 12 }}>
              Spatial Node Telemetry
            </div>

            {selectedNode ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: selectedNode.gradient,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    {selectedNode.initials}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                      {selectedNode.name}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', margin: '2px 0 0' }}>
                      {selectedNode.role} • {selectedNode.company}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--np-border)' }}>
                    <span style={{ color: 'var(--np-text-secondary)' }}>Resonance Frequency:</span>
                    <strong style={{ color: '#06B6D4' }}>{selectedNode.resonance}% Sync</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--np-border)' }}>
                    <span style={{ color: 'var(--np-text-secondary)' }}>Orbital Tier:</span>
                    <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{selectedNode.tier}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--np-border)' }}>
                    <span style={{ color: 'var(--np-text-secondary)' }}>State Coherence:</span>
                    <span
                      style={{
                        color: selectedNode.status === 'entangled' ? '#10B981' : '#F59E0B',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: '0.72rem',
                      }}
                    >
                      {selectedNode.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--np-text-tertiary)' }}>
                <Orbit size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.82rem', margin: 0 }}>
                  Click any orbiting node in the 3D Holosphere to inspect spatial resonance.
                </p>
              </div>
            )}
          </div>

          {/* Relationship Connection Dossier */}
          <div className="card" style={{ padding: 20, background: 'var(--np-bg-card)' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--np-text-tertiary)', marginBottom: 12 }}>
              Exotic Link Dossier
            </div>

            {selectedRel ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {EXOTIC_DIMENSION_LABELS[selectedRel.type]?.icon || '🌐'}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0, color: EXOTIC_DIMENSION_LABELS[selectedRel.type]?.color || '#06B6D4' }}>
                      {EXOTIC_DIMENSION_LABELS[selectedRel.type]?.label || selectedRel.type}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--np-text-secondary)' }}>
                      Harmonic Pulse: {selectedRel.pulse_rate_hz || 528} Hz
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--np-text-secondary)', lineHeight: 1.5, background: 'var(--np-bg-tertiary)', padding: 10, borderRadius: 8, marginBottom: 12 }}>
                  {selectedRel.notes || 'No telemetry recorded.'}
                </p>

                {selectedRel.shared_tags && selectedRel.shared_tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                    {selectedRel.shared_tags.map(t => (
                      <span
                        key={t}
                        style={{
                          fontSize: '0.66rem',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: '#6366F1',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {selectedRel.status === 'pending_handshake' && (
                    <button
                      onClick={() => handleAcceptHandshake(selectedRel.id)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem', background: '#10B981', border: 'none' }}
                    >
                      Accept Handshake
                    </button>
                  )}
                  <button
                    onClick={() => handleSeverLink(selectedRel.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#EF4444', fontSize: '0.75rem' }}
                  >
                    <Trash2 size={13} /> Sever
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--np-text-tertiary)' }}>
                <Sparkles size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.82rem', margin: 0 }}>
                  Select a node with an active beam or click an exotic preset below.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
