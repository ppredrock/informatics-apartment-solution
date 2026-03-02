import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use Neon HTTP adapter in production (no WebSocket needed)
  if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("neon.tech")) {
    const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
    return new PrismaClient({ adapter });
  }
  // Use standard Prisma client in development
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
