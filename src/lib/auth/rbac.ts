import { prisma } from "@/lib/db/prisma";

export type Permission =
  | "MEMBER_READ" | "MEMBER_WRITE" | "MEMBER_DELETE"
  | "FINANCE_READ" | "FINANCE_WRITE"
  | "MAINTENANCE_READ" | "MAINTENANCE_WRITE" | "MAINTENANCE_GENERATE"
  | "GATE_READ" | "GATE_WRITE" | "GATE_APPROVE"
  | "NOTICE_READ" | "NOTICE_WRITE"
  | "COMPLAINT_READ" | "COMPLAINT_WRITE" | "COMPLAINT_ASSIGN"
  | "ROLE_MANAGE" | "SETTINGS_MANAGE" | "GATEKEEPER"
  | "DASHBOARD_VIEW";

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  const permissions = new Set<Permission>();
  for (const ur of userRoles) {
    const rolePerms = ur.role.permissions as Permission[];
    rolePerms.forEach((p) => permissions.add(p));
  }
  return Array.from(permissions);
}

export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
}

export async function hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
  const userPerms = await getUserPermissions(userId);
  return permissions.some((p) => userPerms.includes(p));
}
