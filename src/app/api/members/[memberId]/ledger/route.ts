import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

async function getUser() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;
  return prisma.user.findUnique({
    where: { firebaseUid: tokens.decodedToken.uid },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { memberId } = await params;
  const member = await prisma.member.findFirst({
    where: { id: memberId, societyId: user.societyId },
  });
  if (!member) return errorResponse("Member not found", 404);

  // Get all bills and payments for this member
  const bills = await prisma.maintenanceBill.findMany({
    where: { memberId, societyId: user.societyId },
    include: {
      lineItems: true,
      payments: true,
      billingCycle: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Build ledger entries
  const ledgerEntries = bills.flatMap((bill) => {
    const entries: any[] = [];

    // Debit entry for the bill
    entries.push({
      id: `bill-${bill.id}`,
      date: bill.createdAt,
      description: `Maintenance - ${bill.billingCycle.name}`,
      type: "DEBIT",
      amount: bill.totalAmount,
      balance: 0, // Will be calculated
    });

    // Credit entries for payments
    bill.payments.forEach((payment) => {
      entries.push({
        id: `payment-${payment.id}`,
        date: payment.paymentDate,
        description: `Payment via ${payment.method}${payment.transactionRef ? ` (${payment.transactionRef})` : ""}`,
        type: "CREDIT",
        amount: payment.amount,
        balance: 0,
      });
    });

    return entries;
  });

  // Sort by date and calculate running balance
  ledgerEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let balance = 0;
  for (const entry of ledgerEntries) {
    if (entry.type === "DEBIT") {
      balance += Number(entry.amount);
    } else {
      balance -= Number(entry.amount);
    }
    entry.balance = balance;
  }

  return successResponse({ entries: ledgerEntries, currentBalance: balance });
}
