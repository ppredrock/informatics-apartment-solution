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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ noticeId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { noticeId } = await params;
  const notice = await prisma.notice.findFirst({
    where: { id: noticeId, societyId: user.societyId },
    include: { author: { select: { name: true, email: true } } },
  });

  if (!notice) return errorResponse("Notice not found", 404);
  return successResponse(notice);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noticeId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { noticeId } = await params;
  const body = await request.json();

  const notice = await prisma.notice.update({
    where: { id: noticeId },
    data: {
      title: body.title,
      content: body.content,
      category: body.category,
      priority: body.priority,
      isPublished: body.isPublished,
      publishedAt: body.isPublished ? new Date() : null,
    },
  });

  return successResponse(notice);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ noticeId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { noticeId } = await params;
  await prisma.notice.delete({ where: { id: noticeId } });
  return successResponse({ deleted: true });
}
