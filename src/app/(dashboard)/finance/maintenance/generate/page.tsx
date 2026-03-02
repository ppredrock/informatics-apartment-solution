"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface LineItem {
  head: string;
  amount: number;
  description: string;
}

const DEFAULT_HEADS = [
  "Maintenance",
  "Water Charges",
  "Parking Charges",
  "Sinking Fund",
  "Lift Maintenance",
  "Garden/Common Area",
  "Security Charges",
  "Insurance",
];

export default function GenerateBillsPage() {
  const router = useRouter();
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { head: "Maintenance", amount: 0, description: "" },
  ]);
  const [generating, setGenerating] = useState(false);

  const { data: cycles } = useQuery({
    queryKey: ["billing-cycles"],
    queryFn: async () => {
      const res = await fetch("/api/finance/maintenance");
      const json = await res.json();
      return (json.data || []).filter((c: any) => c.status === "DRAFT");
    },
  });

  function addLineItem() {
    setLineItems([...lineItems, { head: "", amount: 0, description: "" }]);
  }

  function removeLineItem(index: number) {
    setLineItems(lineItems.filter((_, i) => i !== index));
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  }

  const total = lineItems.reduce((s, item) => s + Number(item.amount), 0);

  async function handleGenerate() {
    if (!selectedCycleId) {
      toast.error("Select a billing cycle");
      return;
    }
    if (lineItems.length === 0 || total === 0) {
      toast.error("Add at least one billing head with an amount");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/finance/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          billingCycleId: selectedCycleId,
          lineItems,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate bills");
      const json = await res.json();
      toast.success(`${json.data.generated} bills generated successfully`);
      router.push("/finance/maintenance");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Generate Bills" description="Generate maintenance bills for all active members" />

      <Card>
        <CardHeader>
          <CardTitle>Select Billing Cycle</CardTitle>
          <CardDescription>Choose a draft billing cycle to generate bills for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select billing cycle" />
            </SelectTrigger>
            <SelectContent>
              {(cycles || []).map((cycle: any) => (
                <SelectItem key={cycle.id} value={cycle.id}>{cycle.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(cycles || []).length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">No draft billing cycles. Create one first.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Billing Heads</CardTitle>
            <CardDescription>Define the charges for this billing cycle</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="mr-1 h-4 w-4" />
            Add Head
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Head</TableHead>
                <TableHead>Amount (INR)</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={item.head}
                      onValueChange={(v) => updateLineItem(index, "head", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select head" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_HEADS.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => updateLineItem(index, "amount", parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Optional"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeLineItem(index)} disabled={lineItems.length <= 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-lg font-semibold">
              Total per member: <span className="text-primary">&#8377;{total.toLocaleString("en-IN")}</span>
            </p>
            <Button onClick={handleGenerate} disabled={generating || !selectedCycleId || total === 0}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Bills
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
