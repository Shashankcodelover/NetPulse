// ═══════════════════════════════════════════════════════
// CSV Parser — LinkedIn Connections Export
// ═══════════════════════════════════════════════════════

import Papa from 'papaparse';
import { z } from 'zod';
import type { Contact, ImportError, LinkedInCSVRow } from '@/lib/types';

// LinkedIn CSV has these columns (may vary slightly by export date):
// First Name, Last Name, URL, Email Address, Company, Position, Connected On
const LinkedInRowSchema = z.object({
  'First Name': z.string().min(1, 'First name is required'),
  'Last Name': z.string().min(1, 'Last name is required'),
  'Email Address': z.string().email().optional().or(z.literal('')),
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
 * Parse a LinkedIn connections CSV file and return validated contacts.
 */
export function parseLinkedInCSV(file: File): Promise<{
  contacts: ParsedContact[];
  errors: ImportError[];
}> {
  return new Promise((resolve, reject) => {
    Papa.parse<LinkedInCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        const contacts: ParsedContact[] = [];
        const errors: ImportError[] = [];

        results.data.forEach((row, index) => {
          try {
            // Skip the "notes" row that LinkedIn sometimes adds at the top
            const firstName = row['First Name']?.trim();
            const lastName = row['Last Name']?.trim();

            if (!firstName && !lastName) {
              return; // Skip empty rows silently
            }

            const validation = LinkedInRowSchema.safeParse(row);

            if (!validation.success) {
              errors.push({
                row: index + 2, // +2 for header row + 0-index
                name: `${firstName || ''} ${lastName || ''}`.trim(),
                message: validation.error.issues.map(i => i.message).join('; '),
              });
              return;
            }

            const fullName = `${firstName} ${lastName}`.trim();
            if (!fullName) return;

            contacts.push({
              full_name: fullName,
              email: row['Email Address']?.trim() || null,
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
