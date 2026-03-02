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

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "blocks" or "units" or null (all units)

  if (type === "blocks") {
    const blocks = await prisma.block.findMany({
      where: { societyId: user.societyId },
      include: { _count: { select: { units: true } } },
      orderBy: { name: "asc" },
    });
    return successResponse(blocks);
  }

  const units = await prisma.unit.findMany({
    where: { societyId: user.societyId },
    include: { block: true },
    orderBy: [{ block: { name: "asc" } }, { floor: "asc" }, { unitNumber: "asc" }],
  });

  return successResponse(units);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();

  // Create block
  if (body.type === "block") {
    const block = await prisma.block.create({
      data: {
        name: body.name,
        societyId: user.societyId,
      },
    });
    return successResponse(block, 201);
  }

  // Create unit
  const { unitNumber, floor, unitType, area, blockId } = body;
  const unit = await prisma.unit.create({
    data: {
      unitNumber,
      floor,
      type: unitType,
      area: area || null,
      blockId,
      societyId: user.societyId,
    },
    include: { block: true },
  });

  return successResponse(unit, 201);
}
