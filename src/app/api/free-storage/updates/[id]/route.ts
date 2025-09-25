import { NextRequest, NextResponse } from 'next/server';
import { freeStorage } from '@/lib/free-storage';

// GET /api/free-storage/updates/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const update = freeStorage.updates.getById(params.id);
    if (!update) {
      return NextResponse.json(
        { success: false, error: 'Update not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: update });
  } catch (error) {
    console.error('Error fetching update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch update' },
      { status: 500 }
    );
  }
}

// PUT /api/free-storage/updates/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const update = freeStorage.updates.update(params.id, body);
    if (!update) {
      return NextResponse.json(
        { success: false, error: 'Update not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: update });
  } catch (error) {
    console.error('Error updating update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update update' },
      { status: 500 }
    );
  }
}

// DELETE /api/free-storage/updates/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = freeStorage.updates.delete(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Update not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete update' },
      { status: 500 }
    );
  }
}
