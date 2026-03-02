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

  const cycles = await prisma.billingCycle.findMany({
    where: { societyId: user.societyId },
    include: {
      _count: { select: { maintenanceBills: true } },
      maintenanceBills: {
        select: {
          totalAmount: true,
          paidAmount: true,
          status: true,
        },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Calculate summary for each cycle
  const cyclesWithSummary = cycles.map((cycle) => {
    const totalBilled = cycle.maintenanceBills.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalCollected = cycle.maintenanceBills.reduce((sum, b) => sum + Number(b.paidAmount), 0);
    const pendingCount = cycle.maintenanceBills.filter((b) => b.status === "PENDING" || b.status === "PARTIALLY_PAID").length;
    const { maintenanceBills, ...rest } = cycle;
    return { ...rest, totalBilled, totalCollected, pendingCount };
  });

  return successResponse(cyclesWithSummary);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const body = await request.json();

  // If generating bills
  if (body.action === "generate") {
    const { billingCycleId, lineItems } = body;

    const cycle = await prisma.billingCycle.findFirst({
      where: { id: billingCycleId, societyId: user.societyId },
    });
    if (!cycle) return errorResponse("Billing cycle not found", 404);

    // Get all active members
    const members = await prisma.member.findMany({
      where: { societyId: user.societyId, isActive: true },
      include: { unit: true },
    });

    const totalPerBill = lineItems.reduce((s: number, item: any) => s + Number(item.amount), 0);

    // Create bills for each member
    const bills = await prisma.$transaction(
      members.map((member) =>
        prisma.maintenanceBill.create({
          data: {
            billingCycleId,
            memberId: member.id,
            unitId: member.unitId,
            totalAmount: totalPerBill,
            paidAmount: 0,
            dueDate: cycle.dueDate,
            status: "PENDING",
            societyId: user.societyId,
            lineItems: {
              create: lineItems.map((item: any) => ({
                head: item.head,
                amount: item.amount,
                description: item.description || null,
              })),
            },
          },
        })
      )
    );

    // Activate the cycle
    await prisma.billingCycle.update({
      where: { id: billingCycleId },
      data: { status: "ACTIVE" },
    });

    return successResponse({ generated: bills.length });
  }

  // Create a new billing cycle
  const { name, month, year, dueDate } = body;
  const cycle = await prisma.billingCycle.create({
    data: {
      name,
      month,
      year,
      dueDate: new Date(dueDate),
      status: "DRAFT",
      societyId: user.societyId,
    },
  });

  return successResponse(cycle, 201);
}
