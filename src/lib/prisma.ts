import { PrismaClient } from "@prisma/client";

// Ensure a single PrismaClient instance across hot reloads in development
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
