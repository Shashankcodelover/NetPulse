// ═══════════════════════════════════════════════════════════════════════════════
// NetPulse — Smart Calendar Integration Engine
// Generates universal Google Calendar and iCalendar (.ics) links with AI agendas
// ═══════════════════════════════════════════════════════════════════════════════

import type { Contact } from '@/lib/types';

export interface CalendarEventParams {
  contact: Contact;
  suggestedDate?: Date;
  agendaTopic?: string;
}

export function generateGoogleCalendarUrl({
  contact,
  suggestedDate = new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
  agendaTopic = 'Quarterly Strategy & Alignment Catch-up',
}: CalendarEventParams): string {
  // 30 min duration
  const start = new Date(suggestedDate);
  start.setHours(15, 0, 0, 0); // default 3:00 PM
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const title = encodeURIComponent(`Catch-up: Shashank J <> ${contact.full_name} (${contact.company || 'Strategy'})`);
  const details = encodeURIComponent(
    `Hi ${contact.full_name},\n\nLooking forward to catching up regarding: ${agendaTopic}.\n\nContext & Profile:\n- Role: ${contact.title || 'N/A'}\n- Company: ${contact.company || 'N/A'}\n- NetPulse Priority: ${contact.relationship_tier.toUpperCase()}\n\nBest,\nShashank J`
  );
  const location = encodeURIComponent('Google Meet / Virtual');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatGCalDate(start)}/${formatGCalDate(end)}&details=${details}&location=${location}`;
}

export function generateIcsBlobUrl({
  contact,
  suggestedDate = new Date(Date.now() + 24 * 60 * 60 * 1000),
  agendaTopic = 'Quarterly Strategy & Alignment Catch-up',
}: CalendarEventParams): string {
  const start = new Date(suggestedDate);
  start.setHours(15, 0, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const formatIcsDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15) + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NetPulse CRM//Relationship Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:netpulse-${contact.id}-${Date.now()}@netpulse.shashankj.tech`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:Catch-up: Shashank J <> ${contact.full_name}`,
    `DESCRIPTION:Catch-up discussion on ${agendaTopic}. Role: ${contact.title || ''} at ${contact.company || ''}.`,
    'LOCATION:Google Meet / Zoom',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}
