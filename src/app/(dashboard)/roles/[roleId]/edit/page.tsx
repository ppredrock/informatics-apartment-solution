"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { RoleForm } from "../../_components/role-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditRolePage() {
  const params = useParams();
  const roleId = params.roleId as string;

  const { data, isLoading } = useQuery({
    queryKey: ["roles", roleId],
    queryFn: async () => {
      const res = await fetch(`/api/roles/${roleId}`);
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Role" description={`Modify permissions for ${data?.name || "role"}`} />
      <RoleForm role={data} />
    </div>
  );
}
