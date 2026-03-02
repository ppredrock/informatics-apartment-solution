import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "../../_components/transaction-form";

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Record Expense" description="Add a new expense entry" />
      <TransactionForm type="EXPENSE" />
    </div>
  );
}
