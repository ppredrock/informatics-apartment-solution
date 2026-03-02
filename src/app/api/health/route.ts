import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";
  checks.FIREBASE_ADMIN_PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID ? "set" : "MISSING";
  checks.FIREBASE_ADMIN_PRIVATE_KEY = process.env.FIREBASE_ADMIN_PRIVATE_KEY ? "set" : "MISSING";
  checks.COOKIE_SECRET_CURRENT = process.env.COOKIE_SECRET_CURRENT ? "set" : "MISSING";

  // Test DB connection
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const result = await prisma.$queryRawUnsafe("SELECT 1 as ok");
    checks.db_connection = "OK";
  } catch (e: any) {
    checks.db_connection = `ERROR: ${e.message}`;
  }

  return NextResponse.json(checks);
}
