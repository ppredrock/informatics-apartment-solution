import {
  LayoutDashboard,
  Users,
  IndianRupee,
  DoorOpen,
  Megaphone,
  MessageSquareWarning,
  Shield,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/auth/rbac";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  children?: { title: string; href: string; permission?: Permission }[];
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "DASHBOARD_VIEW",
  },
  {
    title: "Members",
    href: "/members",
    icon: Users,
    permission: "MEMBER_READ",
    children: [
      { title: "All Members", href: "/members" },
      { title: "Add Member", href: "/members/new", permission: "MEMBER_WRITE" },
      { title: "Upload Excel", href: "/members/upload", permission: "MEMBER_WRITE" },
    ],
  },
  {
    title: "Finance",
    href: "/finance",
    icon: IndianRupee,
    permission: "FINANCE_READ",
    children: [
      { title: "Overview", href: "/finance" },
      { title: "Income", href: "/finance/income" },
      { title: "Expenses", href: "/finance/expenses" },
      { title: "Maintenance", href: "/finance/maintenance", permission: "MAINTENANCE_READ" },
      { title: "Balance Sheet", href: "/finance/balance-sheet" },
      { title: "Receipts", href: "/finance/receipts" },
    ],
  },
  {
    title: "Gate",
    href: "/gate",
    icon: DoorOpen,
    permission: "GATE_READ",
    children: [
      { title: "Overview", href: "/gate" },
      { title: "Visitors", href: "/gate/visitors" },
      { title: "Entry Requests", href: "/gate/entry-requests" },
      { title: "Pre-Approvals", href: "/gate/pre-approvals" },
    ],
  },
  {
    title: "Notices",
    href: "/notices",
    icon: Megaphone,
    permission: "NOTICE_READ",
  },
  {
    title: "Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    permission: "COMPLAINT_READ",
  },
  {
    title: "Roles",
    href: "/roles",
    icon: Shield,
    permission: "ROLE_MANAGE",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    permission: "SETTINGS_MANAGE",
  },
];
