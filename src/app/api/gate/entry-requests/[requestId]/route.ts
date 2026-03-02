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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { requestId } = await params;
  const body = await request.json();
  const { status } = body; // "APPROVED" or "REJECTED"

  const entryRequest = await prisma.entryRequest.findFirst({
    where: { id: requestId, societyId: user.societyId },
  });
  if (!entryRequest) return errorResponse("Request not found", 404);

  const updated = await prisma.entryRequest.update({
    where: { id: requestId },
    data: { status, respondedAt: new Date() },
  });

  // If approved, auto-create a visitor entry
  if (status === "APPROVED") {
    await prisma.visitor.create({
      data: {
        name: entryRequest.visitorName,
        phone: entryRequest.visitorPhone,
        purpose: entryRequest.purpose,
        purposeDetail: entryRequest.purposeDetail,
        entryTime: new Date(),
        unitId: entryRequest.unitId,
        approvedById: user.id,
        societyId: user.societyId,
      },
    });
  }

  return successResponse(updated);
}
