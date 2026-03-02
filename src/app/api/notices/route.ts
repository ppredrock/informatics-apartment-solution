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

  const notices = await prisma.notice.findMany({
    where: { societyId: user.societyId },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return successResponse(notices);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const notice = await prisma.notice.create({
    data: {
      title: body.title,
      content: body.content,
      category: body.category,
      priority: body.priority,
      isPublished: body.isPublished || false,
      publishedAt: body.isPublished ? new Date() : null,
      authorId: user.id,
      societyId: user.societyId,
    },
  });

  return successResponse(notice, 201);
}
