import { type NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { updateCustomFieldSchema } from '@/types/custom-field.schema';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = updateCustomFieldSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if custom field exists
    const existingField = await prisma.customFieldDefinition.findUnique({
      where: { id },
    });

    if (!existingField) {
      return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
    }

    // Update custom field definition
    const updatedField = await prisma.customFieldDefinition.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedField);
  } catch (error) {
    console.error('Error updating custom field:', error);
    return NextResponse.json({ error: 'Failed to update custom field' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const cleanupData = searchParams.get('cleanupData') === 'true';

    // Check if custom field exists
    const existingField = await prisma.customFieldDefinition.findUnique({
      where: { id },
    });

    if (!existingField) {
      return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
    }

    // If cleanup is requested, remove the field from all records
    if (cleanupData) {
      const { fieldId, entityType } = existingField;

      if (entityType === 'PROPERTY') {
        // Remove field from all properties
        const properties = await prisma.property.findMany({
          where: {
            customFields: {
              path: [fieldId],
              not: null as any,
            },
          },
        });

        for (const property of properties) {
          const customFields = (property.customFields as Record<string, unknown>) || {};
          const { [fieldId]: _removed, ...remainingFields } = customFields;

          await prisma.property.update({
            where: { id: property.id },
            data: { customFields: remainingFields as any },
          });
        }
      } else if (entityType === 'TENANT') {
        // Remove field from all tenants
        const tenants = await prisma.tenant.findMany({
          where: {
            customFields: {
              path: [fieldId],
              not: null as any,
            },
          },
        });

        for (const tenant of tenants) {
          const customFields = (tenant.customFields as Record<string, unknown>) || {};
          const { [fieldId]: _removed, ...remainingFields } = customFields;

          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { customFields: remainingFields as any },
          });
        }
      }
    }

    // Delete the custom field definition
    await prisma.customFieldDefinition.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    return NextResponse.json({ error: 'Failed to delete custom field' }, { status: 500 });
  }
}
