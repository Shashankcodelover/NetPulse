import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/storage/server-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contact = serverStore.getContactById(id);

    if (!contact) {
      return NextResponse.json(
        { status: 'error', message: 'Contact not found' },
        { status: 404 }
      );
    }

    const interactions = serverStore.getInteractions(id);
    const relationships = serverStore.getRelationships(id);

    return NextResponse.json({
      status: 'success',
      contact,
      interactions,
      relationships,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to retrieve contact' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = serverStore.updateContact(id, body);
    if (!updated) {
      return NextResponse.json(
        { status: 'error', message: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      contact: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to update contact' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = serverStore.deleteContact(id);

    if (!deleted) {
      return NextResponse.json(
        { status: 'error', message: 'Contact not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: `Contact ${id} and associated relationships successfully deleted`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
