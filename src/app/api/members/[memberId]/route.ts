import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

async function getUser() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;
  return prisma.user.findUnique({
    where: { firebaseUid: tokens.decodedToken.uid },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { memberId } = await params;
  const member = await prisma.member.findFirst({
    where: { id: memberId, societyId: user.societyId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
      unit: { include: { block: true } },
    },
  });

  if (!member) return errorResponse("Member not found", 404);
  return successResponse(member);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { memberId } = await params;
  const body = await request.json();
  const { name, email, phone, unitId, ownershipType, moveInDate, isActive } = body;

  const member = await prisma.member.findFirst({
    where: { id: memberId, societyId: user.societyId },
  });
  if (!member) return errorResponse("Member not found", 404);

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Update user details
    await tx.user.update({
      where: { id: member.userId },
      data: { name, email, phone: phone || null },
    });

    // Update member details
    return tx.member.update({
      where: { id: memberId },
      data: {
        unitId,
        ownershipType,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        unit: { include: { block: true } },
      },
    });
  });

  return successResponse(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { memberId } = await params;
  const member = await prisma.member.findFirst({
    where: { id: memberId, societyId: user.societyId },
  });
  if (!member) return errorResponse("Member not found", 404);

  await prisma.member.update({
    where: { id: memberId },
    data: { isActive: false, moveOutDate: new Date() },
  });

  return successResponse({ deactivated: true });
}
