import { type NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createCustomFieldSchema, entityTypeSchema } from '@/types/custom-field.schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityTypeParam = searchParams.get('entityType');

    // Validate entityType if provided
    if (entityTypeParam) {
      const validationResult = entityTypeSchema.safeParse(entityTypeParam);
      if (!validationResult.success) {
        return NextResponse.json({ error: 'Invalid entityType parameter' }, { status: 400 });
      }
    }

    // Build where clause
    const where = entityTypeParam ? { entityType: entityTypeParam as 'PROPERTY' | 'TENANT' } : {};

    // Fetch custom field definitions
    const customFields = await prisma.customFieldDefinition.findMany({
      where,
      orderBy: [{ entityType: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json(customFields);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return NextResponse.json({ error: 'Failed to fetch custom fields' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createCustomFieldSchema.safeParse(body);
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

    // Check if fieldId already exists
    const existingField = await prisma.customFieldDefinition.findUnique({
      where: { fieldId: data.fieldId },
    });

    if (existingField) {
      return NextResponse.json({ error: 'Field ID already exists' }, { status: 409 });
    }

    // Create new custom field definition
    const customField = await prisma.customFieldDefinition.create({
      data,
    });

    return NextResponse.json(customField, { status: 201 });
  } catch (error) {
    console.error('Error creating custom field:', error);
    return NextResponse.json({ error: 'Failed to create custom field' }, { status: 500 });
  }
}
