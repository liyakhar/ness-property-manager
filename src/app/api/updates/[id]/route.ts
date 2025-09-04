import type { Update } from '@prisma/client';
import { err, ok, type Result } from 'neverthrow';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

type ApiResponse<T> = Result<T, { message: string; status: number }>;

async function getUpdateById(id: string): Promise<ApiResponse<Update | null>> {
  try {
    const item = await prisma.update.findUnique({ where: { id } });
    return ok(item);
  } catch {
    return err({ message: 'Failed to fetch update', status: 500 });
  }
}

const updateUpdateSchema = z.object({
  author: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
});

async function updateUpdate(id: string, data: unknown): Promise<ApiResponse<Update>> {
  try {
    const parsed = updateUpdateSchema.safeParse(data);
    if (!parsed.success) {
      return err({ message: 'Invalid request body', status: 400 });
    }

    const updated = await prisma.update.update({
      where: { id },
      data: parsed.data,
    });
    return ok(updated);
  } catch {
    return err({ message: 'Failed to update update', status: 500 });
  }
}

async function deleteUpdate(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    await prisma.update.delete({ where: { id } });
    return ok({ id });
  } catch {
    return err({ message: 'Failed to delete update', status: 500 });
  }
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await getUpdateById(id);
  return result.match(
    (item) => NextResponse.json(item),
    (error) => NextResponse.json({ error: error.message }, { status: error.status })
  );
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const result = await updateUpdate(id, body);
    return result.match(
      (item) => NextResponse.json(item),
      (error) => NextResponse.json({ error: error.message }, { status: error.status })
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await deleteUpdate(id);
  return result.match(
    (payload) => NextResponse.json(payload),
    (error) => NextResponse.json({ error: error.message }, { status: error.status })
  );
}
