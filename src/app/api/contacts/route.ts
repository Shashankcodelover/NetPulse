import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/storage/server-store';
import type { Contact } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const tier = searchParams.get('tier') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : undefined;

    const contacts = serverStore.getContacts({ search, tier, limit, offset });
    return NextResponse.json({
      status: 'success',
      total: contacts.length,
      contacts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.full_name || typeof body.full_name !== 'string' || !body.full_name.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'full_name is required' },
        { status: 400 }
      );
    }

    const created = serverStore.createContact(body);

    // If initial relationship specified
    if (body.connect_to_contact_id && body.relationship_type) {
      serverStore.createRelationship({
        from_contact_id: created.id,
        to_contact_id: body.connect_to_contact_id,
        type: body.relationship_type,
        notes: body.relationship_notes || null,
      });
    }

    return NextResponse.json(
      { status: 'success', contact: created },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to create contact' },
      { status: 500 }
    );
  }
}
