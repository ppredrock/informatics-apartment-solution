"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import { ShieldCheck, Plus } from "lucide-react";

export default function PreApprovalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["pre-approvals"],
    queryFn: async () => {
      const res = await fetch("/api/gate/pre-approvals");
      const json = await res.json();
      return json.data || [];
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Pre-Approvals" description="Pre-approve expected visitors for quick entry">
        <Link href="/gate/pre-approvals/new">
          <Button><Plus className="mr-2 h-4 w-4" />New Pre-Approval</Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (data || []).length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No pre-approvals" description="Pre-approve expected visitors so they can enter quickly.">
              <Link href="/gate/pre-approvals/new"><Button><Plus className="mr-2 h-4 w-4" />New Pre-Approval</Button></Link>
            </EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Valid From</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data || []).map((pa: any) => {
                  const isExpired = new Date(pa.validUntil) < new Date();
                  return (
                    <TableRow key={pa.id}>
                      <TableCell className="font-medium">{pa.visitorName}</TableCell>
                      <TableCell>{pa.visitorPhone || "-"}</TableCell>
                      <TableCell>{pa.purpose || "-"}</TableCell>
                      <TableCell>{pa.unit?.block?.name}-{pa.unit?.unitNumber}</TableCell>
                      <TableCell>{formatDate(pa.validFrom)}</TableCell>
                      <TableCell>{formatDate(pa.validUntil)}</TableCell>
                      <TableCell>
                        {pa.isUsed ? (
                          <Badge variant="secondary">Used</Badge>
                        ) : isExpired ? (
                          <Badge variant="outline" className="text-gray-500">Expired</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
