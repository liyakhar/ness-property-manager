import { NextRequest, NextResponse } from "next/server";

import { PrismaClient, Tenant } from "@prisma/client";
import { err, ok, Result } from "neverthrow";

const prisma = new PrismaClient();

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
    return err({ message: "Failed to fetch tenants", status: 500 });
  }
}

async function createTenant(data: Partial<Tenant>): Promise<ApiResponse<Tenant>> {
  try {
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name!,
        apartmentId: data.apartmentId!,
        entryDate: new Date(data.entryDate!),
        notes: data.notes,
      },
      include: {
        apartment: true,
      },
    });
    return ok(tenant);
  } catch {
    return err({ message: "Failed to create tenant", status: 500 });
  }
}

export async function GET() {
  const result = await getTenants();

  return result.match(
    (tenants) => NextResponse.json(tenants),
    (error) => NextResponse.json({ error: error.message }, { status: error.status }),
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createTenant(body);

    return result.match(
      (tenant) => NextResponse.json(tenant, { status: 201 }),
      (error) => NextResponse.json({ error: error.message }, { status: error.status }),
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
