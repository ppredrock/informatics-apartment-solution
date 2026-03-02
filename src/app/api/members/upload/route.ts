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

export async function POST(request: NextRequest) {
  const currentUser = await getUser();
  if (!currentUser) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const { members } = body; // Array of { name, email, phone, unitId, ownershipType }

  if (!Array.isArray(members) || members.length === 0) {
    return errorResponse("No members data provided", 400);
  }

  const residentRole = await prisma.role.findFirst({
    where: { name: "Resident", societyId: currentUser.societyId },
  });

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const m of members) {
    try {
      const existing = await prisma.user.findUnique({ where: { email: m.email } });
      if (existing) {
        const existingMember = await prisma.member.findFirst({
          where: { userId: existing.id, unitId: m.unitId, societyId: currentUser.societyId },
        });
        if (existingMember) {
          skipped++;
          continue;
        }
      }

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        let user = existing;
        if (!user) {
          user = await tx.user.create({
            data: {
              firebaseUid: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              email: m.email,
              name: m.name,
              phone: m.phone || null,
              societyId: currentUser.societyId,
              isActive: true,
            },
          });
          if (residentRole) {
            await tx.userRole.create({
              data: { userId: user.id, roleId: residentRole.id },
            });
          }
        }

        await tx.member.create({
          data: {
            userId: user.id,
            unitId: m.unitId,
            ownershipType: m.ownershipType || "OWNER",
            isActive: true,
            societyId: currentUser.societyId,
          },
        });
      });

      created++;
    } catch (error: any) {
      errors.push(`Row ${m.name}: ${error.message}`);
    }
  }

  return successResponse({ created, skipped, errors });
}
