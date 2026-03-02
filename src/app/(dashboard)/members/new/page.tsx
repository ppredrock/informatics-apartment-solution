import { PageHeader } from "@/components/layout/page-header";
import { MemberForm } from "../_components/member-form";

export default function NewMemberPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Member" description="Register a new society member" />
      <MemberForm />
    </div>
  );
}
