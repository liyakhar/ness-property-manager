import type { Update } from '@prisma/client';
import { err, ok, type Result } from 'neverthrow';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

type ApiResponse<T> = Result<T, { message: string; status: number }>;

async function getUpdates(): Promise<ApiResponse<Update[]>> {
  try {
    const updates = await prisma.update.findMany({
      orderBy: { date: 'desc' },
    });
    return ok(updates);
  } catch {
    return err({ message: 'Failed to fetch updates', status: 500 });
  }
}

const createUpdateSchema = z.object({
  author: z.string().min(1),
  content: z.string().min(1),
  date: z.coerce.date(),
});

async function createUpdate(data: unknown): Promise<ApiResponse<Update>> {
  try {
    const parsed = createUpdateSchema.safeParse(data);
    if (!parsed.success) {
      return err({ message: 'Invalid request body', status: 400 });
    }

    const created = await prisma.update.create({
      data: {
        author: parsed.data.author,
        content: parsed.data.content,
        date: parsed.data.date,
      },
    });
    return ok(created);
  } catch {
    return err({ message: 'Failed to create update', status: 500 });
  }
}

export async function GET() {
  const result = await getUpdates();

  return result.match(
    (updates) => NextResponse.json(updates),
    (error) => NextResponse.json({ error: error.message }, { status: error.status })
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createUpdate(body);
    return result.match(
      (update) => NextResponse.json(update, { status: 201 }),
      (error) => NextResponse.json({ error: error.message }, { status: error.status })
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
