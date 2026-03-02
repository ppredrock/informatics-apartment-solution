import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Building2, Home, IndianRupee } from "lucide-react";

export default function SettingsPage() {
  const settingsCards = [
    {
      title: "Society Profile",
      description: "Manage society name, address, and contact details",
      href: "/settings/profile",
      icon: Building2,
    },
    {
      title: "Blocks & Units",
      description: "Configure blocks, floors, and unit details",
      href: "/settings/units",
      icon: Home,
    },
    {
      title: "Billing Configuration",
      description: "Set up maintenance billing heads and amounts",
      href: "/settings/billing",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your society configuration" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
