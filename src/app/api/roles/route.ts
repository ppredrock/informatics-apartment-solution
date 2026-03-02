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

export async function GET() {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const roles = await prisma.role.findMany({
    where: { societyId: user.societyId },
    include: {
      _count: { select: { userRoles: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return successResponse(roles);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const { name, description, permissions } = body;

  const existing = await prisma.role.findFirst({
    where: { name, societyId: user.societyId },
  });
  if (existing) return errorResponse("Role name already exists", 400);

  const role = await prisma.role.create({
    data: {
      name,
      description,
      permissions,
      isSystem: false,
      societyId: user.societyId,
    },
  });

  return successResponse(role, 201);
}
