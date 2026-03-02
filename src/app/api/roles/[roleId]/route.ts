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
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { roleId } = await params;
  const role = await prisma.role.findFirst({
    where: { id: roleId, societyId: user.societyId },
    include: {
      userRoles: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!role) return errorResponse("Role not found", 404);
  return successResponse(role);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { roleId } = await params;
  const body = await request.json();
  const { name, description, permissions } = body;

  const role = await prisma.role.findFirst({
    where: { id: roleId, societyId: user.societyId },
  });
  if (!role) return errorResponse("Role not found", 404);

  const updated = await prisma.role.update({
    where: { id: roleId },
    data: { name, description, permissions },
  });

  return successResponse(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { roleId } = await params;
  const role = await prisma.role.findFirst({
    where: { id: roleId, societyId: user.societyId },
  });

  if (!role) return errorResponse("Role not found", 404);
  if (role.isSystem) return errorResponse("Cannot delete system roles", 400);

  await prisma.role.delete({ where: { id: roleId } });
  return successResponse({ deleted: true });
}
