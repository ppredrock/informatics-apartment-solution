import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Users, IndianRupee, DoorOpen, MessageSquareWarning } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Members",
      value: "0",
      description: "Active residents",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Monthly Collection",
      value: "\u20B90",
      description: "This month",
      icon: IndianRupee,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Visitors Today",
      value: "0",
      description: "Entries logged",
      icon: DoorOpen,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Open Complaints",
      value: "0",
      description: "Pending resolution",
      icon: MessageSquareWarning,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your society management"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
              {/* Gradient accent strip */}
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary to-accent" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display. Start by adding members and configuring your society.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Set up your society by adding blocks, units, and members.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
