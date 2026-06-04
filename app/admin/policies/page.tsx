"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePolicies, usePolicyMutations } from "@/hooks/queries";
import { POLICY_TYPE_LABELS } from "@/lib/api/policies.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  ScrollText,
  Eye,
  Trash2,
  BarChart3,
  Edit2,
  Users,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function AdminPoliciesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { policies, pagination, isLoading, invalidate } = usePolicies(
    statusFilter ? { status: statusFilter } : {}
  );
  const { deletePolicy } = usePolicyMutations();

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Archive "${title}"? It will no longer be enforced.`)) return;
    deletePolicy.mutate(id, { onSuccess: invalidate });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Employment Policies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage company policies — Terms &amp; Conditions, Privacy
            Policy, etc.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/policies/compliance")}
            className="gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            Compliance Report
          </Button>
          <Button
            onClick={() => router.push("/admin/policies/new")}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {["", "draft", "active", "archived"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === "" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Policy list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : policies.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <ScrollText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No policies yet. Create your first one to get started.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {policies.map((policy) => (
            <Card
              key={policy._id}
              className="p-4 hover:bg-secondary/40 transition-colors cursor-pointer group"
              onClick={() => router.push(`/admin/policies/${policy._id}`)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <ScrollText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {policy.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs font-normal shrink-0 ${STATUS_COLORS[policy.status]}`}
                      >
                        {policy.status}
                      </Badge>
                      {policy.isRequired && (
                        <Badge
                          variant="outline"
                          className="text-xs font-normal shrink-0 bg-red-50 text-red-600 border-red-200"
                        >
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-primary/70">{POLICY_TYPE_LABELS[policy.policyType] ?? policy.policyType}</span>
                      <span className="mx-1">·</span>
                      Version {policy.version}
                      {policy.createdBy && (
                        <span className="ml-2">
                          by {policy.createdBy.name}
                        </span>
                      )}
                      {policy.publishedAt && (
                        <span className="ml-2">
                          · Published{" "}
                          {new Date(policy.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Acceptance count */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{policy.acceptanceCount} accepted</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/policies/${policy._id}`);
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(policy._id, policy.title);
                    }}
                    disabled={deletePolicy.isPending}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} policies)
          </span>
        </div>
      )}
    </div>
  );
}
