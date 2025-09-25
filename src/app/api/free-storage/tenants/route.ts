import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { freeStorage } from '@/lib/free-storage';

// GET /api/free-storage/tenants
export async function GET() {
  try {
    const tenants = freeStorage.tenants.getAll();
    return NextResponse.json({ success: true, data: tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/free-storage/tenants
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenant = freeStorage.tenants.create(body);
    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json({ success: false, error: 'Failed to create tenant' }, { status: 500 });
  }
}
