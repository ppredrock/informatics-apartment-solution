import { PageHeader } from "@/components/layout/page-header";
import { TransactionForm } from "../../_components/transaction-form";

export default function NewIncomePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Record Income" description="Add a new income entry" />
      <TransactionForm type="INCOME" />
    </div>
  );
}
