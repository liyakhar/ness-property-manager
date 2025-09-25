import { NextRequest, NextResponse } from 'next/server';
import { freeStorage } from '@/lib/free-storage';

// GET /api/free-storage/updates
export async function GET() {
  try {
    const updates = freeStorage.updates.getAll();
    return NextResponse.json({ success: true, data: updates });
  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch updates' },
      { status: 500 }
    );
  }
}

// POST /api/free-storage/updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const update = freeStorage.updates.create(body);
    return NextResponse.json({ success: true, data: update });
  } catch (error) {
    console.error('Error creating update:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create update' },
      { status: 500 }
    );
  }
}
