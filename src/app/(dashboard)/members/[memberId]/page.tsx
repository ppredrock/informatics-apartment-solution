"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, BookOpen } from "lucide-react";

export default function MemberDetailPage() {
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

  const member = data;
  if (!member) return <p>Member not found</p>;

  const initials = member.user.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Member Details" description={member.user.name}>
        <Link href={`/members/${memberId}/ledger`}>
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            View Ledger
          </Button>
        </Link>
        <Link href={`/members/${memberId}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{member.user.name}</h3>
                <p className="text-sm text-muted-foreground">{member.user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{member.user.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={member.isActive ? "ACTIVE" : "CLOSED"} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Block / Wing</p>
                <p className="font-medium">{member.unit?.block?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit Number</p>
                <p className="font-medium">{member.unit?.unitNumber || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit Type</p>
                <p className="font-medium">{member.unit?.type?.replace(/_/g, " ") || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ownership</p>
                <StatusBadge status={member.ownershipType} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Move-in Date</p>
                <p className="font-medium">
                  {member.moveInDate ? new Date(member.moveInDate).toLocaleDateString("en-IN") : "Not set"}
                </p>
              </div>
              {member.unit?.area && (
                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="font-medium">{member.unit.area} sq.ft.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
