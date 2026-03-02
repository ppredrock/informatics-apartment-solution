import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

async function getUser() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;
  return prisma.user.findUnique({
    where: { firebaseUid: tokens.decodedToken.uid },
    include: { members: { where: { isActive: true } } },
  });
}

export async function GET() {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const preApprovals = await prisma.preApproval.findMany({
    where: { societyId: user.societyId },
    include: {
      member: { include: { user: { select: { name: true } } } },
      unit: { include: { block: true } },
    },
    orderBy: { validFrom: "desc" },
  });

  return successResponse(preApprovals);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const member = user.members?.[0];
  if (!member) return errorResponse("No active membership found", 400);

  const preApproval = await prisma.preApproval.create({
    data: {
      visitorName: body.visitorName,
      visitorPhone: body.visitorPhone || null,
      purpose: body.purpose || null,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
      memberId: member.id,
      unitId: member.unitId,
      societyId: user.societyId,
    },
  });

  return successResponse(preApproval, 201);
}
