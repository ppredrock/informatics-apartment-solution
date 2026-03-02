"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/format";

export default function BalanceSheetPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["balance-sheet"],
    queryFn: async () => {
      const res = await fetch("/api/finance/balance-sheet");
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

  return (
    <div className="space-y-6">
      <PageHeader title="Balance Sheet" description="Society financial summary" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Income */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.incomeByCategory && Object.entries(data.incomeByCategory).map(([cat, amt]) => (
                  <TableRow key={cat}>
                    <TableCell>{cat}</TableCell>
                    <TableCell className="text-right">{formatCurrency(amt as number)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total Income</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(data?.totalIncome || 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.expenseByCategory && Object.entries(data.expenseByCategory).map(([cat, amt]) => (
                  <TableRow key={cat}>
                    <TableCell>{cat}</TableCell>
                    <TableCell className="text-right">{formatCurrency(amt as number)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>Total Expenses</TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(data?.totalExpenses || 0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-lg">
            <span>Total Income</span>
            <span className="font-bold text-green-600">{formatCurrency(data?.totalIncome || 0)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Total Expenses</span>
            <span className="font-bold text-red-600">{formatCurrency(data?.totalExpenses || 0)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-xl font-bold">
            <span>Net Balance</span>
            <span className={(data?.netBalance || 0) >= 0 ? "text-green-600" : "text-red-600"}>
              {formatCurrency(data?.netBalance || 0)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg">
            <span>Pending Receivables</span>
            <span className="font-bold text-yellow-600">{formatCurrency(data?.totalReceivables || 0)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
