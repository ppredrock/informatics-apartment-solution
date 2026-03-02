"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

export default function MemberLedgerPage() {
  const params = useParams();
  const memberId = params.memberId as string;

  const { data: memberData } = useQuery({
    queryKey: ["members", memberId],
    queryFn: async () => {
      const res = await fetch(`/api/members/${memberId}`);
      const json = await res.json();
      return json.data;
    },
  });

  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ["members", memberId, "ledger"],
    queryFn: async () => {
      const res = await fetch(`/api/members/${memberId}/ledger`);
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const entries = ledgerData?.entries || [];
  const currentBalance = ledgerData?.currentBalance || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Member Ledger"
        description={memberData?.user?.name || "Financial ledger"}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(entries.filter((e: any) => e.type === "DEBIT").reduce((s: number, e: any) => s + Number(e.amount), 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(entries.filter((e: any) => e.type === "CREDIT").reduce((s: number, e: any) => s + Number(e.amount), 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${currentBalance > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(Math.abs(currentBalance))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <Badge variant={entry.type === "DEBIT" ? "destructive" : "default"}>
                        {entry.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${entry.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                      {entry.type === "DEBIT" ? "+" : "-"}{formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(entry.balance)}
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
