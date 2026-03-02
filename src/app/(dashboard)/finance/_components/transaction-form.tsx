"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { transactionSchema, type TransactionFormValues } from "@/lib/validations/finance.schema";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const INCOME_CATEGORIES = [
  "Maintenance Collection",
  "Penalty/Interest",
  "Rental Income",
  "Event Income",
  "Parking Fees",
  "Transfer Fees",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Electricity",
  "Water",
  "Security",
  "Housekeeping",
  "Repairs & Maintenance",
  "Lift Maintenance",
  "Garden Maintenance",
  "Insurance",
  "Legal & Professional",
  "Office & Admin",
  "Sinking Fund",
  "Other Expense",
];

interface TransactionFormProps {
  type: "INCOME" | "EXPENSE";
}

export function TransactionForm({ type }: TransactionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const categories = type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type,
      category: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  async function onSubmit(values: TransactionFormValues) {
    setLoading(true);
    try {
      const endpoint = type === "INCOME" ? "/api/finance/income" : "/api/finance/expenses";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(`${type === "INCOME" ? "Income" : "Expense"} recorded`);
      router.push(type === "INCOME" ? "/finance/income" : "/finance/expenses");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{type === "INCOME" ? "Income" : "Expense"} Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (INR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record {type === "INCOME" ? "Income" : "Expense"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
