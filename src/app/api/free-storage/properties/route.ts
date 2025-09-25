import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { freeStorage } from '@/lib/free-storage';

// GET /api/free-storage/properties
export async function GET() {
  try {
    const properties = freeStorage.properties.getAll();
    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/free-storage/properties
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const property = freeStorage.properties.create(body);
    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
