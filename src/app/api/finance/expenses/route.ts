import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/utils/api-response";

async function getUser() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;
  return prisma.user.findUnique({ where: { firebaseUid: tokens.decodedToken.uid } });
}

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { societyId: user.societyId, type: "EXPENSE" },
      include: { createdBy: { select: { name: true } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where: { societyId: user.societyId, type: "EXPENSE" } }),
  ]);

  return paginatedResponse(transactions, total, page, pageSize);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const transaction = await prisma.transaction.create({
    data: {
      type: "EXPENSE",
      category: body.category,
      amount: body.amount,
      date: new Date(body.date),
      description: body.description || null,
      createdById: user.id,
      societyId: user.societyId,
    },
  });

  return successResponse(transaction, 201);
}
