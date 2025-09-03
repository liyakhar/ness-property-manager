import { NextRequest, NextResponse } from "next/server";

import { Tenant } from "@prisma/client";
import { err, ok, Result } from "neverthrow";

import { prisma } from "@/lib/prisma";

type ApiResponse<T> = Result<T, { message: string; status: number }>;

async function getTenantById(id: string): Promise<ApiResponse<Tenant | null>> {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { apartment: true },
    });
    return ok(tenant);
  } catch {
    return err({ message: "Failed to fetch tenant", status: 500 });
  }
}

async function checkTenantOverlap(
  tenantId: string,
  apartmentId: string,
  entryDate: Date,
  exitDate: Date | null | undefined,
): Promise<boolean> {
  const overlapping = await prisma.tenant.findFirst({
    where: {
      id: { not: tenantId },
      apartmentId,
      OR: [
        {
          AND: [{ entryDate: { lte: exitDate ?? new Date("2999-12-31") } }, { exitDate: null }],
        },
        {
          AND: [{ entryDate: { lte: exitDate ?? new Date("2999-12-31") } }, { exitDate: { gte: entryDate } }],
        },
      ],
    },
  });
  return !!overlapping;
}

async function getTargetDates(
  id: string,
  data: Partial<Pick<Tenant, "entryDate" | "exitDate">>,
): Promise<{ entryDate: Date | undefined; exitDate: Date | null | undefined }> {
  const current = await prisma.tenant.findUnique({
    where: { id },
    select: { entryDate: true, exitDate: true },
  });

  return {
    entryDate: data.entryDate ? new Date(data.entryDate) : current?.entryDate,
    exitDate: data.exitDate ? new Date(data.exitDate) : current?.exitDate,
  };
}

/* eslint-disable complexity */
async function updateTenant(
  id: string,
  data: Partial<
    Pick<
      Tenant,
      | "name"
      | "apartmentId"
      | "entryDate"
      | "exitDate"
      | "status"
      | "notes"
      | "receivePaymentDate"
      | "utilityPaymentDate"
      | "internetPaymentDate"
      | "isPaid"
      | "paymentAttachment"
      | "hidden"
    >
  >,
): Promise<ApiResponse<Tenant>> {
  try {
    // Convert date strings to Date if provided
    const preparedData: Partial<
      Pick<
        Tenant,
        | "name"
        | "apartmentId"
        | "entryDate"
        | "exitDate"
        | "status"
        | "notes"
        | "receivePaymentDate"
        | "utilityPaymentDate"
        | "internetPaymentDate"
        | "isPaid"
        | "paymentAttachment"
        | "hidden"
      >
    > = {
      ...data,
    };
    if (preparedData.entryDate) preparedData.entryDate = new Date(preparedData.entryDate);
    if (preparedData.exitDate) preparedData.exitDate = new Date(preparedData.exitDate);
    if (preparedData.receivePaymentDate) preparedData.receivePaymentDate = new Date(preparedData.receivePaymentDate);
    if (preparedData.utilityPaymentDate) preparedData.utilityPaymentDate = new Date(preparedData.utilityPaymentDate);
    if (preparedData.internetPaymentDate) preparedData.internetPaymentDate = new Date(preparedData.internetPaymentDate);

    // Business rule: prevent multiple active tenants for the same apartment (no overlapping occupancy)
    const targetApartmentId: string | undefined =
      preparedData.apartmentId ??
      (await prisma.tenant.findUnique({ where: { id }, select: { apartmentId: true } }))?.apartmentId;

    if (targetApartmentId && preparedData.entryDate) {
      const { entryDate, exitDate } = await getTargetDates(id, preparedData);
      if (entryDate) {
        const hasOverlap = await checkTenantOverlap(id, targetApartmentId, entryDate, exitDate);
        if (hasOverlap) {
          return err({ message: "Another active tenant overlaps for this apartment", status: 409 });
        }
      }
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: preparedData,
      include: { apartment: true },
    });
    return ok(updated);
  } catch {
    return err({ message: "Failed to update tenant", status: 500 });
  }
}

async function deleteTenant(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    await prisma.tenant.delete({ where: { id } });
    return ok({ id });
  } catch {
    return err({ message: "Failed to delete tenant", status: 500 });
  }
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await getTenantById(id);
  return result.match(
    (tenant) => {
      if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(tenant);
    },
    (error) => NextResponse.json({ error: error.message }, { status: error.status }),
  );
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const result = await updateTenant(id, body);
    return result.match(
      (tenant) => NextResponse.json(tenant),
      (error) => NextResponse.json({ error: error.message }, { status: error.status }),
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const result = await deleteTenant(id);
  return result.match(
    (payload) => NextResponse.json(payload, { status: 200 }),
    (error) => NextResponse.json({ error: error.message }, { status: error.status }),
  );
}
