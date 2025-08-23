import { NextRequest, NextResponse } from "next/server";

import { PrismaClient, Property } from "@prisma/client";
import { err, ok, Result } from "neverthrow";

const prisma = new PrismaClient();

type ApiResponse<T> = Result<T, { message: string; status: number }>;

async function getProperties(): Promise<ApiResponse<Property[]>> {
  try {
    const properties = await prisma.property.findMany({
      include: {
        tenants: true,
      },
    });
    return ok(properties);
  } catch {
    return err({ message: "Failed to fetch properties", status: 500 });
  }
}

async function createProperty(data: Partial<Property>): Promise<ApiResponse<Property>> {
  try {
    const property = await prisma.property.create({
      data: {
        apartmentNumber: data.apartmentNumber!,
        location: data.location!,
        rooms: data.rooms!,
        readinessStatus: data.readinessStatus!,
        urgentMatter: data.urgentMatter,
      },
    });
    return ok(property);
  } catch {
    return err({ message: "Failed to create property", status: 500 });
  }
}

export async function GET() {
  const result = await getProperties();

  return result.match(
    (properties) => NextResponse.json(properties),
    (error) => NextResponse.json({ error: error.message }, { status: error.status }),
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createProperty(body);

    return result.match(
      (property) => NextResponse.json(property, { status: 201 }),
      (error) => NextResponse.json({ error: error.message }, { status: error.status }),
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
