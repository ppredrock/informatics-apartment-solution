"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { DoorOpen, UserCheck, Clock, ShieldCheck } from "lucide-react";

export default function GatePage() {
  const { data: visitors, isLoading: visitorsLoading } = useQuery({
    queryKey: ["visitors-today"],
    queryFn: async () => {
      const res = await fetch("/api/gate/visitors?today=true&pageSize=5");
      return res.json();
    },
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["entry-requests"],
    queryFn: async () => {
      const res = await fetch("/api/gate/entry-requests");
      const json = await res.json();
      return json.data || [];
    },
  });

  const pendingRequests = (requests || []).filter((r: any) => r.status === "PENDING");
  const isLoading = visitorsLoading || requestsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Gate Management" description="Manage visitor access to your society" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visitors Today</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitors?.pagination?.total || 0}</div>
            <Link href="/gate/visitors" className="text-xs text-primary hover:underline">View all</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
            <Link href="/gate/entry-requests" className="text-xs text-primary hover:underline">View requests</Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pre-Approvals</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <Link href="/gate/pre-approvals">
              <Button variant="outline" size="sm">Manage Pre-Approvals</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent visitors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Visitors</CardTitle>
          <Link href="/gate/visitors">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {(visitors?.data || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No visitors today</p>
          ) : (
            <div className="space-y-3">
              {(visitors?.data || []).slice(0, 5).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.purpose} - {v.unit?.block?.name}-{v.unit?.unitNumber}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(v.entryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    {v.exitTime && <span className="ml-2 text-green-600">Exited</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
