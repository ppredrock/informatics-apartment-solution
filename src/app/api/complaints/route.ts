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

  const complaints = await prisma.complaint.findMany({
    where: { societyId: user.societyId },
    include: {
      filedBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(complaints);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const complaint = await prisma.complaint.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority,
      status: "OPEN",
      filedById: user.id,
      societyId: user.societyId,
    },
  });

  return successResponse(complaint, 201);
}
