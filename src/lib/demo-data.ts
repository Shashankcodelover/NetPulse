// ═══════════════════════════════════════════════════════
// NetPlus — Shashank J Verified LinkedIn & Industry Network
// Sourced from Official LinkedIn Archive Export (1,933 Connections)
// ═══════════════════════════════════════════════════════
import { Contact, Interaction } from './types';

export const DEMO_CONTACTS: Contact[] = [
  {
    id: 'contact-sandeep-guna',
    user_id: 'user-shashank',
    full_name: 'Sandeep Gunasekaran',
    company: 'Visa',
    title: 'Director | Cloud Security Engineering',
    email: 'sandeep.gunasekaran@visa.example.com',
    linkedin_url: 'https://www.linkedin.com/in/sandeepguna',
    previous_company: 'Cisco Systems',
    previous_title: 'Senior Cloud Security Architect',
    source: 'linkedin',
    relationship_tier: 'priority',
    notes: 'Key industry connection at Visa. Mentoring on enterprise cloud perimeter defense, zero-trust token issuance, and Smart Attendance zero-fraud cryptographic verification.',
    last_contacted_at: new Date(Date.now() - 38 * 86400000).toISOString(),
    last_bulk_synced_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_enriched_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 140 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 38 * 86400000).toISOString(),
  },
  {
    id: 'contact-pravallika-varikuti',
    user_id: 'user-shashank',
    full_name: 'Pravallika Varikuti',
    company: 'Bosch Global Software Technologies',
    title: 'Software Engineer',
    email: 'pravallika.varikuti@bosch.example.com',
    linkedin_url: 'https://www.linkedin.com/in/pravallika-varikuti-9a350a240',
    previous_company: 'Bosch Engineering',
    previous_title: 'Graduate Trainee',
    source: 'linkedin',
    relationship_tier: 'priority',
    notes: 'Bosch alumni network. Discussed automotive backend microservices and telemetry ingestion pipelines.',
    last_contacted_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    last_bulk_synced_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_enriched_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
];
export const DEMO_INTERACTIONS: Interaction[] = [
  {
    id: 'demo-int-1',
    contact_id: 'contact-sandeep-guna',
    user_id: 'user-shashank',
    type: 'call',
    content: 'Deep-dive on zero-trust identity architectures and HMAC SHA-256 rotating token generation for Smart Attendance.',
    created_at: new Date(Date.now() - 38 * 86400000).toISOString(),
  },
  {
    id: 'demo-int-2',
    contact_id: 'contact-pravallika-varikuti',
    user_id: 'user-shashank',
    type: 'message',
    content: 'Discussed Bosch automotive IoT telemetry benchmarks and distributed streaming queues in Node.js.',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: 'demo-int-3',
    contact_id: 'contact-nagesh-bhavi',
    user_id: 'user-shashank',
    type: 'note',
    content: 'Reviewing HPE hybrid cloud deployment topologies for DevFlow Pro real-time analytics.',
    created_at: new Date(Date.now() - 32 * 86400000).toISOString(),
  },
  {
    id: 'demo-int-4',
    contact_id: 'contact-aritra-mondal',
    user_id: 'user-shashank',
    type: 'call',
    content: 'Finalized student registration workflows and judging criteria for HACK-OLYMPIC 2026 at JSS STU.',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  }
];
