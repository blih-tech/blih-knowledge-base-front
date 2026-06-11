"use client";

import { useMemo, useState } from "react";
import type { Initiative, EvaluationCriterion } from "@/lib/api/initiatives.api";
import { useEvaluationConfig, useInitiativeEvaluation } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/StarRating";
import { EvaluationBadge } from "@/components/EvaluationBadge";
import { Loader2, Save, Star, Activity } from "lucide-react";

/** Saturating engagement curve — mirrors the backend computation for preview. */
function engagementScore(commentsCount: number, reactionsCount: number): number {
  const raw = commentsCount + reactionsCount;
  return 1 + 4 * (1 - Math.exp(-raw / 8));
}

function autoRaw(initiative: Initiative, criterion: EvaluationCriterion): number {
  if (criterion.source === "auto:peerRating") {
    return initiative.ratingsCount > 0 ? Math.min(5, Math.max(1, initiative.averageRating)) : 0;
  }
  if (criterion.source === "auto:engagement") {
    return engagementScore(initiative.commentsCount, (initiative.reactions || []).length);
  }
  return 0;
}

export function InitiativeEvaluationPanel({ initiative }: { initiative: Initiative }) {
  const { data: config, isLoading } = useEvaluationConfig();
  const { saveEvaluation } = useInitiativeEvaluation();

  // Seed manual scores from any prior evaluation.
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const seed: Record<string, number> = {};
    for (const cs of initiative.evaluation?.criterionScores ?? []) {
      if (cs.manualScore !== undefined) seed[cs.key] = cs.manualScore;
    }
    return seed;
  });
  const [note, setNote] = useState(initiative.evaluation?.note ?? "");

  const manualCriteria = (config?.criteria ?? []).filter((c) => c.source === "manual");
  const autoCriteria = (config?.criteria ?? []).filter((c) => c.source !== "manual");
  const allManualScored = manualCriteria.every((c) => scores[c.key] >= 1);

  // Live preview of the final score (server is the source of truth on save).
  const preview = useMemo(() => {
    if (!config || !allManualScored) return null;
    const contributing = config.criteria
      .map((c) => ({
        weight: c.weight,
        raw: c.source === "manual" ? scores[c.key] ?? 0 : autoRaw(initiative, c),
      }))
      .filter((c) => c.weight > 0 && c.raw > 0);
    const totalWeight = contributing.reduce((s, c) => s + c.weight, 0);
    if (totalWeight <= 0) return 0;
    const weighted = contributing.reduce((s, c) => s + c.weight * (c.raw / 5), 0);
    return Math.round((100 * weighted) / totalWeight);
  }, [config, scores, allManualScored, initiative]);

  const previewTier = useMemo(() => {
    if (preview === null || !config) return null;
    return config.tiers.find((t) => preview >= t.min && preview <= t.max) ?? null;
  }, [preview, config]);

  if (initiative.status !== "submitted") return null;

  const handleSave = () => {
    saveEvaluation.mutate({ id: initiative._id, scores, note });
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-violet-500/50 to-indigo-400/50" />
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Performance Evaluation
          </h3>
          {initiative.evaluation?.state === "evaluated" && (
            <EvaluationBadge evaluation={initiative.evaluation} size="sm" />
          )}
        </div>

        {isLoading || !config ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading criteria…
          </div>
        ) : (
          <>
            {/* Manual criteria */}
            <div className="space-y-4">
              {manualCriteria.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{c.label}</p>
                    <p className="text-[11px] text-muted-foreground">Weight {c.weight}</p>
                  </div>
                  <StarRating
                    value={scores[c.key] ?? 0}
                    onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))}
                  />
                </div>
              ))}
            </div>

            {autoCriteria.length > 0 && <Separator />}

            {/* Auto criteria (read-only) */}
            <div className="space-y-2">
              {autoCriteria.map((c) => {
                const raw = autoRaw(initiative, c);
                return (
                  <div key={c.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {c.source === "auto:peerRating" ? <Star className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                      {c.label} <span className="text-[11px]">· weight {c.weight}</span>
                    </span>
                    <span className="font-medium text-foreground">
                      {raw > 0 ? `${raw.toFixed(1)}/5` : "no signal yet"}
                    </span>
                  </div>
                );
              })}
            </div>

            <Separator />

            {/* Note */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Evaluator note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={2000}
                placeholder="Rationale for this evaluation…"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            {/* Preview + save */}
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {preview !== null ? (
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">Projected score:</span>
                    <span className="font-bold text-foreground">{preview}/100</span>
                    {previewTier && <span className="text-muted-foreground">· {previewTier.label}</span>}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Score all manual criteria to compute</span>
                )}
              </div>
              <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saveEvaluation.isPending}>
                {saveEvaluation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save evaluation
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
