"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { TrendingUp, Plus } from "lucide-react";

export default function IncomePage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["income", page],
    queryFn: async () => {
      const res = await fetch(`/api/finance/income?page=${page}`);
      return res.json();
    },
  });

  const transactions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader title="Income" description="Track society income">
        <Link href="/finance/income/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Income
          </Button>
        </Link>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No income recorded" description="Start recording society income.">
              <Link href="/finance/income/new">
                <Button><Plus className="mr-2 h-4 w-4" />Record Income</Button>
              </Link>
            </EmptyState>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>{formatDate(t.date)}</TableCell>
                      <TableCell className="font-medium">{t.category}</TableCell>
                      <TableCell className="text-muted-foreground">{t.description || "-"}</TableCell>
                      <TableCell>{t.createdBy?.name || "-"}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(t.amount)}
                      </TableCell>
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
