import type { ReactNode } from "react";
import { Building2 } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel - hidden on mobile */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-sidebar via-primary to-accent p-10 lg:flex">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute top-1/3 right-10 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Informatics</span>
          </div>
        </div>

        <div className="relative z-10">
          <blockquote className="space-y-4">
            <p className="text-2xl font-semibold leading-relaxed text-white/90">
              Modern society management, simplified.
            </p>
            <p className="text-base text-white/60">
              Manage your housing society with ease — residents, billing, visitors, and more, all in one place.
            </p>
          </blockquote>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-white/40">Informatics Society Management</p>
        </div>
      </div>

      {/* Right form area */}
      <div className="relative flex flex-1 items-center justify-center p-4 sm:p-8">
        {/* Ambient gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
