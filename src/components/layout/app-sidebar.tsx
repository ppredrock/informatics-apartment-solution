"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePermissions } from "@/hooks/use-permission";
import { navItems, type NavItem } from "@/lib/constants/nav-items";
import { Building2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface AppSidebarProps {
  societyName?: string;
}

export function AppSidebar({ societyName = "Informatics Society" }: AppSidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  function toggleExpand(title: string) {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  function renderNavItem(item: NavItem) {
    if (item.permission && !hasPermission(item.permission)) return null;

    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const Icon = item.icon;

    return (
      <div key={item.title}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.title)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")}
                  />
                </>
              )}
            </button>
            {!collapsed && isExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                {item.children!.map((child) => {
                  if (child.permission && !hasPermission(child.permission)) return null;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "block rounded-md px-3 py-1.5 text-sm transition-colors",
                        pathname === child.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {child.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        )}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Building2 className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && (
          <span className="truncate font-semibold">{societyName}</span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-3">
        <nav className="space-y-1">{navItems.map(renderNavItem)}</nav>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
