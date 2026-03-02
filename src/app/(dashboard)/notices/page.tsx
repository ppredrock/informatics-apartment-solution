"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { Megaphone, Plus, Eye, Trash2 } from "lucide-react";

export default function NoticesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const res = await fetch("/api/notices");
      const json = await res.json();
      return json.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success("Notice deleted");
    },
  });

  const notices = data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Notices" description="Society announcements and updates">
        <Link href="/notices/new">
          <Button><Plus className="mr-2 h-4 w-4" />Create Notice</Button>
        </Link>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : notices.length === 0 ? (
        <EmptyState icon={Megaphone} title="No notices yet" description="Create a notice to share with residents.">
          <Link href="/notices/new"><Button><Plus className="mr-2 h-4 w-4" />Create Notice</Button></Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {notices.map((notice: any) => (
            <Card key={notice.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <CardDescription>
                      By {notice.author?.name} on {formatDate(notice.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{notice.category}</Badge>
                    <StatusBadge status={notice.priority} />
                    {notice.isPublished ? (
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{notice.content}</p>
                <div className="flex gap-2">
                  <Link href={`/notices/${notice.id}`}>
                    <Button variant="outline" size="sm"><Eye className="mr-1 h-3 w-3" />View</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { if (confirm("Delete this notice?")) deleteMutation.mutate(notice.id); }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
