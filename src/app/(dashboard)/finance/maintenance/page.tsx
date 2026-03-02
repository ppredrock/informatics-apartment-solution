"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { Calendar, Plus, Loader2, FileText } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), dueDate: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["billing-cycles"],
    queryFn: async () => {
      const res = await fetch("/api/finance/maintenance");
      const json = await res.json();
      return json.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/finance/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || `${MONTHS[parseInt(form.month) - 1]} ${form.year}`,
          month: parseInt(form.month),
          year: parseInt(form.year),
          dueDate: form.dueDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing-cycles"] });
      setDialogOpen(false);
      setForm({ name: "", month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), dueDate: "" });
      toast.success("Billing cycle created");
    },
    onError: () => toast.error("Failed to create billing cycle"),
  });

  const cycles = data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance Billing" description="Manage billing cycles and generate bills">
        <Link href="/finance/maintenance/generate">
          <Button variant="outline"><FileText className="mr-2 h-4 w-4" />Generate Bills</Button>
        </Link>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Cycle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Billing Cycle</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name (optional)</Label>
                <Input placeholder="e.g. March 2026" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Input type="number" min="1" max="12" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" min="2020" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <Button onClick={() => createMutation.mutate()} disabled={!form.dueDate || createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : cycles.length === 0 ? (
            <EmptyState icon={Calendar} title="No billing cycles" description="Create a billing cycle to start generating maintenance bills." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bills</TableHead>
                  <TableHead className="text-right">Total Billed</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead>Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle: any) => (
                  <TableRow key={cycle.id}>
                    <TableCell className="font-medium">{cycle.name}</TableCell>
                    <TableCell><StatusBadge status={cycle.status} /></TableCell>
                    <TableCell>{cycle._count?.bills || 0}</TableCell>
                    <TableCell className="text-right">{formatCurrency(cycle.totalBilled)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(cycle.totalCollected)}</TableCell>
                    <TableCell>{cycle.pendingCount} pending</TableCell>
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
