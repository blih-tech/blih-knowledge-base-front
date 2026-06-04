"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActivePolicies, usePolicyMutations } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollText, CheckCircle2, Loader2, ChevronRight, Shield } from "lucide-react";

function PolicyAcceptanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("from") || "/";
  const { data: policies, isLoading, refetch } = useActivePolicies();
  const { acceptPolicy } = usePolicyMutations();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const handleScrollToEnd = (id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  };

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      await acceptPolicy.mutateAsync(id);
      await refetch();
    } catch {
      // error is handled by the mutation
    } finally {
      setAcceptingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const allPolicies = policies ?? [];
  const requiredPolicies = allPolicies.filter((p) => p.isRequired);
  const pendingPolicies = requiredPolicies.filter((p) => !p.isAccepted);
  const acceptedCount = requiredPolicies.length - pendingPolicies.length;
  const allAccepted = pendingPolicies.length === 0 && requiredPolicies.length > 0;

  if (allAccepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">All Policies Accepted</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You have accepted all required company policies. You can now proceed to the platform.
          </p>
          <Button onClick={() => router.push(returnTo)} className="gap-2">
            Continue to Platform <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Company Policy Acceptance</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Please read and accept the following company policies before proceeding to the platform.
          </p>
          {requiredPolicies.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">
                {acceptedCount} of {requiredPolicies.length} accepted
              </span>
              <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(acceptedCount / requiredPolicies.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Policy cards */}
        <div className="space-y-4">
          {allPolicies.map((policy) => {
            const isExpanded = expandedId === policy._id;
            const hasRead = readIds.has(policy._id);
            const canAccept = hasRead || policy.isAccepted;

            return (
              <Card key={policy._id} className="overflow-hidden shadow-sm">
                {/* Policy header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : policy._id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/40 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <ScrollText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground">{policy.title}</h3>
                    <p className="text-xs text-muted-foreground">Version {policy.version}</p>
                  </div>
                  {policy.isAccepted ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Accepted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Pending
                    </Badge>
                  )}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    <div
                      className="px-5 py-4 max-h-[50vh] overflow-y-auto prose prose-sm max-w-none policy-content"
                      onScroll={(e) => {
                        const el = e.currentTarget;
                        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
                          handleScrollToEnd(policy._id);
                        }
                      }}
                      dangerouslySetInnerHTML={{ __html: policy.contentHtml }}
                    />
                    {!policy.isAccepted && (
                      <div className="px-5 py-3 bg-secondary/30 border-t border-border flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {hasRead
                            ? "You have scrolled through the policy. Click to accept."
                            : "Please scroll to the end of the policy to enable acceptance."}
                        </p>
                        <Button
                          size="sm"
                          disabled={!canAccept || acceptingId === policy._id}
                          onClick={() => handleAccept(policy._id)}
                          className="gap-1.5"
                        >
                          {acceptingId === policy._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {acceptingId === policy._id ? "Accepting…" : "I Accept"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PolicyAcceptancePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <PolicyAcceptanceContent />
    </Suspense>
  );
}
