"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { usePermissions } from "@/hooks/use-permission";
import { useSidebarMobile } from "@/hooks/use-sidebar-mobile";
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
  const { open: mobileOpen, setOpen: setMobileOpen } = useSidebarMobile();

  function toggleExpand(title: string) {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  function renderNavItem(item: NavItem, isMobile = false) {
    if (item.permission && !hasPermission(item.permission)) return null;

    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const Icon = item.icon;
    const isCollapsed = !isMobile && collapsed;

    return (
      <div key={item.title}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.title)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")}
                  />
                </>
              )}
            </button>
            {!isCollapsed && isExpanded && (
              <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                {item.children!.map((child) => {
                  if (child.permission && !hasPermission(child.permission)) return null;
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => isMobile && setMobileOpen(false)}
                      className={cn(
                        "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                        pathname === child.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
            onClick={() => isMobile && setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        )}
      </div>
    );
  }

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Header */}
      <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        {(isMobile || !collapsed) && (
          <span className="truncate font-semibold text-sidebar-foreground">{societyName}</span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-3">
        <nav className="space-y-1">{navItems.map((item) => renderNavItem(item, isMobile))}</nav>
      </ScrollArea>

      {/* Collapse toggle - desktop only */}
      {!isMobile && (
        <div className="border-t border-white/10 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "relative z-20 hidden h-screen flex-col bg-sidebar backdrop-blur-xl transition-all duration-300 md:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent(false)}
      </aside>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0 text-sidebar-foreground" showCloseButton={false}>
          <div className="flex h-full flex-col">
            {sidebarContent(true)}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
