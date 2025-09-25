import { type Property, ReadinessStatus } from '@prisma/client';
import { err, ok, type Result } from 'neverthrow';
import { type NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

type ApiResponse<T> = Result<T, { message: string; status: number }>;

async function getPropertyById(id: string): Promise<ApiResponse<Property | null>> {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { tenants: true },
    });
    return ok(property);
  } catch {
    return err({ message: 'Failed to fetch property', status: 500 });
  }
}

async function updateProperty(
  id: string,
  data: Partial<
    Pick<
      Property,
      | 'apartmentNumber'
      | 'location'
      | 'rooms'
      | 'readinessStatus'
      | 'apartmentContents'
      | 'urgentMatter'
    >
  > & {
    images?: string[] | null;
  }
): Promise<ApiResponse<Property>> {
  try {
    // Basic validation
    if (data.readinessStatus && !Object.values(ReadinessStatus).includes(data.readinessStatus)) {
      return err({ message: 'Invalid readinessStatus', status: 400 });
    }

    // Transform the data to match Prisma's expected types
    const updateData: any = { ...data };
    if (data.images !== undefined) {
      updateData.images = data.images;
    }

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });
    return ok(updated);
  } catch {
    return err({ message: 'Failed to update property', status: 500 });
  }
}

async function deleteProperty(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    await prisma.property.delete({ where: { id } });
    return ok({ id });
  } catch {
    return err({ message: 'Failed to delete property', status: 500 });
  }
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await getPropertyById(id);
  return result.match(
    (property) => {
      if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(property);
    },
    (error) => NextResponse.json({ error: error.message }, { status: error.status })
  );
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const result = await updateProperty(id, body);
    return result.match(
      (property) => NextResponse.json(property),
      (error) => NextResponse.json({ error: error.message }, { status: error.status })
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await deleteProperty(id);
  return result.match(
    (payload) => NextResponse.json(payload, { status: 200 }),
    (error) => NextResponse.json({ error: error.message }, { status: error.status })
  );
}
