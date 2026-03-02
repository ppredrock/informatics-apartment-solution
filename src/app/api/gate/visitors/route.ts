import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";

async function getUser() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;
  return prisma.user.findUnique({ where: { firebaseUid: tokens.decodedToken.uid } });
}

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const today = searchParams.get("today");

  const where: any = { societyId: user.societyId };
  if (today === "true") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    where.entryTime = { gte: start, lte: end };
  }

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      include: {
        unit: { include: { block: true } },
        approvedBy: { select: { name: true } },
        gatekeeper: { select: { name: true } },
      },
      orderBy: { entryTime: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.visitor.count({ where }),
  ]);

  return paginatedResponse(visitors, total, page, pageSize);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const visitor = await prisma.visitor.create({
    data: {
      name: body.name,
      phone: body.phone || null,
      purpose: body.purpose,
      purposeDetail: body.purposeDetail || null,
      vehicleNo: body.vehicleNo || null,
      entryTime: new Date(),
      unitId: body.unitId,
      gatekeeperId: user.id,
      societyId: user.societyId,
    },
    include: {
      unit: { include: { block: true } },
    },
  });

  return successResponse(visitor, 201);
}
