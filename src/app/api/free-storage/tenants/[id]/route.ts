import { NextRequest, NextResponse } from 'next/server';
import { freeStorage } from '@/lib/free-storage';

// GET /api/free-storage/tenants/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = freeStorage.tenants.getById(params.id);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tenant' },
      { status: 500 }
    );
  }
}

// PUT /api/free-storage/tenants/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const tenant = freeStorage.tenants.update(params.id, body);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tenant' },
      { status: 500 }
    );
  }
}

// DELETE /api/free-storage/tenants/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = freeStorage.tenants.delete(params.id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tenant' },
      { status: 500 }
    );
  }
}
