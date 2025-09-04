import type { Tenant } from '@prisma/client';
import { err, ok, type Result } from 'neverthrow';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';

type ApiResponse<T> = Result<T, { message: string; status: number }>;

async function getTenants(): Promise<ApiResponse<Tenant[]>> {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        apartment: true,
      },
    });
    return ok(tenants);
  } catch {
    return err({ message: 'Failed to fetch tenants', status: 500 });
  }
}

const createTenantSchema = z.object({
  name: z.string().min(1),
  apartmentId: z.string().min(1),
  entryDate: z
    .union([z.string(), z.date()])
    .transform((v) => (typeof v === 'string' ? new Date(v) : v)),
  status: z.enum(['current', 'past', 'future', 'upcoming']).default('current'),
  notes: z.string().optional().nullable(),
  receivePaymentDate: z
    .union([z.string(), z.date()])
    .transform((v) => (typeof v === 'string' ? new Date(v) : v))
    .default(() => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }),
  utilityPaymentDate: z
    .union([z.string(), z.date()])
    .transform((v) => (typeof v === 'string' ? new Date(v) : v))
    .optional(),
  internetPaymentDate: z
    .union([z.string(), z.date()])
    .transform((v) => (typeof v === 'string' ? new Date(v) : v))
    .optional(),
  isPaid: z.boolean().default(false),
  paymentAttachment: z.string().optional(),
  hidden: z.boolean().default(false),
});

async function createTenant(data: Partial<Tenant>): Promise<ApiResponse<Tenant>> {
  try {
    const parsed = createTenantSchema.safeParse(data);
    if (!parsed.success) {
      return err({ message: 'Invalid request body', status: 400 });
    }

    // Prevent overlapping active tenants on create
    const overlapping = await prisma.tenant.findFirst({
      where: {
        apartmentId: parsed.data.apartmentId,
        OR: [{ exitDate: null }, { exitDate: { gte: parsed.data.entryDate } }],
      },
    });
    if (overlapping) {
      return err({ message: 'Another active tenant overlaps for this apartment', status: 409 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: parsed.data.name,
        apartmentId: parsed.data.apartmentId,
        entryDate: parsed.data.entryDate,
        status: parsed.data.status,
        notes: parsed.data.notes ?? undefined,
        receivePaymentDate: parsed.data.receivePaymentDate,
        utilityPaymentDate: parsed.data.utilityPaymentDate,
        internetPaymentDate: parsed.data.internetPaymentDate,
        isPaid: parsed.data.isPaid,
        paymentAttachment: parsed.data.paymentAttachment,
        hidden: parsed.data.hidden,
      },
      include: {
        apartment: true,
      },
    });
    return ok(tenant);
  } catch {
    return err({ message: 'Failed to create tenant', status: 500 });
  }
}

export async function GET() {
  const result = await getTenants();

  return result.match(
    (tenants) => NextResponse.json(tenants),
    (error) => NextResponse.json({ error: error.message }, { status: error.status })
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createTenant(body);

    return result.match(
      (tenant) => NextResponse.json(tenant, { status: 201 }),
      (error) => NextResponse.json({ error: error.message }, { status: error.status })
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
