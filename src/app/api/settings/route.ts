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

  const society = await prisma.society.findUnique({
    where: { id: user.societyId },
  });

  return successResponse(society);
}

export async function PUT(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const { name, address, city, state, pincode, phone, email, registrationNo } = body;

  const society = await prisma.society.update({
    where: { id: user.societyId },
    data: { name, address, city, state, pincode, phone, email, registrationNo },
  });

  return successResponse(society);
}
