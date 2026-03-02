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
    },
    {
      title: "Monthly Collection",
      value: "\u20B90",
      description: "This month",
      icon: IndianRupee,
    },
    {
      title: "Visitors Today",
      value: "0",
      description: "Entries logged",
      icon: DoorOpen,
    },
    {
      title: "Open Complaints",
      value: "0",
      description: "Pending resolution",
      icon: MessageSquareWarning,
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
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity to display. Start by adding members and configuring your society.
            </p>
          </CardContent>
        </Card>
        <Card>
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
