// ═══════════════════════════════════════════════════════
// WhatsApp Outreach URL Generator
// Multi-Channel Personal Relationship Management
// ═══════════════════════════════════════════════════════

import type { Contact } from './types';

interface WhatsAppOptions {
  contact: Contact;
  customMessage?: string;
}

/**
 * Generates a direct WhatsApp click-to-chat URL with pre-filled icebreaker
 */
export function generateWhatsAppUrl({ contact, customMessage }: WhatsAppOptions): string {
  const firstName = contact.full_name.split(' ')[0];
  
  let opener = customMessage;
  if (!opener) {
    if (contact.relationship_tier === 'priority') {
      opener = `Hi ${firstName}! Hope you're doing well. Was thinking about your recent work at ${contact.company || 'your team'}—would love to catch up for 15 mins sometime soon when you have a breather!`;
    } else if (contact.relationship_tier === 'warm') {
      opener = `Hey ${firstName}! It's been a little while—wanted to say hello and see how things are shaping up with ${contact.company || 'everything'}!`;
    } else {
      opener = `Hi ${firstName}, hope you're having a great week! Just wanted to drop a quick note to stay connected.`;
    }
  }

  // Pre-seed a clean format if phone exists, otherwise generic wa.me share link
  const encodedText = encodeURIComponent(opener);
  return `https://wa.me/?text=${encodedText}`;
}
