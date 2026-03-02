"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/format";
import { toast } from "sonner";
import { UserCheck, Check, X, Clock } from "lucide-react";

export default function EntryRequestsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["entry-requests"],
    queryFn: async () => {
      const res = await fetch("/api/gate/entry-requests");
      const json = await res.json();
      return json.data || [];
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const res = await fetch(`/api/gate/entry-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["entry-requests"] });
      queryClient.invalidateQueries({ queryKey: ["visitors-today"] });
      toast.success(status === "APPROVED" ? "Entry approved" : "Entry rejected");
    },
    onError: () => toast.error("Action failed"),
  });

  const requests = data || [];
  const pending = requests.filter((r: any) => r.status === "PENDING");
  const handled = requests.filter((r: any) => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      <PageHeader title="Entry Requests" description="Approve or reject visitor entry requests" />

      {/* Pending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Requests ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
          ) : pending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pending.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{req.visitorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {req.purpose}{req.purposeDetail ? ` - ${req.purposeDetail}` : ""} |
                      Unit: {req.unit?.block?.name}-{req.unit?.unitNumber}
                    </p>
                    {req.visitorPhone && <p className="text-sm text-muted-foreground">Phone: {req.visitorPhone}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(req.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => respondMutation.mutate({ requestId: req.id, status: "REJECTED" })}
                      disabled={respondMutation.isPending}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => respondMutation.mutate({ requestId: req.id, status: "APPROVED" })}
                      disabled={respondMutation.isPending}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {handled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {handled.slice(0, 20).map((req: any) => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border p-3 opacity-75">
                  <div>
                    <p className="font-medium">{req.visitorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {req.purpose} | {req.unit?.block?.name}-{req.unit?.unitNumber}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
