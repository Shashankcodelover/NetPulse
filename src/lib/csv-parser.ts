// ═══════════════════════════════════════════════════════
// CSV Parser — LinkedIn Connections Export
// ═══════════════════════════════════════════════════════

import Papa from 'papaparse';
import { z } from 'zod';
import type { Contact, ImportError, LinkedInCSVRow } from '@/lib/types';

// LinkedIn CSV has these columns (may vary slightly by export date):
// First Name, Last Name, URL, Email Address, Company, Position, Connected On
// Known column aliases mapping for LinkedIn CSV variations
function normalizeHeader(header: string): string {
  const trimmed = header.trim();
  const lower = trimmed.toLowerCase();
  if (/^first(\s*|_)?name$/i.test(lower) || lower === 'firstname') return 'First Name';
  if (/^last(\s*|_)?name$/i.test(lower) || lower === 'lastname') return 'Last Name';
  if (/^email(\s*|_)?(address)?$/i.test(lower)) return 'Email Address';
  if (/^(company(\s*|_)?(name)?|organization)$/i.test(lower)) return 'Company';
  if (/^(position|title|job(\s*|_)?title|role)$/i.test(lower)) return 'Position';
  if (/^connected(\s*|_)?(on|date)?$/i.test(lower)) return 'Connected On';
  if (/^(url|linkedin(\s*|_)?(url|profile)?|profile(\s*|_)?url|link)$/i.test(lower)) return 'URL';
  return trimmed;
}

const LinkedInRowSchema = z.object({
  'First Name': z.string().optional().or(z.literal('')),
  'Last Name': z.string().optional().or(z.literal('')),
  'Email Address': z.string().optional().or(z.literal('')),
  'Company': z.string().optional().or(z.literal('')),
  'Position': z.string().optional().or(z.literal('')),
  'Connected On': z.string().optional().or(z.literal('')),
  'URL': z.string().optional().or(z.literal('')),
});

export interface ParsedContact {
  full_name: string;
  email: string | null;
  company: string | null;
  title: string | null;
  linkedin_url: string | null;
  connected_on: string | null;
}

/**
 * Parse a LinkedIn connections CSV file or text and return validated contacts.
 * Automatically skips preamble rows (e.g. LinkedIn's "Notes:" disclaimer).
 */
export async function parseLinkedInCSV(fileOrText: File | string): Promise<{
  contacts: ParsedContact[];
  errors: ImportError[];
}> {
  let rawText = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();

  // LinkedIn CSV exports often include 2-4 lines of notes before the header row:
  // "Notes: When exporting your connection list..."
  // Find the line containing the actual column headers:
  const lines = rawText.split(/\r?\n/);
  const headerIdx = lines.findIndex(l => /first(\s*|_)?name/i.test(l) && /last(\s*|_)?name/i.test(l));
  if (headerIdx > 0) {
    rawText = lines.slice(headerIdx).join('\n');
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(rawText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        const contacts: ParsedContact[] = [];
        const errors: ImportError[] = [];

        results.data.forEach((row, index) => {
          try {
            const firstName = row['First Name']?.trim() || '';
            const lastName = row['Last Name']?.trim() || '';
            const fullName = `${firstName} ${lastName}`.trim();

            if (!fullName) {
              return; // Skip completely empty rows
            }

            const rawEmail = row['Email Address']?.trim() || null;
            let email: string | null = null;
            if (rawEmail && z.string().email().safeParse(rawEmail).success) {
              email = rawEmail;
            }

            contacts.push({
              full_name: fullName,
              email,
              company: row['Company']?.trim() || null,
              title: row['Position']?.trim() || null,
              linkedin_url: row['URL']?.trim() || null,
              connected_on: row['Connected On']?.trim() || null,
            });
          } catch (err) {
            errors.push({
              row: index + 2,
              name: `Row ${index + 2}`,
              message: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        });

        resolve({ contacts, errors });
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Detect changes between existing and imported contacts for bulk resync.
 */
export function detectChanges(
  existing: Pick<Contact, 'full_name' | 'company' | 'title'>,
  incoming: ParsedContact
): { changed: boolean; changes: string[] } {
  const changes: string[] = [];

  if (incoming.company && existing.company !== incoming.company) {
    changes.push(`Company: "${existing.company || '(none)'}" → "${incoming.company}"`);
  }

  if (incoming.title && existing.title !== incoming.title) {
    changes.push(`Title: "${existing.title || '(none)'}" → "${incoming.title}"`);
  }

  return { changed: changes.length > 0, changes };
}
