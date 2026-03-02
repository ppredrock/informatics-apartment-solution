import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusVariants: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 border-green-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  APPROVED: "bg-green-100 text-green-800 border-green-200",
  RESOLVED: "bg-green-100 text-green-800 border-green-200",
  CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  DRAFT: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  PARTIALLY_PAID: "bg-orange-100 text-orange-800 border-orange-200",
  OVERDUE: "bg-red-100 text-red-800 border-red-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  EXPIRED: "bg-gray-100 text-gray-600 border-gray-200",
  OPEN: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariants[status] || "bg-gray-100 text-gray-800 border-gray-200";
  return (
    <Badge variant="outline" className={cn(variant, className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
