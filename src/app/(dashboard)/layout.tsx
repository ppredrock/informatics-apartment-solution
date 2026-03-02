import { type ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarMobileProvider } from "@/hooks/use-sidebar-mobile";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarMobileProvider>
      <div className="relative flex h-screen overflow-hidden">
        {/* Decorative ambient gradient blobs */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-1/2 -left-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <AppSidebar />
        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarMobileProvider>
  );
}
