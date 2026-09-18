// ═══════════════════════════════════════════════════════
// NetPulse — Core Type Definitions
// ═══════════════════════════════════════════════════════

export type RelationshipTier = 'priority' | 'warm' | 'cold';
export type ContactSource = 'linkedin' | 'whatsapp' | 'manual';
export type InteractionType = 'message' | 'comment' | 'call' | 'note';

export interface Contact {
  id: string;
  user_id: string;
  full_name: string;
  company: string | null;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  previous_company: string | null;
  previous_title: string | null;
  source: ContactSource;
  relationship_tier: RelationshipTier;
  last_contacted_at: string | null;
  last_bulk_synced_at: string | null;
  last_enriched_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  contact_id: string;
  user_id: string;
  type: InteractionType;
  content: string | null;
  created_at: string;
}

export type RelationshipType =
  | 'colleague'
  | 'introduced_by'
  | 'advisor'
  | 'co_investor'
  | 'partner'
  | 'mentor'
  | 'client'
  // Creative Virtuality Dimensions:
  | 'quantum_entanglement'     // 🌌 Quantum Co-Founder Entanglement
  | 'synaptic_resonator'       // 🧬 Synaptic Resonance Link
  | 'gravitational_orbit'      // 🪐 Gravitational Deal Orbit
  | 'stealth_endorsement'      // ⚡ Zero-Knowledge Stealth Vouch
  | 'holosphere_anchor'        // 🔮 Holosphere Virtuality Anchor
  | 'autonomous_probe'         // 🛰️ Autonomous Serendipity Probe
  | 'value_vortex';            // 🌀 Reciprocal Value Vortex

export interface Relationship {
  id: string;
  from_contact_id: string;
  to_contact_id: string;
  type: RelationshipType;
  notes?: string | null;
  created_at: string;
  // Creative Virtuality Enhancements
  resonance?: number;          // 0 - 100% sync frequency
  virtuality_layer?: 'quantum' | 'synaptic' | 'gravitational' | 'astral' | 'stealth';
  status?: 'active' | 'pending_handshake' | 'entangled' | 'dormant';
  pulse_rate_hz?: number;      // e.g. 432Hz, 528Hz harmonic frequency
  initiator_user_id?: string;
  target_user_id?: string;
  shared_tags?: string[];
}

export interface UserPersona {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  avatarGradient: string;
  initials: string;
  focus: string;
  networkRole: 'Venture Partner' | 'Quantum Architect';
}

export interface PriorityScore {
  id: string;
  contact_id: string;
  user_id: string;
  score: number;
  recency_score: number;
  tier_score: number;
  title_score: number;
  engagement_score: number;
  last_calculated_at: string;
}

export interface Draft {
  id: string;
  contact_id: string;
  user_id: string;
  source_text: string;
  summary: string | null;
  draft_options: DraftOption[];
  created_at: string;
}

export interface SocialCapitalMetrics {
  score: number;
  cadenceHealth: 'Optimal' | 'Stable' | 'At Risk' | 'Dormant';
  reciprocityRatio: number;
  touchpointCount: number;
  seniorityWeight: number;
  recommendedAction: string;
}

export interface DraftOption {
  type: 'congratulate' | 'question' | 'insight';
  text: string;
}

export interface ScoringWeights {
  recency_weight: number;     // 0-100, how much "days since last contact" matters
  tier_weight: number;        // 0-100, priority/warm/cold tier importance
  title_weight: number;       // 0-100, role/title importance (Founder > IC)
  engagement_weight: number;  // 0-100, interaction history importance
}

export interface UserSettings {
  id: string;
  user_id: string;
  scoring_weights: ScoringWeights;
  digest_count: number;       // How many contacts in daily digest (10-15)
  digest_email_time: string;  // "08:00" format
  digest_email_enabled: boolean;
  cadence_priority_days: number;   // Target cadence for priority contacts (days)
  cadence_warm_days: number;       // Target cadence for warm contacts (days)
  cadence_cold_days: number;       // Target cadence for cold contacts (days)
  target_companies: string[];      // Companies that get bonus scoring
  target_titles: string[];         // Titles that get bonus scoring
  created_at: string;
  updated_at: string;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  recency_weight: 35,
  tier_weight: 25,
  title_weight: 20,
  engagement_weight: 20,
};

export const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  scoring_weights: DEFAULT_SCORING_WEIGHTS,
  digest_count: 12,
  digest_email_time: '08:00',
  digest_email_enabled: false,
  cadence_priority_days: 3,
  cadence_warm_days: 30,
  cadence_cold_days: 90,
  target_companies: [],
  target_titles: ['Founder', 'CEO', 'CTO', 'VP', 'Director', 'Head of', 'Partner'],
};

// Import-related types
export interface LinkedInCSVRow {
  'First Name': string;
  'Last Name': string;
  'Email Address'?: string;
  'Company'?: string;
  'Position'?: string;
  'Connected On'?: string;
  'URL'?: string;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  unchanged: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  name: string;
  message: string;
}

export interface ContactWithScore extends Contact {
  priority_score?: PriorityScore;
  days_since_contact: number | null;
  is_overdue: boolean;
}

// Digest contact — what's shown on the daily digest page
export interface DigestContact extends ContactWithScore {
  suggested_reason: string;
}
