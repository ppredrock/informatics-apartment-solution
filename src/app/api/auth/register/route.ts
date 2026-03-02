import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_ROLES } from "@/lib/constants/roles";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUid, email, name, societyName, societyAddress, city, state, pincode } = body;

    // Create society and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create society
      const society = await tx.society.create({
        data: {
          name: societyName,
          address: societyAddress,
          city,
          state,
          pincode,
          email,
          phone: "",
        },
      });

      // Create default roles
      const roles = await Promise.all(
        DEFAULT_ROLES.map((role) =>
          tx.role.create({
            data: {
              name: role.name,
              description: role.description,
              permissions: role.permissions,
              isSystem: role.isSystem,
              societyId: society.id,
            },
          })
        )
      );

      // Create user
      const user = await tx.user.create({
        data: {
          firebaseUid,
          email,
          name,
          societyId: society.id,
          isActive: true,
        },
      });

      // Assign Super Admin role
      const superAdminRole = roles.find((r) => r.name === "Super Admin")!;
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: superAdminRole.id,
        },
      });

      return { user, society };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Registration failed" } },
      { status: 500 }
    );
  }
}
