"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Receipt } from "lucide-react";

export default function ReceiptsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["receipts"],
    queryFn: async () => {
      const res = await fetch("/api/finance/receipts");
      const json = await res.json();
      return json.data || [];
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Receipts" description="View all maintenance payments" />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (data || []).length === 0 ? (
            <EmptyState icon={Receipt} title="No payments yet" description="Payments will appear here once members pay their maintenance bills." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data || []).map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">{payment.receiptNo}</TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{payment.bill?.member?.user?.name || "-"}</TableCell>
                    <TableCell>
                      {payment.bill?.unit?.block?.name}-{payment.bill?.unit?.unitNumber}
                    </TableCell>
                    <TableCell>{payment.bill?.billingCycle?.name || "-"}</TableCell>
                    <TableCell><StatusBadge status={payment.method} /></TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(payment.amount)}
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
