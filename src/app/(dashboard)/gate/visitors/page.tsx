"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/format";
import { DoorOpen } from "lucide-react";

export default function VisitorsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["visitors", page],
    queryFn: async () => {
      const res = await fetch(`/api/gate/visitors?page=${page}`);
      return res.json();
    },
  });

  const visitors = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader title="Visitor Log" description="Complete history of visitor entries" />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : visitors.length === 0 ? (
            <EmptyState icon={DoorOpen} title="No visitors logged" description="Visitor entries will appear here once logged." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Exit Time</TableHead>
                    <TableHead>Vehicle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((v: any) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{v.name}</p>
                          {v.phone && <p className="text-sm text-muted-foreground">{v.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={v.purpose} /></TableCell>
                      <TableCell>{v.unit?.block?.name}-{v.unit?.unitNumber}</TableCell>
                      <TableCell>{formatDateTime(v.entryTime)}</TableCell>
                      <TableCell>{v.exitTime ? formatDateTime(v.exitTime) : <span className="text-yellow-600">Still inside</span>}</TableCell>
                      <TableCell>{v.vehicleNo || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
