import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

export const billingCycleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  dueDate: z.string().min(1, "Due date is required"),
});

export const billLineItemSchema = z.object({
  head: z.string().min(1, "Head is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
  description: z.string().optional(),
});

export const generateBillsSchema = z.object({
  billingCycleId: z.string().min(1),
  lineItems: z.array(billLineItemSchema).min(1, "At least one billing head required"),
});

export const paymentSchema = z.object({
  billId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z.string().min(1, "Date is required"),
  method: z.enum(["CASH", "CHEQUE", "UPI", "BANK_TRANSFER", "ONLINE"]),
  transactionRef: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type BillingCycleFormValues = z.infer<typeof billingCycleSchema>;
export type GenerateBillsFormValues = z.infer<typeof generateBillsSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
