"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { MemberForm } from "../../_components/member-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditMemberPage() {
  const params = useParams();
  const memberId = params.memberId as string;

  const { data, isLoading } = useQuery({
    queryKey: ["members", memberId],
    queryFn: async () => {
      const res = await fetch(`/api/members/${memberId}`);
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
      <PageHeader title="Edit Member" description={data?.user?.name || "Edit member details"} />
      <MemberForm member={data} />
    </div>
  );
}
