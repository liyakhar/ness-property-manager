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
  data: Partial<Property> & {
    images?: string[] | null;
    [key: string]: unknown; // Allow custom fields
  }
): Promise<ApiResponse<Property>> {
  try {
    // Basic validation
    if (data.readinessStatus && !Object.values(ReadinessStatus).includes(data.readinessStatus)) {
      return err({ message: 'Invalid readinessStatus', status: 400 });
    }

    // Separate standard fields from custom fields
    const {
      apartmentNumber,
      location,
      rooms,
      readinessStatus,
      propertyType,
      occupancyStatus,
      urgentMatter,
      apartmentContents,
      images,
      hidden,
      customFields,
      ...otherFields
    } = data;

    // Prepare standard fields
    const standardFields: Partial<
      Pick<
        Property,
        | 'apartmentNumber'
        | 'location'
        | 'rooms'
        | 'readinessStatus'
        | 'propertyType'
        | 'occupancyStatus'
        | 'urgentMatter'
        | 'apartmentContents'
        | 'images'
        | 'hidden'
        | 'customFields'
      >
    > = {
      apartmentNumber,
      location,
      rooms,
      readinessStatus,
      propertyType,
      occupancyStatus,
      urgentMatter,
      apartmentContents,
      images,
      hidden,
      customFields,
    };

    // Handle custom fields - merge with existing customFields
    let finalCustomFields: Record<string, unknown> | undefined = customFields as
      | Record<string, unknown>
      | undefined;
    if (Object.keys(otherFields).length > 0) {
      // Get existing custom fields
      const existingProperty = await prisma.property.findUnique({
        where: { id },
        select: { customFields: true },
      });

      const existingCustomFields =
        (existingProperty?.customFields as Record<string, unknown>) || {};

      // Merge new custom fields with existing ones
      finalCustomFields = {
        ...existingCustomFields,
        ...otherFields,
      };

      // Remove undefined values
      if (finalCustomFields) {
        Object.keys(finalCustomFields).forEach((key) => {
          if (finalCustomFields?.[key] === undefined) {
            delete finalCustomFields![key];
          }
        });
      }
    }

    // Add custom fields to the update data
    if (finalCustomFields !== undefined) {
      standardFields.customFields = finalCustomFields as any; // Cast to JsonValue
    }

    const updated = await prisma.property.update({
      where: { id },
      data: standardFields as Record<string, unknown>, // Type assertion needed due to Prisma's strict typing
    });
    return ok(updated);
  } catch (error) {
    console.error('Error updating property:', error);
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
