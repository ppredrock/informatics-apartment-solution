import type { ReactNode } from "react";

export default function GatekeeperLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Gatekeeper Panel</h1>
          <span className="text-sm text-muted-foreground">Informatics Society</span>
        </div>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
