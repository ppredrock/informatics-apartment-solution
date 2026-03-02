import { PageHeader } from "@/components/layout/page-header";
import { RoleForm } from "../_components/role-form";

export default function NewRolePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Create Role" description="Define a new role with custom permissions" />
      <RoleForm />
    </div>
  );
}
