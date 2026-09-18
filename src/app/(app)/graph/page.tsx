'use client';

// ═══════════════════════════════════════════════════════
// Interactive Autonomous Network Graph Visualizer
// Topology mesh connecting contacts, enterprise clusters, peer relationships & SLA horizons
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from 'react';
import {
  Share2,
  Building2,
  Users,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  MessageSquare,
  Calendar,
  X,
  Sliders,
  Filter,
  Plus,
  Trash2,
  Link2,
  Network,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { netPulseStore } from '@/lib/storage/db';
import { calculatePriorityScore, isContactOverdue } from '@/lib/scoring';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { generateGoogleCalendarUrl } from '@/lib/calendar';
import { DEFAULT_SETTINGS } from '@/lib/types';
import type { Contact, PriorityScore, UserSettings, Relationship, RelationshipType } from '@/lib/types';

interface GraphNode {
  id: string;
  type: 'contact' | 'enterprise';
  name: string;
  subtitle: string;
  tier?: 'priority' | 'warm' | 'cold';
  score?: number;
  isOverdue?: boolean;
  x: number;
  y: number;
  contactRef?: Contact;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  edgeType: 'hub' | 'peer';
  relType?: RelationshipType;
  relId?: string;
  notes?: string | null;
}

const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  colleague: '#6366F1',
  introduced_by: '#EC4899',
  advisor: '#06B6D4',
  co_investor: '#10B981',
  partner: '#F59E0B',
  mentor: '#8B5CF6',
  client: '#3B82F6',
  // Exotic Virtuality Dimensions
  quantum_entanglement: '#06B6D4',
  synaptic_resonator: '#8B5CF6',
  gravitational_orbit: '#F59E0B',
  stealth_endorsement: '#10B981',
  holosphere_anchor: '#EC4899',
  autonomous_probe: '#3B82F6',
  value_vortex: '#6366F1',
};

export default function GraphPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [offsetDays, setOffsetDays] = useState(0);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'mesh' | 'priority' | 'overdue'>('all');

  // Modal State for creating relationship
  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [fromContactId, setFromContactId] = useState('');
  const [toContactId, setToContactId] = useState('');
  const [relType, setRelType] = useState<RelationshipType>('advisor');
  const [relNotes, setRelNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const [list, rels, offset] = await Promise.all([
      netPulseStore.getContacts(),
      netPulseStore.getRelationships(),
      netPulseStore.getDecayOffsetDays(),
    ]);
    setContacts(list);
    setRelationships(rels);
    setOffsetDays(offset);
  };

  useEffect(() => {
    loadData();

    const handleStateChange = () => {
      loadData();
    };

    window.addEventListener('netpulse:state-changed', handleStateChange);
    return () => {
      window.removeEventListener('netpulse:state-changed', handleStateChange);
    };
  }, []);

  // Compute Enterprise Hubs, Nodes and Edges coordinates
  const { nodes, edges } = useMemo(() => {
    if (contacts.length === 0) return { nodes: [], edges: [] };

    // Group contacts by company
    const companyMap = new Map<string, Contact[]>();
    contacts.forEach(c => {
      const co = c.company || 'Independent';
      if (!companyMap.has(co)) companyMap.set(co, []);
      companyMap.get(co)!.push(c);
    });

    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];

    // Distinct companies with 1+ contacts
    const companies = Array.from(companyMap.keys()).slice(0, 6);

    // Center coordinates
    const centerX = 440;
    const centerY = 310;
    const hubRadius = 180;

    // Place enterprise hubs in an ellipse
    companies.forEach((company, i) => {
      const angle = (i / companies.length) * 2 * Math.PI - Math.PI / 2;
      const hubX = centerX + hubRadius * Math.cos(angle);
      const hubY = centerY + (hubRadius * 0.75) * Math.sin(angle);
      const hubId = `hub-${company.replace(/\s+/g, '-').toLowerCase()}`;

      graphNodes.push({
        id: hubId,
        type: 'enterprise',
        name: company,
        subtitle: `${companyMap.get(company)!.length} Managed Connections`,
        x: hubX,
        y: hubY,
      });

      // Place contacts around their enterprise hub
      const members = companyMap.get(company)!;
      const userSettings = DEFAULT_SETTINGS as unknown as UserSettings;
      members.forEach((c, mIdx) => {
        const scoreRes = calculatePriorityScore(c, 1, userSettings, offsetDays);
        const overdue = isContactOverdue(c, userSettings, offsetDays);

        const memberOffsetAngle = angle + ((mIdx - (members.length - 1) / 2) * 0.45);
        const memberDist = 85;
        const nodeX = hubX + memberDist * Math.cos(memberOffsetAngle);
        const nodeY = hubY + memberDist * Math.sin(memberOffsetAngle);

        const contactNodeId = `node-${c.id}`;
        graphNodes.push({
          id: contactNodeId,
          type: 'contact',
          name: c.full_name,
          subtitle: `${c.title || 'Leader'} • ${company}`,
          tier: c.relationship_tier,
          score: scoreRes.score,
          isOverdue: overdue,
          x: nodeX,
          y: nodeY,
          contactRef: c,
        });

        // Hub edge
        graphEdges.push({
          id: `hub-edge-${hubId}-${contactNodeId}`,
          from: hubId,
          to: contactNodeId,
          edgeType: 'hub',
        });
      });
    });

    // Create Peer-to-Peer Relationship Edges
    const nodeMap = new Map<string, GraphNode>();
    graphNodes.forEach(n => nodeMap.set(n.id, n));

    relationships.forEach(rel => {
      const fromId = `node-${rel.from_contact_id}`;
      const toId = `node-${rel.to_contact_id}`;
      if (nodeMap.has(fromId) && nodeMap.has(toId)) {
        graphEdges.push({
          id: `peer-edge-${rel.id}`,
          from: fromId,
          to: toId,
          edgeType: 'peer',
          relType: rel.type,
          relId: rel.id,
          notes: rel.notes,
        });
      }
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [contacts, relationships, offsetDays]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (n.type === 'enterprise') return true;
      if (filterMode === 'priority') return n.tier === 'priority';
      if (filterMode === 'overdue') return n.isOverdue;
      return true;
    });
  }, [nodes, filterMode]);

  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = useMemo(() => {
    return edges.filter(e => {
      const bothVisible = visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to);
      if (!bothVisible) return false;
      if (filterMode === 'mesh') return e.edgeType === 'peer';
      return true;
    });
  }, [edges, visibleNodeIds, filterMode]);

  // Selected contact's relationships
  const selectedContactRelationships = useMemo(() => {
    if (!selectedNode?.contactRef) return [];
    const contactId = selectedNode.contactRef.id;
    return relationships
      .filter(r => r.from_contact_id === contactId || r.to_contact_id === contactId)
      .map(r => {
        const peerId = r.from_contact_id === contactId ? r.to_contact_id : r.from_contact_id;
        const peerContact = contacts.find(c => c.id === peerId);
        return {
          ...r,
          peer: peerContact,
        };
      });
  }, [selectedNode, relationships, contacts]);

  const handleCreateRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromContactId || !toContactId) return;
    if (fromContactId === toContactId) {
      alert('Please select two different contacts to form a relationship.');
      return;
    }

    const newRel: Relationship = {
      id: `rel-${Date.now()}`,
      from_contact_id: fromContactId,
      to_contact_id: toContactId,
      type: relType,
      notes: relNotes || null,
      created_at: new Date().toISOString(),
    };

    await netPulseStore.saveRelationship(newRel);
    setIsRelModalOpen(false);
    setRelNotes('');
    showToast(`Relationship established: ${relType.replace('_', ' ')}!`);
    await loadData();
  };

  const handleDeleteRelationship = async (relId: string) => {
    if (confirm('Are you sure you want to sever this relationship link?')) {
      await netPulseStore.deleteRelationship(relId);
      showToast('Relationship removed from network mesh.');
      await loadData();
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1240 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 10,
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 700,
            fontSize: '0.88rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
              STAGE 7/7 • PRODUCTION CERTIFIED
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
              Interactive Autonomous Graph Mesh
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Network Topology Visualizer</h1>
          <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
            Interactive peer-to-peer relationships, enterprise clusters, and cadence SLA horizons
          </p>
        </div>

        {/* Action Controls & Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (selectedNode?.contactRef) {
                setFromContactId(selectedNode.contactRef.id);
              }
              setIsRelModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <Plus size={15} /> + Connect Leaders
          </button>

          <div style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'var(--np-bg-secondary)', padding: '3px 4px', borderRadius: 10, border: '1px solid var(--np-border)' }}>
            <button
              onClick={() => setFilterMode('all')}
              className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', fontWeight: filterMode === 'all' ? 700 : 500, padding: '4px 10px' }}
            >
              All Graph
            </button>
            <button
              onClick={() => setFilterMode('mesh')}
              className={`btn btn-sm ${filterMode === 'mesh' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', fontWeight: filterMode === 'mesh' ? 700 : 500, padding: '4px 10px' }}
            >
              Peer Mesh Only
            </button>
            <button
              onClick={() => setFilterMode('priority')}
              className={`btn btn-sm ${filterMode === 'priority' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', fontWeight: filterMode === 'priority' ? 700 : 500, padding: '4px 10px' }}
            >
              Priority
            </button>
            <button
              onClick={() => setFilterMode('overdue')}
              className={`btn btn-sm ${filterMode === 'overdue' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', fontWeight: filterMode === 'overdue' ? 700 : 500, padding: '4px 10px', color: filterMode === 'overdue' ? '#fff' : '#ef4444' }}
            >
              SLA Overdue
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspection Drawer Container */}
      <div style={{ display: 'flex', gap: 20, position: 'relative', alignItems: 'flex-start' }}>
        {/* SVG Canvas Card */}
        <div
          className="card animate-scale-in"
          style={{
            flex: 1,
            backgroundColor: 'var(--np-bg-card)',
            borderRadius: 18,
            border: '1px solid var(--np-border)',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          }}
        >
          {/* Topology Legend */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 16,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              fontSize: '0.72rem',
              color: 'var(--np-text-tertiary)',
              background: 'var(--np-bg-secondary)',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--np-border)',
              zIndex: 10,
              backdropFilter: 'blur(8px)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#4F46E5', display: 'inline-block' }} /> Priority (14d SLA)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} /> Warm (30d SLA)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Enterprise Hub
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 3, borderRadius: 2, background: '#8B5CF6', display: 'inline-block' }} /> Peer Mesh Edge
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid #EF4444', display: 'inline-block' }} /> SLA Breach
            </span>
          </div>

          <svg
            viewBox="0 0 880 620"
            style={{ width: '100%', height: 600, display: 'block', background: 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.05) 0%, transparent 70%)' }}
          >
            <defs>
              <filter id="glow-peer" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {filteredEdges.map((e, idx) => {
              const fromNode = nodes.find(n => n.id === e.from);
              const toNode = nodes.find(n => n.id === e.to);
              if (!fromNode || !toNode) return null;

              const isConnectedToSelected =
                (selectedNode && (selectedNode.id === fromNode.id || selectedNode.id === toNode.id));
              const isConnectedToHovered =
                (hoveredNode && (hoveredNode.id === fromNode.id || hoveredNode.id === toNode.id));
              const isHighlighted = isConnectedToSelected || isConnectedToHovered || (hoveredEdge?.id === e.id);

              if (e.edgeType === 'peer') {
                const color = e.relType ? (RELATIONSHIP_COLORS[e.relType] || '#8B5CF6') : '#8B5CF6';
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                return (
                  <g key={e.id || idx}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={color}
                      strokeWidth={isHighlighted ? 3.5 : 2}
                      opacity={isHighlighted ? 1 : 0.7}
                      filter={isHighlighted ? 'url(#glow-peer)' : 'none'}
                      style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredEdge(e)}
                      onMouseLeave={() => setHoveredEdge(null)}
                    />
                    {/* Edge Midpoint Badge */}
                    {isHighlighted && e.relType && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-35}
                          y={-10}
                          width={70}
                          height={20}
                          rx={10}
                          fill="var(--np-bg-card)"
                          stroke={color}
                          strokeWidth={1.5}
                        />
                        <text
                          y={3.5}
                          textAnchor="middle"
                          fill={color}
                          fontSize="9"
                          fontWeight="800"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {e.relType.replace('_', ' ').toUpperCase()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              }

              // Hub Edges
              return (
                <line
                  key={e.id || idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isHighlighted ? 'var(--np-accent)' : 'var(--np-border)'}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeDasharray={isHighlighted ? 'none' : '3 3'}
                  opacity={isHighlighted ? 0.9 : 0.35}
                  style={{ transition: 'all 0.2s ease' }}
                />
              );
            })}

            {/* Nodes */}
            {filteredNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;

              if (node.type === 'enterprise') {
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <circle
                      r={24}
                      fill="var(--np-bg-secondary)"
                      stroke="#10B981"
                      strokeWidth={isSelected ? 3 : 2}
                      filter={isSelected ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))' : 'none'}
                    />
                    <text
                      y={4}
                      textAnchor="middle"
                      fill="#10B981"
                      fontSize="10"
                      fontWeight="800"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      ORG
                    </text>
                    <text
                      y={36}
                      textAnchor="middle"
                      fill="var(--np-text-primary)"
                      fontSize="11"
                      fontWeight="700"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              }

              // Contact Node
              const fillColor =
                node.tier === 'priority' ? '#4F46E5' : node.tier === 'warm' ? '#F59E0B' : '#6B7280';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Outer Pulsing Halo for Overdue Breaches */}
                  {node.isOverdue && (
                    <circle
                      r={21}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth={2}
                      opacity={0.85}
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  <circle
                    r={16}
                    fill={fillColor}
                    stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isSelected ? 3 : 1}
                    filter={isSelected ? 'drop-shadow(0 0 12px rgba(79, 70, 229, 0.8))' : 'none'}
                  />
                  <text
                    y={4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="9"
                    fontWeight="800"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.name[0]}
                  </text>
                  <text
                    y={28}
                    textAnchor="middle"
                    fill="var(--np-text-secondary)"
                    fontSize="10"
                    fontWeight="600"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div
            className="card animate-fade-in-right"
            style={{
              width: 350,
              backgroundColor: 'var(--np-bg-card)',
              borderRadius: 18,
              border: '1px solid var(--np-border)',
              padding: '20px 22px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="badge badge-priority" style={{ fontSize: '0.68rem' }}>
                {selectedNode.type === 'enterprise' ? 'ENTERPRISE HUB' : 'CONTACT DOSSIER'}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="btn-ghost"
                style={{ padding: 4, borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800 }}>
              {selectedNode.name}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: 'var(--np-text-secondary)' }}>
              {selectedNode.subtitle}
            </p>

            {selectedNode.contactRef && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'var(--np-bg-secondary)', marginBottom: 16 }}>
                  <div>
                    <span className={`badge badge-${selectedNode.tier}`} style={{ fontSize: '0.66rem' }}>
                      {selectedNode.tier?.toUpperCase()} TIER
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: (selectedNode.score ?? 0) >= 80 ? '#ef4444' : '#f59e0b' }}>
                      {selectedNode.score}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--np-text-tertiary)', display: 'block' }}>Decay Score</span>
                  </div>
                </div>

                {/* Status */}
                <div style={{ fontSize: '0.78rem', color: selectedNode.isOverdue ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  {selectedNode.isOverdue ? <AlertCircle size={14} /> : <Clock size={14} />}
                  <span>{selectedNode.isOverdue ? 'Cadence SLA Overdue' : 'Cadence on Track'}</span>
                </div>

                {/* Connected Relationships Mesh */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--np-text-secondary)' }}>
                      Connected Mesh ({selectedContactRelationships.length})
                    </span>
                    <button
                      onClick={() => {
                        setFromContactId(selectedNode.contactRef!.id);
                        setIsRelModalOpen(true);
                      }}
                      className="btn-ghost"
                      style={{ fontSize: '0.7rem', color: 'var(--np-accent)', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Plus size={12} /> Connect
                    </button>
                  </div>

                  {selectedContactRelationships.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)', fontStyle: 'italic', padding: '8px 10px', background: 'var(--np-bg-secondary)', borderRadius: 8 }}>
                      No peer connections established yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selectedContactRelationships.map(r => (
                        <div
                          key={r.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: 'var(--np-bg-secondary)',
                            borderRadius: 8,
                            fontSize: '0.78rem',
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
                            <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {r.peer?.full_name || 'Contact'}
                            </div>
                            <span
                              style={{
                                fontSize: '0.64rem',
                                textTransform: 'uppercase',
                                fontWeight: 800,
                                color: RELATIONSHIP_COLORS[r.type] || 'var(--np-accent)',
                              }}
                            >
                              {r.type.replace('_', ' ')}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteRelationship(r.id)}
                            className="btn-ghost"
                            title="Sever connection"
                            style={{ color: '#ef4444', padding: 4 }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 1-Click Multi-Channel Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a
                    href={generateWhatsAppUrl({ contact: selectedNode.contactRef })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  >
                    <MessageSquare size={14} /> Open WhatsApp Outreach
                  </a>

                  <a
                    href={generateGoogleCalendarUrl({ contact: selectedNode.contactRef })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Calendar size={14} /> Schedule 1-Click Sync
                  </a>

                  <Link
                    href={`/contacts/${selectedNode.contactRef.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}
                  >
                    Open Autonomous Dossier &rarr;
                  </Link>
                </div>
              </>
            )}

            {selectedNode.type === 'enterprise' && (
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--np-text-secondary)', lineHeight: 1.4, margin: '0 0 16px 0' }}>
                  Enterprise cluster node linking managed connections at {selectedNode.name}.
                </p>
                <Link
                  href="/contacts"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Users size={14} /> Filter Directory by {selectedNode.name}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connect Relationships Modal */}
      {isRelModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            className="card animate-scale-in"
            style={{
              width: '100%',
              maxWidth: 480,
              backgroundColor: 'var(--np-bg-card)',
              borderRadius: 16,
              border: '1px solid var(--np-border)',
              padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link2 size={18} style={{ color: 'var(--np-accent)' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Establish Graph Connection</h3>
              </div>
              <button
                onClick={() => setIsRelModalOpen(false)}
                className="btn-ghost"
                style={{ padding: 4, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRelationship} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Source Contact (Leader A)
                </label>
                <select
                  className="input"
                  value={fromContactId}
                  onChange={e => setFromContactId(e.target.value)}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">-- Select Contact --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.company || 'Independent'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Relationship Edge Type
                </label>
                <select
                  className="input"
                  value={relType}
                  onChange={e => setRelType(e.target.value as RelationshipType)}
                  style={{ width: '100%' }}
                >
                  <option value="advisor">Advisor</option>
                  <option value="mentor">Mentor</option>
                  <option value="co_investor">Co-Investor</option>
                  <option value="partner">Partner</option>
                  <option value="colleague">Colleague</option>
                  <option value="introduced_by">Introduced By</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Target Contact (Leader B)
                </label>
                <select
                  className="input"
                  value={toContactId}
                  onChange={e => setToContactId(e.target.value)}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">-- Select Target Contact --</option>
                  {contacts.filter(c => c.id !== fromContactId).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.company || 'Independent'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>
                  Connection Context / Notes (Optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Co-invested in Series A, met at TechCrunch Disrupt"
                  value={relNotes}
                  onChange={e => setRelNotes(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsRelModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 700 }}
                >
                  Link Leaders &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
