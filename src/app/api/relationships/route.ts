import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/storage/server-store';
import type { RelationshipType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contact_id') || undefined;

    const relationships = serverStore.getRelationships(contactId);
    return NextResponse.json({
      status: 'success',
      total: relationships.length,
      relationships,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to fetch relationships' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.from_contact_id || !body.to_contact_id) {
      return NextResponse.json(
        { status: 'error', message: 'from_contact_id and to_contact_id are required' },
        { status: 400 }
      );
    }

    if (body.from_contact_id === body.to_contact_id) {
      return NextResponse.json(
        { status: 'error', message: 'Cannot create relationship to self' },
        { status: 400 }
      );
    }

    const type: RelationshipType = body.type || 'colleague';
    const created = serverStore.createRelationship({
      from_contact_id: body.from_contact_id,
      to_contact_id: body.to_contact_id,
      type,
      notes: body.notes || null,
    });

    return NextResponse.json(
      { status: 'success', relationship: created },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to create relationship' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { status: 'error', message: 'Relationship id is required' },
        { status: 400 }
      );
    }

    const deleted = serverStore.deleteRelationship(id);
    if (!deleted) {
      return NextResponse.json(
        { status: 'error', message: 'Relationship not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: `Relationship ${id} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to delete relationship' },
      { status: 500 }
    );
  }
}
