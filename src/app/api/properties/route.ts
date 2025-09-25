import { OccupancyStatus, type Property, PropertyType, ReadinessStatus } from '@prisma/client';
import { err, ok, type Result } from 'neverthrow';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

type ApiResponse<T> = Result<T, { message: string; status: number }>;

async function getProperties(): Promise<ApiResponse<Property[]>> {
  try {
    const properties = await prisma.property.findMany({
      include: {
        tenants: true,
      },
    });
    return ok(properties);
  } catch (_error) {
    return err({ message: 'Failed to fetch properties', status: 500 });
  }
}

const createPropertySchema = z.object({
  apartmentNumber: z.number().int().nonnegative(),
  location: z.string().min(1),
  rooms: z.number().int().positive(),
  readinessStatus: z.nativeEnum(ReadinessStatus).default('unfurnished'),
  propertyType: z.nativeEnum(PropertyType).default('rent'),
  occupancyStatus: z.nativeEnum(OccupancyStatus).default('available'),
  apartmentContents: z.string().optional().nullable(),
  urgentMatter: z.string().optional().nullable(),
});

async function createProperty(data: Partial<Property>): Promise<ApiResponse<Property>> {
  try {
    const parsed = createPropertySchema.safeParse(data);
    if (!parsed.success) {
      return err({ message: 'Invalid request body', status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        apartmentNumber: parsed.data.apartmentNumber,
        location: parsed.data.location,
        rooms: parsed.data.rooms,
        readinessStatus: parsed.data.readinessStatus,
        propertyType: parsed.data.propertyType,
        occupancyStatus: parsed.data.occupancyStatus,
        apartmentContents: parsed.data.apartmentContents ?? undefined,
        urgentMatter: parsed.data.urgentMatter ?? undefined,
      },
    });
    return ok(property);
  } catch {
    return err({ message: 'Failed to create property', status: 500 });
  }
}

export async function GET() {
  const result = await getProperties();

  return result.match(
    (properties) => NextResponse.json(properties),
    (error) => NextResponse.json({ error: error.message }, { status: error.status })
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createProperty(body);

    return result.match(
      (property) => NextResponse.json(property, { status: 201 }),
      (error) => NextResponse.json({ error: error.message }, { status: error.status })
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
