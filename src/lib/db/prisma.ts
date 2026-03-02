import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Set up WebSocket for Neon in non-edge environments
if (typeof globalThis.WebSocket === "undefined") {
  // Only needed for Node.js environments, not edge
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use Neon serverless adapter in production
  if (process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("neon.tech")) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter });
  }
  // Use standard Prisma client in development
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
