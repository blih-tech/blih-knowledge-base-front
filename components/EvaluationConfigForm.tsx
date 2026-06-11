"use client";

import { useEffect, useState } from "react";
import type { EvaluationConfig } from "@/lib/api/initiatives.api";
import { useEvaluationConfig, useInitiativeEvaluation } from "@/hooks/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Loader2, Save, Info } from "lucide-react";

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual (admin scores)",
  "auto:peerRating": "Auto · peer rating",
  "auto:engagement": "Auto · engagement",
};

export function EvaluationConfigForm({ onBack }: { onBack: () => void }) {
  const { data, isLoading } = useEvaluationConfig();
  const { saveConfig } = useInitiativeEvaluation();
  const [draft, setDraft] = useState<EvaluationConfig | null>(null);

  useEffect(() => {
    if (data && !draft) setDraft(JSON.parse(JSON.stringify(data)));
  }, [data, draft]);

  const totalWeight = (draft?.criteria ?? []).reduce((s, c) => s + (Number(c.weight) || 0), 0);

  const setWeight = (key: string, weight: number) =>
    setDraft((d) => (d ? { ...d, criteria: d.criteria.map((c) => (c.key === key ? { ...c, weight } : c)) } : d));

  const setTier = (key: string, field: "min" | "max", value: number) =>
    setDraft((d) => (d ? { ...d, tiers: d.tiers.map((t) => (t.key === key ? { ...t, [field]: value } : t)) } : d));

  const handleSave = () => {
    if (draft) saveConfig.mutate(draft, { onSuccess: onBack });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground" onClick={onBack}>
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saveConfig.isPending || totalWeight <= 0}>
          {saveConfig.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save settings
        </Button>
      </div>

      {isLoading || !draft ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </div>
      ) : (
        <>
          <Card className="p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Criteria weights</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Weights are relative — they don&apos;t have to sum to 100. Current total: <strong>{totalWeight}</strong>
              </p>
            </div>
            <Separator />
            {draft.criteria.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.label}</p>
                  <p className="text-[11px] text-muted-foreground">{SOURCE_LABELS[c.source] ?? c.source}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={c.weight}
                    onChange={(e) => setWeight(c.key, Number(e.target.value))}
                    className="w-24 h-8 text-sm"
                  />
                  <span className="text-xs text-muted-foreground w-10">
                    {totalWeight > 0 ? `${Math.round((c.weight / totalWeight) * 100)}%` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold">Score tiers (0–100)</h2>
            <Separator />
            {draft.tiers.map((t) => (
              <div key={t.key} className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-foreground">{t.label}</span>
                <div className="flex items-center gap-2 text-sm">
                  <Input type="number" min={0} max={100} value={t.min}
                    onChange={(e) => setTier(t.key, "min", Number(e.target.value))} className="w-20 h-8" />
                  <span className="text-muted-foreground">to</span>
                  <Input type="number" min={0} max={100} value={t.max}
                    onChange={(e) => setTier(t.key, "max", Number(e.target.value))} className="w-20 h-8" />
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Existing evaluations keep the weights they were scored with; new weights apply to future evaluations.</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
