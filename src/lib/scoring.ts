// ═══════════════════════════════════════════════════════
// Priority Scoring Engine
// ═══════════════════════════════════════════════════════
//
// Calculates a 0-100 priority score for each contact based on:
//  - Recency: How long since last contact (higher score = more overdue)
//  - Tier: relationship_tier (priority > warm > cold)
//  - Title: Role/title importance (Founder/CEO/VP > IC)
//  - Engagement: How many interactions we have with them
//
// All weights are user-configurable in settings.

import { differenceInDays } from 'date-fns';
import type { Contact, UserSettings, PriorityScore } from '@/lib/types';

// Known decision-maker titles (case-insensitive matching)
const HIGH_VALUE_TITLES = [
  'founder', 'co-founder', 'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cpo', 'cro',
  'president', 'vice president', 'vp', 'svp', 'evp',
  'director', 'managing director', 'head of', 'chief',
  'partner', 'principal', 'general manager',
];

const MID_VALUE_TITLES = [
  'senior manager', 'manager', 'lead', 'senior', 'staff',
  'architect', 'fellow',
];

/**
 * Calculate the recency sub-score (0-100).
 * More overdue = higher score (they need attention).
 */
function calculateRecencyScore(
  lastContactedAt: string | null,
  tier: string,
  settings: Pick<UserSettings, 'cadence_priority_days' | 'cadence_warm_days' | 'cadence_cold_days'>,
  offsetDays: number = 0
): number {
  if (!lastContactedAt) {
    // Never contacted — maximum urgency
    return 100;
  }

  const simulatedDate = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const daysSince = differenceInDays(simulatedDate, new Date(lastContactedAt));

  if (daysSince < 0) return 0; // Future scheduled contact — not overdue

  // Get the target cadence for this tier
  let targetDays: number;
  switch (tier) {
    case 'priority':
      targetDays = settings.cadence_priority_days;
      break;
    case 'warm':
      targetDays = settings.cadence_warm_days;
      break;
    default:
      targetDays = settings.cadence_cold_days;
  }

  if (targetDays <= 0) targetDays = 30;

  // How overdue are they? Ratio of actual vs target
  const overdueRatio = daysSince / targetDays;

  if (overdueRatio <= 0.5) return 10;   // Recently contacted
  if (overdueRatio <= 0.8) return 25;   // Getting close
  if (overdueRatio <= 1.0) return 50;   // Due soon
  if (overdueRatio <= 1.5) return 75;   // Overdue
  if (overdueRatio <= 2.0) return 90;   // Very overdue
  return 100;                           // Extremely overdue
}

/**
 * Calculate the tier sub-score (0-100).
 */
function calculateTierScore(tier: string): number {
  switch (tier) {
    case 'priority': return 100;
    case 'warm': return 50;
    case 'cold': return 15;
    default: return 25;
  }
}

/**
 * Calculate the title/role sub-score (0-100).
 * Decision-maker titles score higher.
 */
function calculateTitleScore(
  title: string | null,
  targetTitles: string[]
): number {
  if (!title) return 25; // Unknown title gets a mild score

  const lowerTitle = title.toLowerCase();

  // Check user-defined target titles first
  for (const t of targetTitles) {
    if (lowerTitle.includes(t.toLowerCase())) return 100;
  }

  // Check built-in high-value titles
  for (const t of HIGH_VALUE_TITLES) {
    if (lowerTitle.includes(t)) return 90;
  }

  // Check mid-value titles
  for (const t of MID_VALUE_TITLES) {
    if (lowerTitle.includes(t)) return 55;
  }

  return 25; // Default for other titles
}

/**
 * Calculate engagement sub-score based on interaction count.
 */
function calculateEngagementScore(interactionCount: number): number {
  if (interactionCount === 0) return 60; // No history = moderate (they need initial outreach)
  if (interactionCount <= 2) return 40;
  if (interactionCount <= 5) return 50;
  if (interactionCount <= 10) return 65;
  if (interactionCount <= 20) return 80;
  return 90; // Very engaged relationship
}

/**
 * Check if a contact's target company matches the user's target list.
 */
function getCompanyBonus(company: string | null, targetCompanies: string[]): number {
  if (!company || targetCompanies.length === 0) return 0;
  const lowerCompany = company.toLowerCase();
  for (const tc of targetCompanies) {
    if (lowerCompany.includes(tc.toLowerCase())) return 15;
  }
  return 0;
}

/**
 * Calculate the final priority score for a single contact.
 */
export function calculatePriorityScore(
  contact: Contact,
  interactionCount: number,
  settings: UserSettings,
  offsetDays: number = 0
): Omit<PriorityScore, 'id' | 'contact_id' | 'user_id' | 'last_calculated_at'> {
  const weights = settings?.scoring_weights || { recency_weight: 35, tier_weight: 25, title_weight: 20, engagement_weight: 20 };
  const targetTitles = settings?.target_titles || [];
  const targetCompanies = settings?.target_companies || [];
  const totalWeight = weights.recency_weight + weights.tier_weight +
    weights.title_weight + weights.engagement_weight;

  // Calculate each sub-score
  const recency = calculateRecencyScore(contact.last_contacted_at, contact.relationship_tier, settings, offsetDays);
  const tier = calculateTierScore(contact.relationship_tier);
  const title = calculateTitleScore(contact.title, targetTitles);
  const engagement = calculateEngagementScore(interactionCount);

  // Weighted average
  let rawScore = (
    (recency * weights.recency_weight) +
    (tier * weights.tier_weight) +
    (title * weights.title_weight) +
    (engagement * weights.engagement_weight)
  ) / (totalWeight || 1);

  // Company bonus (adds up to 15 points)
  rawScore += getCompanyBonus(contact.company, targetCompanies);

  // Clamp to 0-100
  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  return {
    score,
    recency_score: recency,
    tier_score: tier,
    title_score: title,
    engagement_score: engagement,
  };
}

/**
 * Determine why a contact is being suggested in the digest.
 */
export function getSuggestedReason(
  contact: Contact,
  score: number,
  settings: UserSettings,
  offsetDays: number = 0
): string {
  if (!contact.last_contacted_at) {
    return "You've never reached out — time to break the ice";
  }

  const simulatedDate = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const daysSince = differenceInDays(simulatedDate, new Date(contact.last_contacted_at));

  let targetDays: number;
  switch (contact.relationship_tier) {
    case 'priority': targetDays = settings.cadence_priority_days; break;
    case 'warm': targetDays = settings.cadence_warm_days; break;
    default: targetDays = settings.cadence_cold_days;
  }

  if (daysSince > targetDays * 1.5) {
    return `Critical: Overdue by ${daysSince - targetDays} days (${daysSince}d since contact)`;
  }
  if (daysSince >= targetDays) {
    return `Cadence due: Reached your ${targetDays}-day target`;
  }
  if (score >= 80) {
    return `High value: Strategic decision maker at ${contact.company || 'target firm'}`;
  }
  return `Keep warm: ${daysSince} days since last interaction`;
}

/**
 * Check if a contact is overdue based on their tier cadence.
 */
export function isContactOverdue(
  contact: Contact,
  settings: Pick<UserSettings, 'cadence_priority_days' | 'cadence_warm_days' | 'cadence_cold_days'>,
  offsetDays: number = 0
): boolean {
  if (!contact.last_contacted_at) return true;

  const simulatedDate = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const daysSince = differenceInDays(simulatedDate, new Date(contact.last_contacted_at));
  let targetDays: number;

  switch (contact.relationship_tier) {
    case 'priority': targetDays = settings.cadence_priority_days; break;
    case 'warm': targetDays = settings.cadence_warm_days; break;
    default: targetDays = settings.cadence_cold_days;
  }

  return daysSince >= targetDays;
}
