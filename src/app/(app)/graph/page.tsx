'use client';

// ═══════════════════════════════════════════════════════
// Interactive Autonomous Network Graph Visualizer
// Topology map connecting contacts, enterprise clusters & SLA horizons
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
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { netPulseStore } from '@/lib/storage/db';
import { calculatePriorityScore, isContactOverdue } from '@/lib/scoring';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { generateGoogleCalendarUrl } from '@/lib/calendar';
import { DEFAULT_SETTINGS } from '@/lib/types';
import type { Contact, PriorityScore, UserSettings } from '@/lib/types';

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
  from: string;
  to: string;
}

export default function GraphPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [offsetDays, setOffsetDays] = useState(0);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'priority' | 'overdue'>('all');

  useEffect(() => {
    Promise.all([
      netPulseStore.getContacts(),
      netPulseStore.getDecayOffsetDays(),
    ]).then(([list, offset]) => {
      setContacts(list);
      setOffsetDays(offset);
    });
  }, []);

  // Compute Enterprise Hubs and Layout coordinates
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

        graphEdges.push({
          from: hubId,
          to: contactNodeId,
        });
      });
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [contacts, offsetDays]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (n.type === 'enterprise') return true;
      if (filterMode === 'priority') return n.tier === 'priority';
      if (filterMode === 'overdue') return n.isOverdue;
      return true;
    });
  }, [nodes, filterMode]);

  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to));

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="page-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-priority" style={{ fontSize: '0.7rem' }}>
              IMAGINE CUP STAGE 6/7
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--np-text-tertiary)' }}>
              Autonomous Network Graph Topology
            </span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Network Topology Visualizer</h1>
          <p style={{ margin: 0, color: 'var(--np-text-secondary)', fontSize: '0.88rem' }}>
            Interactive relationship clusters, enterprise hubs, and real-time cadence SLA horizons
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setFilterMode('all')}
            className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', fontWeight: filterMode === 'all' ? 700 : 500 }}
          >
            All Relationships
          </button>
          <button
            onClick={() => setFilterMode('priority')}
            className={`btn btn-sm ${filterMode === 'priority' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', fontWeight: filterMode === 'priority' ? 700 : 500 }}
          >
            Priority Cluster
          </button>
          <button
            onClick={() => setFilterMode('overdue')}
            className={`btn btn-sm ${filterMode === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', fontWeight: filterMode === 'overdue' ? 700 : 500, color: filterMode === 'overdue' ? '#fff' : '#ef4444' }}
          >
            SLA Overdue Only
          </button>
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
              gap: 14,
              alignItems: 'center',
              fontSize: '0.72rem',
              color: 'var(--np-text-tertiary)',
              background: 'var(--np-bg-secondary)',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--np-border)',
              zIndex: 10,
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
              <span style={{ width: 9, height: 9, borderRadius: '50%', border: '2px solid #EF4444', display: 'inline-block' }} /> SLA Breach
            </span>
          </div>

          <svg
            viewBox="0 0 880 620"
            style={{ width: '100%', height: 600, display: 'block', background: 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.04) 0%, transparent 70%)' }}
          >
            {/* Edges */}
            {filteredEdges.map((e, idx) => {
              const fromNode = nodes.find(n => n.id === e.from);
              const toNode = nodes.find(n => n.id === e.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted =
                (selectedNode && (selectedNode.id === fromNode.id || selectedNode.id === toNode.id)) ||
                (hoveredNode && (hoveredNode.id === fromNode.id || hoveredNode.id === toNode.id));

              return (
                <line
                  key={idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isHighlighted ? 'var(--np-accent)' : 'var(--np-border)'}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeDasharray={isHighlighted ? 'none' : '3 3'}
                  opacity={isHighlighted ? 0.9 : 0.45}
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
                      filter={isSelected ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))' : 'none'}
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
                      opacity={0.8}
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  <circle
                    r={16}
                    fill={fillColor}
                    stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isSelected ? 3 : 1}
                    filter={isSelected ? 'drop-shadow(0 0 10px rgba(79, 70, 229, 0.7))' : 'none'}
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
              width: 330,
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
                <div style={{ fontSize: '0.78rem', color: selectedNode.isOverdue ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
                  {selectedNode.isOverdue ? <AlertCircle size={14} /> : <Clock size={14} />}
                  <span>{selectedNode.isOverdue ? 'Cadence SLA Overdue' : 'Cadence on Track'}</span>
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
    </div>
  );
}
