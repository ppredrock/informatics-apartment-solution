"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/format";
import { Pencil } from "lucide-react";

export default function NoticeDetailPage() {
  const params = useParams();
  const noticeId = params.noticeId as string;

  const { data, isLoading } = useQuery({
    queryKey: ["notices", noticeId],
    queryFn: async () => {
      const res = await fetch(`/api/notices/${noticeId}`);
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!data) return <p>Notice not found</p>;

  return (
    <div className="space-y-6">
      <PageHeader title={data.title}>
        <Link href={`/notices/${noticeId}/edit`}>
          <Button><Pencil className="mr-2 h-4 w-4" />Edit</Button>
        </Link>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{data.category}</Badge>
            <StatusBadge status={data.priority} />
            {data.isPublished ? (
              <Badge className="bg-green-100 text-green-800">Published</Badge>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            By {data.author?.name} | {formatDateTime(data.createdAt)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">{data.content}</div>
        </CardContent>
      </Card>
    </div>
  );
}
