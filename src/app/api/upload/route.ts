import { NextRequest, NextResponse } from 'next/server';
import { parseLinkedInCSV } from '@/lib/csv-parser';
import { serverStore } from '@/lib/storage/server-store';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let parsedContacts: any[] = [];
    let errors: any[] = [];

    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (Array.isArray(body)) {
        parsedContacts = body;
      } else if (body.csv_content) {
        const result = await parseLinkedInCSV(body.csv_content);
        parsedContacts = result.contacts;
        errors = result.errors;
      } else if (body.contacts && Array.isArray(body.contacts)) {
        parsedContacts = body.contacts;
      } else {
        return NextResponse.json(
          { status: 'error', message: 'Expected JSON array or object with csv_content or contacts' },
          { status: 400 }
        );
      }
    } else {
      // Multipart or raw text
      const rawText = await request.text();
      const result = await parseLinkedInCSV(rawText);
      parsedContacts = result.contacts;
      errors = result.errors;
    }

    let addedCount = 0;
    const addedContacts = [];

    for (const c of parsedContacts) {
      if (!c.full_name && !c['First Name']) continue;
      const name = c.full_name || `${c['First Name'] || ''} ${c['Last Name'] || ''}`.trim();
      if (!name) continue;

      const created = serverStore.createContact({
        full_name: name,
        company: c.company || c['Company'] || null,
        title: c.title || c['Position'] || null,
        email: c.email || c['Email Address'] || null,
        linkedin_url: c.linkedin_url || c['URL'] || null,
        source: 'linkedin',
        relationship_tier: 'warm',
      });
      addedContacts.push(created);
      addedCount++;
    }

    return NextResponse.json({
      status: 'success',
      total_processed: parsedContacts.length,
      added: addedCount,
      errors,
      sample: addedContacts.slice(0, 5),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
