"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export default function RolesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await fetch("/api/roles");
      const json = await res.json();
      return json.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const res = await fetch(`/api/roles/${roleId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Delete failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  const roles = data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Roles & Permissions" description="Manage access roles for your society">
        <Link href="/roles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </Link>
      </PageHeader>

      {roles.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No roles found"
          description="Create custom roles to manage access permissions for your society members."
        >
          <Link href="/roles/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role: any) => (
            <Card key={role.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{role.name}</CardTitle>
                  {role.description && (
                    <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                  )}
                </div>
                {role.isSystem && <Badge variant="secondary">System</Badge>}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Users className="h-4 w-4" />
                  <span>{role._count?.userRoles || 0} members</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {((role.permissions as string[]) || []).slice(0, 5).map((perm: string) => (
                    <Badge key={perm} variant="outline" className="text-xs">
                      {perm.replace(/_/g, " ")}
                    </Badge>
                  ))}
                  {((role.permissions as string[]) || []).length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{(role.permissions as string[]).length - 5} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/roles/${role.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                  {!role.isSystem && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this role?")) {
                          deleteMutation.mutate(role.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
