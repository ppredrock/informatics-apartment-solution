"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Building, Home, Loader2 } from "lucide-react";

export default function UnitsSettingsPage() {
  const queryClient = useQueryClient();
  const [blockName, setBlockName] = useState("");
  const [unitForm, setUnitForm] = useState({
    unitNumber: "",
    floor: "0",
    unitType: "TWO_BHK",
    area: "",
    blockId: "",
  });
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);

  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const res = await fetch("/api/settings/units?type=blocks");
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await fetch("/api/settings/units");
      const json = await res.json();
      return json.data || [];
    },
  });

  const addBlockMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "block", name: blockName }),
      });
      if (!res.ok) throw new Error("Failed to create block");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocks"] });
      setBlockName("");
      setBlockDialogOpen(false);
      toast.success("Block added");
    },
    onError: () => toast.error("Failed to add block"),
  });

  const addUnitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitNumber: unitForm.unitNumber,
          floor: parseInt(unitForm.floor),
          unitType: unitForm.unitType,
          area: unitForm.area ? parseFloat(unitForm.area) : null,
          blockId: unitForm.blockId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create unit");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setUnitForm({ unitNumber: "", floor: "0", unitType: "TWO_BHK", area: "", blockId: "" });
      setUnitDialogOpen(false);
      toast.success("Unit added");
    },
    onError: () => toast.error("Failed to add unit"),
  });

  const isLoading = blocksLoading || unitsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Blocks & Units" description="Configure your society structure" />

      {/* Blocks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Blocks / Wings
          </CardTitle>
          <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Block
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Block / Wing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Block Name</Label>
                  <Input
                    placeholder="e.g. A, B, Tower 1"
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                  />
                </div>
                <Button onClick={() => addBlockMutation.mutate()} disabled={!blockName || addBlockMutation.isPending}>
                  {addBlockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Block
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {(blocks || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No blocks added yet. Add your first block to get started.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(blocks || []).map((block: any) => (
                <div key={block.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{block.name}</span>
                  <span className="text-sm text-muted-foreground">({block._count?.units || 0} units)</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Units */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Units / Flats
          </CardTitle>
          <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={(blocks || []).length === 0}>
                <Plus className="mr-1 h-4 w-4" />
                Add Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Unit / Flat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Block</Label>
                  <Select value={unitForm.blockId} onValueChange={(v) => setUnitForm({ ...unitForm, blockId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                    <SelectContent>
                      {(blocks || []).map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit Number</Label>
                    <Input placeholder="e.g. 101" value={unitForm.unitNumber} onChange={(e) => setUnitForm({ ...unitForm, unitNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Input type="number" value={unitForm.floor} onChange={(e) => setUnitForm({ ...unitForm, floor: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={unitForm.unitType} onValueChange={(v) => setUnitForm({ ...unitForm, unitType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDIO">Studio</SelectItem>
                        <SelectItem value="ONE_BHK">1 BHK</SelectItem>
                        <SelectItem value="TWO_BHK">2 BHK</SelectItem>
                        <SelectItem value="THREE_BHK">3 BHK</SelectItem>
                        <SelectItem value="FOUR_BHK">4 BHK</SelectItem>
                        <SelectItem value="PENTHOUSE">Penthouse</SelectItem>
                        <SelectItem value="SHOP">Shop</SelectItem>
                        <SelectItem value="OFFICE">Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Area (sq.ft.)</Label>
                    <Input type="number" placeholder="Optional" value={unitForm.area} onChange={(e) => setUnitForm({ ...unitForm, area: e.target.value })} />
                  </div>
                </div>
                <Button
                  onClick={() => addUnitMutation.mutate()}
                  disabled={!unitForm.unitNumber || !unitForm.blockId || addUnitMutation.isPending}
                >
                  {addUnitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Unit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {(units || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No units added yet. Add blocks first, then add units.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Block</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Area</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(units || []).map((unit: any) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.block?.name}</TableCell>
                    <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                    <TableCell>{unit.floor}</TableCell>
                    <TableCell>{unit.type.replace(/_/g, " ")}</TableCell>
                    <TableCell>{unit.area ? `${unit.area} sq.ft.` : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
