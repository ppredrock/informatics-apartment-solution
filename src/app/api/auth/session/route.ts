import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const tokens = await getTokens(await cookies(), authConfig);
    if (!tokens) {
      return NextResponse.json({ success: false, error: { message: "Not authenticated" } }, { status: 401 });
    }

    const { uid, email, name, picture } = tokens.decodedToken;

    // Find or handle user
    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
      include: {
        userRoles: {
          include: { role: true },
        },
        society: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          uid,
          email,
          name,
          picture,
          needsSetup: true,
        },
      });
    }

    // Collect permissions
    const permissions: string[] = [];
    for (const ur of user.userRoles) {
      const rolePerms = ur.role.permissions as string[];
      rolePerms.forEach((p) => {
        if (!permissions.includes(p)) permissions.push(p);
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        uid,
        email: user.email,
        name: user.name,
        picture,
        id: user.id,
        societyId: user.societyId,
        societyName: user.society.name,
        permissions,
        roles: user.userRoles.map((ur) => ur.role.name),
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ success: false, error: { message: "Session error" } }, { status: 500 });
  }
}
