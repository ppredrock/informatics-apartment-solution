"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./use-auth";

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermissions() {
      if (!user) {
        setPermissions([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setPermissions(data.data?.permissions || []);
        }
      } catch {
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPermissions();
  }, [user]);

  const hasPermission = (permission: string) => permissions.includes(permission);
  const hasAnyPermission = (perms: string[]) => perms.some((p) => permissions.includes(p));

  return { permissions, loading, hasPermission, hasAnyPermission };
}
