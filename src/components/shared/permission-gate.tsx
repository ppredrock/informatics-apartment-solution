"use client";

import { usePermissions } from "@/hooks/use-permission";
import { type ReactNode } from "react";

interface PermissionGateProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, loading } = usePermissions();

  if (loading) return null;

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (permissions) {
    if (requireAll) {
      if (!permissions.every((p) => hasPermission(p))) return <>{fallback}</>;
    } else {
      if (!hasAnyPermission(permissions)) return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
