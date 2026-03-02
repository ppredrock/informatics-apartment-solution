import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";

async function getUser() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;
  return prisma.user.findUnique({
    where: { firebaseUid: tokens.decodedToken.uid },
  });
}

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const where: any = { societyId: user.societyId };
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;
  if (search) {
    where.user = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        unit: { include: { block: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.member.count({ where }),
  ]);

  return paginatedResponse(members, total, page, pageSize);
}

export async function POST(request: NextRequest) {
  const currentUser = await getUser();
  if (!currentUser) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const { name, email, phone, unitId, ownershipType, moveInDate } = body;

  // Check if user already exists by email
  let user = await prisma.user.findUnique({ where: { email } });

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (!user) {
      user = await tx.user.create({
        data: {
          firebaseUid: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          email,
          name,
          phone: phone || null,
          societyId: currentUser.societyId,
          isActive: true,
        },
      });

      // Assign Resident role
      const residentRole = await tx.role.findFirst({
        where: { name: "Resident", societyId: currentUser.societyId },
      });
      if (residentRole) {
        await tx.userRole.create({
          data: { userId: user.id, roleId: residentRole.id },
        });
      }
    }

    const member = await tx.member.create({
      data: {
        userId: user!.id,
        unitId,
        ownershipType,
        moveInDate: moveInDate ? new Date(moveInDate) : null,
        isActive: true,
        societyId: currentUser.societyId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        unit: { include: { block: true } },
      },
    });

    return member;
  });

  return successResponse(result, 201);
}
