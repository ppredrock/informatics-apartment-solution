"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/format";
import { MessageSquareWarning, Plus, Eye, MessageCircle } from "lucide-react";

export default function ComplaintsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const res = await fetch("/api/complaints");
      const json = await res.json();
      return json.data || [];
    },
  });

  const complaints = data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Complaints" description="Track and manage society complaints">
        <Link href="/complaints/new">
          <Button><Plus className="mr-2 h-4 w-4" />File Complaint</Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : complaints.length === 0 ? (
            <EmptyState icon={MessageSquareWarning} title="No complaints" description="File a complaint to report an issue.">
              <Link href="/complaints/new"><Button><Plus className="mr-2 h-4 w-4" />File Complaint</Button></Link>
            </EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Filed By</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell><StatusBadge status={c.category} /></TableCell>
                    <TableCell><StatusBadge status={c.priority} /></TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                    <TableCell>{c.filedBy?.name || "-"}</TableCell>
                    <TableCell>{c.assignedTo?.name || "Unassigned"}</TableCell>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {c._count?.comments || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/complaints/${c.id}`}>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
