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
  { params }: { params: Promise<{ complaintId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { complaintId } = await params;
  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, societyId: user.societyId },
    include: {
      filedBy: { select: { name: true, email: true } },
      assignedTo: { select: { name: true, email: true } },
      comments: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!complaint) return errorResponse("Complaint not found", 404);
  return successResponse(complaint);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ complaintId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { complaintId } = await params;
  const body = await request.json();

  const data: any = {};
  if (body.status) data.status = body.status;
  if (body.assignedToId) data.assignedToId = body.assignedToId;
  if (body.status === "RESOLVED") data.resolvedAt = new Date();

  const complaint = await prisma.complaint.update({
    where: { id: complaintId },
    data,
  });

  return successResponse(complaint);
}
