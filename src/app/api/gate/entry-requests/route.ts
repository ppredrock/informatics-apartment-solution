import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

async function getUser() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;
  return prisma.user.findUnique({ where: { firebaseUid: tokens.decodedToken.uid } });
}

export async function GET() {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const requests = await prisma.entryRequest.findMany({
    where: { societyId: user.societyId },
    include: {
      unit: { include: { block: true } },
      member: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return successResponse(requests);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();

  // Find member for the unit
  const member = await prisma.member.findFirst({
    where: { unitId: body.unitId, isActive: true, societyId: user.societyId },
  });

  const entryRequest = await prisma.entryRequest.create({
    data: {
      visitorName: body.visitorName,
      visitorPhone: body.visitorPhone || null,
      purpose: body.purpose,
      purposeDetail: body.purposeDetail || null,
      unitId: body.unitId,
      memberId: member?.id || null,
      status: "PENDING",
      societyId: user.societyId,
    },
  });

  return successResponse(entryRequest, 201);
}
