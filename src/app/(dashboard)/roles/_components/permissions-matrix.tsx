"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PERMISSIONS, PERMISSION_MODULES, getPermissionsByModule } from "@/lib/constants/permissions";

interface PermissionsMatrixProps {
  selected: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function PermissionsMatrix({ selected, onChange, disabled }: PermissionsMatrixProps) {
  function togglePermission(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((p) => p !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  function toggleModule(module: string) {
    const modulePerms: string[] = getPermissionsByModule(module).map((p) => p.key);
    const allSelected = modulePerms.every((p) => selected.includes(p));
    if (allSelected) {
      onChange(selected.filter((p) => !modulePerms.includes(p)));
    } else {
      const newPerms = [...new Set([...selected, ...modulePerms])];
      onChange(newPerms);
    }
  }

  return (
    <div className="space-y-6">
      {PERMISSION_MODULES.map((module) => {
        const modulePerms = getPermissionsByModule(module);
        const allSelected = modulePerms.every((p) => selected.includes(p.key));
        const someSelected = modulePerms.some((p) => selected.includes(p.key));

        return (
          <div key={module} className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`module-${module}`}
                checked={allSelected}
                ref={undefined}
                onCheckedChange={() => toggleModule(module)}
                disabled={disabled}
                {...(someSelected && !allSelected ? { "data-state": "indeterminate" } : {})}
              />
              <Label htmlFor={`module-${module}`} className="font-semibold">
                {module}
              </Label>
            </div>
            <div className="ml-6 grid grid-cols-2 gap-2">
              {modulePerms.map((perm) => (
                <div key={perm.key} className="flex items-center gap-2">
                  <Checkbox
                    id={perm.key}
                    checked={selected.includes(perm.key)}
                    onCheckedChange={() => togglePermission(perm.key)}
                    disabled={disabled}
                  />
                  <Label htmlFor={perm.key} className="text-sm font-normal">
                    {perm.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
