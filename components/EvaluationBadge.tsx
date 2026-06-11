"use client";

import type { InitiativeEvaluation } from "@/lib/api/initiatives.api";
import { Award } from "lucide-react";

const TIER_COLORS: Record<string, string> = {
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
};

const DEFAULT_COLOR = "bg-secondary text-muted-foreground border-border";

/** Map a tier key/color to Tailwind classes. We don't have the config here, so
 *  we colour by the well-known default tiers; unknown tiers fall back neutral. */
function colorForTier(tier: string | null): string {
  if (!tier) return DEFAULT_COLOR;
  if (tier === "needs-work") return TIER_COLORS.red;
  if (tier === "promising") return TIER_COLORS.amber;
  if (tier === "strong") return TIER_COLORS.emerald;
  return DEFAULT_COLOR;
}

export function EvaluationBadge({
  evaluation,
  size = "md",
}: {
  evaluation?: InitiativeEvaluation | null;
  size?: "sm" | "md";
}) {
  if (!evaluation || evaluation.state !== "evaluated" || evaluation.finalScore === null) return null;

  const cls = colorForTier(evaluation.tier);
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${cls} ${padding}`}
      title={`Evaluation score: ${evaluation.finalScore}/100`}
    >
      <Award className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span className="font-semibold">{evaluation.finalScore}</span>
      {evaluation.tierLabel && <span className="opacity-80">· {evaluation.tierLabel}</span>}
    </span>
  );
}
