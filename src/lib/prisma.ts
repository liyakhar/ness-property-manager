import { PrismaClient } from '@prisma/client';

// Ensure a single PrismaClient instance across hot reloads in development
declare global {
  var prismaClient: PrismaClient | undefined;
}

export const prisma: PrismaClient = globalThis.prismaClient ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClient = prisma;
}
