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

  const [incomeTransactions, expenseTransactions, pendingBills] = await Promise.all([
    prisma.transaction.findMany({
      where: { societyId: user.societyId, type: "INCOME" },
      select: { category: true, amount: true },
    }),
    prisma.transaction.findMany({
      where: { societyId: user.societyId, type: "EXPENSE" },
      select: { category: true, amount: true },
    }),
    prisma.maintenanceBill.findMany({
      where: {
        societyId: user.societyId,
        status: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] },
      },
      select: { totalAmount: true, paidAmount: true },
    }),
  ]);

  // Group income by category
  const incomeByCategory: Record<string, number> = {};
  incomeTransactions.forEach((t) => {
    incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + Number(t.amount);
  });

  // Group expenses by category
  const expenseByCategory: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + Number(t.amount);
  });

  const totalIncome = incomeTransactions.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = expenseTransactions.reduce((s, t) => s + Number(t.amount), 0);
  const totalReceivables = pendingBills.reduce(
    (s, b) => s + (Number(b.totalAmount) - Number(b.paidAmount)),
    0
  );

  return successResponse({
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    totalReceivables,
    incomeByCategory,
    expenseByCategory,
  });
}
