"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Plus } from "lucide-react";

export default function FinancePage() {
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
        <Skeleton className="h-8 w-32" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { title: "Total Income", value: formatCurrency(data?.totalIncome || 0), icon: TrendingUp, color: "text-green-600" },
    { title: "Total Expenses", value: formatCurrency(data?.totalExpenses || 0), icon: TrendingDown, color: "text-red-600" },
    { title: "Net Balance", value: formatCurrency(data?.netBalance || 0), icon: Wallet, color: (data?.netBalance || 0) >= 0 ? "text-green-600" : "text-red-600" },
    { title: "Receivables", value: formatCurrency(data?.totalReceivables || 0), icon: AlertCircle, color: "text-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Finance" description="Track society income and expenses">
        <Link href="/finance/income/new">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </Link>
        <Link href="/finance/expenses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Income by category */}
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.incomeByCategory && Object.keys(data.incomeByCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.incomeByCategory).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm">{cat}</span>
                    <span className="font-medium text-green-600">{formatCurrency(amt as number)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No income recorded yet</p>
            )}
          </CardContent>
        </Card>

        {/* Expenses by category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.expenseByCategory && Object.keys(data.expenseByCategory).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.expenseByCategory).map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm">{cat}</span>
                    <span className="font-medium text-red-600">{formatCurrency(amt as number)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No expenses recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
