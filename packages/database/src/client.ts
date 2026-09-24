import { PrismaClient } from '@prisma/client';

// Global single instance pattern for Prisma Client (prevents connection exhaustion)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Ensure global singleton is always assigned in all environments
globalForPrisma.prisma = prisma;

export default prisma;
export * from '@prisma/client';
