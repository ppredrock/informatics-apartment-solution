"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Check, AlertCircle, Loader2, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface ParsedRow {
  name: string;
  email: string;
  phone?: string;
  unitId: string;
  ownershipType: string;
  valid: boolean;
  errors: string[];
}

export default function UploadMembersPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});

  const { data: unitsData } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await fetch("/api/settings/units");
      const json = await res.json();
      return json.data || [];
    },
  });

  const units = unitsData || [];

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const arrayBuffer = await selectedFile.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    if (jsonData.length === 0) {
      toast.error("No data found in the file");
      return;
    }

    // Auto-detect column mapping
    const headers = Object.keys(jsonData[0]);
    const autoMap: Record<string, string> = {};
    headers.forEach((h) => {
      const lower = h.toLowerCase().trim();
      if (lower.includes("name") && !lower.includes("society")) autoMap.name = h;
      if (lower.includes("email") || lower.includes("mail")) autoMap.email = h;
      if (lower.includes("phone") || lower.includes("mobile") || lower.includes("contact")) autoMap.phone = h;
      if (lower.includes("flat") || lower.includes("unit")) autoMap.unit = h;
      if (lower.includes("type") || lower.includes("owner")) autoMap.ownershipType = h;
    });
    setColumnMap(autoMap);

    // Parse rows
    const rows: ParsedRow[] = jsonData.map((row) => {
      const name = row[autoMap.name] || "";
      const email = row[autoMap.email] || "";
      const phone = row[autoMap.phone] || "";
      const unitRef = row[autoMap.unit] || "";
      const ownership = row[autoMap.ownershipType] || "OWNER";

      const errors: string[] = [];
      if (!name) errors.push("Name is required");
      if (!email || !email.includes("@")) errors.push("Valid email is required");

      // Try to match unit
      const matchedUnit = units.find(
        (u: any) => u.unitNumber === unitRef || `${u.block?.name}-${u.unitNumber}` === unitRef
      );

      return {
        name,
        email,
        phone,
        unitId: matchedUnit?.id || "",
        ownershipType: ["OWNER", "TENANT", "FAMILY"].includes(ownership.toUpperCase()) ? ownership.toUpperCase() : "OWNER",
        valid: errors.length === 0 && !!matchedUnit,
        errors: !matchedUnit && unitRef ? [...errors, `Unit "${unitRef}" not found`] : errors,
      };
    });

    setParsed(rows);
  }, [units]);

  async function handleUpload() {
    const validRows = parsed.filter((r) => r.valid);
    if (validRows.length === 0) {
      toast.error("No valid rows to upload");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/members/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: validRows }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(`${json.data.created} members imported, ${json.data.skipped} skipped`);
        router.push("/members");
      } else {
        toast.error(json.error?.message || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([
      { Name: "John Doe", Email: "john@example.com", Phone: "9876543210", "Flat/Unit": "A-101", Type: "OWNER" },
      { Name: "Jane Smith", Email: "jane@example.com", Phone: "9876543211", "Flat/Unit": "A-102", Type: "TENANT" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "members-template.xlsx");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Upload Members" description="Bulk import members from an Excel file" />

      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload a .xlsx or .csv file with member details. The file should have columns for Name, Email, Phone, Flat/Unit, and Type (Owner/Tenant).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 hover:border-primary/50 transition-colors"
              >
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">{file ? file.name : "Click to select a file"}</p>
                  <p className="text-sm text-muted-foreground">.xlsx or .csv files supported</p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {parsed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({parsed.length} rows)</CardTitle>
            <CardDescription>
              <span className="text-green-600">{parsed.filter((r) => r.valid).length} valid</span>
              {" / "}
              <span className="text-red-600">{parsed.filter((r) => !r.valid).length} invalid</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.slice(0, 50).map((row, i) => (
                  <TableRow key={i} className={!row.valid ? "bg-red-50" : ""}>
                    <TableCell>
                      {row.valid ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone || "-"}</TableCell>
                    <TableCell>{row.unitId ? "Matched" : "Not found"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.ownershipType}</Badge>
                    </TableCell>
                    <TableCell>
                      {row.errors.length > 0 && (
                        <span className="text-xs text-red-600">{row.errors.join(", ")}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setParsed([]); setFile(null); }}>
                Clear
              </Button>
              <Button onClick={handleUpload} disabled={uploading || parsed.filter((r) => r.valid).length === 0}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                Import {parsed.filter((r) => r.valid).length} Members
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
