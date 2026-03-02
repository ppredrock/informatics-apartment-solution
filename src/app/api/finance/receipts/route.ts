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

  const payments = await prisma.payment.findMany({
    where: { societyId: user.societyId },
    include: {
      bill: {
        include: {
          member: { include: { user: { select: { name: true } } } },
          unit: { include: { block: true } },
          billingCycle: true,
        },
      },
    },
    orderBy: { paymentDate: "desc" },
    take: 100,
  });

  return successResponse(payments);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();
  const { billId, amount, paymentDate, method, transactionRef } = body;

  const bill = await prisma.maintenanceBill.findFirst({
    where: { id: billId, societyId: user.societyId },
  });
  if (!bill) return errorResponse("Bill not found", 404);

  const newPaidAmount = Number(bill.paidAmount) + Number(amount);
  const newStatus = newPaidAmount >= Number(bill.totalAmount) ? "PAID" : "PARTIALLY_PAID";

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        billId,
        amount,
        paymentDate: new Date(paymentDate),
        method,
        transactionRef: transactionRef || null,
        receiptNo: `RCP-${Date.now()}`,
        collectedById: user.id,
        societyId: user.societyId,
      },
    });

    await tx.maintenanceBill.update({
      where: { id: billId },
      data: { paidAmount: newPaidAmount, status: newStatus },
    });

    // Also record as income transaction
    await tx.transaction.create({
      data: {
        type: "INCOME",
        category: "Maintenance Collection",
        amount,
        date: new Date(paymentDate),
        description: `Payment for bill ${billId} via ${method}`,
        createdById: user.id,
        societyId: user.societyId,
      },
    });

    return payment;
  });

  return successResponse(result, 201);
}
