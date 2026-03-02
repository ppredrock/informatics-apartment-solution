"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, UserPlus, Clock } from "lucide-react";

export default function GatekeeperPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    purpose: "GUEST",
    purposeDetail: "",
    vehicleNo: "",
    unitId: "",
  });

  const { data: units } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await fetch("/api/settings/units");
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: todayVisitors } = useQuery({
    queryKey: ["visitors-today"],
    queryFn: async () => {
      const res = await fetch("/api/gate/visitors?today=true&pageSize=10");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const addVisitor = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/gate/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add visitor");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors-today"] });
      setForm({ name: "", phone: "", purpose: "GUEST", purposeDetail: "", vehicleNo: "", unitId: "" });
      toast.success("Visitor entry logged");
    },
    onError: () => toast.error("Failed to log entry"),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quick Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Quick Visitor Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visitor Name *</Label>
              <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Purpose *</Label>
              <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GUEST">Guest</SelectItem>
                  <SelectItem value="DELIVERY">Delivery</SelectItem>
                  <SelectItem value="CAB">Cab</SelectItem>
                  <SelectItem value="SERVICE">Service</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visiting Unit *</Label>
              <Select value={form.unitId} onValueChange={(v) => setForm({ ...form, unitId: v })}>
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {(units || []).map((unit: any) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.block?.name}-{unit.unitNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Vehicle Number</Label>
            <Input placeholder="Optional" value={form.vehicleNo} onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })} />
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={() => addVisitor.mutate()}
            disabled={!form.name || !form.unitId || addVisitor.isPending}
          >
            {addVisitor.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Entry
          </Button>
        </CardContent>
      </Card>

      {/* Today's Visitors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Entries ({todayVisitors?.pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(todayVisitors?.data || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No entries today</p>
          ) : (
            <div className="space-y-2">
              {(todayVisitors?.data || []).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.purpose} | {v.unit?.block?.name}-{v.unit?.unitNumber}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(v.entryTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
