"use client";

import { useRouter } from "next/navigation";
import { useComplianceReport } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Users, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function CompliancePage() {
  const router = useRouter();
  const { data, isLoading } = useComplianceReport();

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>;
  if (!data) return <p className="text-center py-12 text-muted-foreground">Failed to load compliance data.</p>;

  const complianceRate = data.totalEmployees > 0 ? Math.round((data.fullyCompliant / data.totalEmployees) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/policies")} className="gap-2"><ChevronLeft className="w-4 h-4" />Back</Button>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Compliance Report</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-blue-50"><Users className="w-5 h-5 text-blue-600" /></div><span className="text-sm text-muted-foreground">Total Employees</span></div>
          <p className="text-3xl font-bold text-foreground">{data.totalEmployees}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-emerald-50"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div><span className="text-sm text-muted-foreground">Fully Compliant</span></div>
          <p className="text-3xl font-bold text-emerald-600">{data.fullyCompliant} <span className="text-base font-normal text-muted-foreground">({complianceRate}%)</span></p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-red-50"><AlertCircle className="w-5 h-5 text-red-600" /></div><span className="text-sm text-muted-foreground">Non-Compliant</span></div>
          <p className="text-3xl font-bold text-red-600">{data.nonCompliant.length}</p>
        </Card>
      </div>

      {/* Per-policy breakdown */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Policy Breakdown</h2>
        {data.policies.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No required policies configured.</p> : (
          <div className="space-y-3">
            {data.policies.map((p) => {
              const rate = data.totalEmployees > 0 ? Math.round((p.acceptedCount / data.totalEmployees) * 100) : 0;
              return (
                <div key={p._id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-border">
                  <div><p className="text-sm font-medium text-foreground">{p.title}</p><p className="text-xs text-muted-foreground">Version {p.version}</p></div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${rate}%` }} /></div>
                    <span className="text-sm font-medium text-foreground w-16 text-right">{p.acceptedCount}/{data.totalEmployees}</span>
                    <Badge variant={rate === 100 ? "default" : "secondary"} className="text-xs">{rate}%</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Non-compliant employees list */}
      {data.nonCompliant.length > 0 && (
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Non-Compliant Employees ({data.nonCompliant.length})</h2>
          <div className="space-y-2">
            {data.nonCompliant.map((emp) => (
              <div key={emp._id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border">
                <div><p className="text-sm font-medium text-foreground">{emp.name}</p><p className="text-xs text-muted-foreground">{emp.email}{emp.position && ` · ${emp.position}`}</p></div>
                {emp.department && <Badge variant="outline" className="text-xs">{emp.department.name}</Badge>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
