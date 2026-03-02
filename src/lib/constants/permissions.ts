export const PERMISSIONS = {
  MEMBER_READ: { key: "MEMBER_READ", label: "View Members", module: "Members" },
  MEMBER_WRITE: { key: "MEMBER_WRITE", label: "Add/Edit Members", module: "Members" },
  MEMBER_DELETE: { key: "MEMBER_DELETE", label: "Delete Members", module: "Members" },
  FINANCE_READ: { key: "FINANCE_READ", label: "View Finances", module: "Finance" },
  FINANCE_WRITE: { key: "FINANCE_WRITE", label: "Record Transactions", module: "Finance" },
  MAINTENANCE_READ: { key: "MAINTENANCE_READ", label: "View Maintenance Bills", module: "Maintenance" },
  MAINTENANCE_WRITE: { key: "MAINTENANCE_WRITE", label: "Edit Maintenance Bills", module: "Maintenance" },
  MAINTENANCE_GENERATE: { key: "MAINTENANCE_GENERATE", label: "Generate Bills", module: "Maintenance" },
  GATE_READ: { key: "GATE_READ", label: "View Gate Logs", module: "Gate" },
  GATE_WRITE: { key: "GATE_WRITE", label: "Log Visitors", module: "Gate" },
  GATE_APPROVE: { key: "GATE_APPROVE", label: "Approve/Reject Entry", module: "Gate" },
  NOTICE_READ: { key: "NOTICE_READ", label: "View Notices", module: "Notices" },
  NOTICE_WRITE: { key: "NOTICE_WRITE", label: "Create/Edit Notices", module: "Notices" },
  COMPLAINT_READ: { key: "COMPLAINT_READ", label: "View Complaints", module: "Complaints" },
  COMPLAINT_WRITE: { key: "COMPLAINT_WRITE", label: "File Complaints", module: "Complaints" },
  COMPLAINT_ASSIGN: { key: "COMPLAINT_ASSIGN", label: "Assign Complaints", module: "Complaints" },
  ROLE_MANAGE: { key: "ROLE_MANAGE", label: "Manage Roles", module: "Administration" },
  SETTINGS_MANAGE: { key: "SETTINGS_MANAGE", label: "Manage Settings", module: "Administration" },
  GATEKEEPER: { key: "GATEKEEPER", label: "Gatekeeper Panel", module: "Gate" },
  DASHBOARD_VIEW: { key: "DASHBOARD_VIEW", label: "View Dashboard", module: "Dashboard" },
} as const;

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[];

export const PERMISSION_MODULES = [...new Set(Object.values(PERMISSIONS).map((p) => p.module))];

export function getPermissionsByModule(module: string) {
  return Object.values(PERMISSIONS).filter((p) => p.module === module);
}
