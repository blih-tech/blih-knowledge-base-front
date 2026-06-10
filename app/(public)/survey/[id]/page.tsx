"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getExternalSurvey, submitExternalResponse, type SurveyField } from "@/lib/api/surveys.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, CheckCircle2, AlertCircle, ClipboardList, Clock } from "lucide-react";

export default function PublicSurveyPage() {
  const params = useParams();
  const surveyId = params.id as string;

  const { data: survey, isLoading, error } = useQuery({
    queryKey: ["surveys", "external", surveyId],
    queryFn: () => getExternalSurvey(surveyId),
    enabled: !!surveyId,
    retry: false,
  });

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: () => {
      const payload = Object.entries(answers).map(([fieldId, value]) => ({ fieldId, value }));
      return submitExternalResponse(surveyId, payload);
    },
    onSuccess: () => setSubmitted(true),
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit";
      setSubmitError(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <Card className="p-12 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Survey Not Available</h2>
          <p className="text-sm text-muted-foreground">This survey may have been closed, hasn't started yet, or doesn't exist.</p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <Card className="p-12 text-center max-w-md w-full">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground">Your response has been recorded successfully.</p>
        </Card>
      </div>
    );
  }

  const sorted = [...survey.fields].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <Card className="overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className="text-[10px]">{survey.category}</Badge>
            </div>
            <h1 className="text-xl font-bold">{survey.title}</h1>
            {survey.description && <p className="text-sm text-muted-foreground mt-2">{survey.description}</p>}
            {survey.settings.closesAt && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Closes {new Date(survey.settings.closesAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Fields */}
        {sorted.map((field) => (
          <Card key={field.id} className="p-5">
            <label className="text-sm font-medium mb-2.5 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <FieldInput field={field} value={answers[field.id]} onChange={(v) => setAnswers((a) => ({ ...a, [field.id]: v }))} />
          </Card>
        ))}

        {submitError && (
          <Card className="p-4 border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{submitError}
          </Card>
        )}

        <Button className="w-full gap-2" size="lg" onClick={() => { setSubmitError(null); submit.mutate(); }} disabled={submit.isPending}>
          {submit.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Submit Response
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          {survey.settings.allowAnonymous ? "This survey is anonymous." : "Your identity will be recorded."}
        </p>
      </div>
    </div>
  );
}

// ─── Field Renderer ──────────────────────────────────────────────────────────

function FieldInput({ field, value, onChange }: { field: SurveyField; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case "text":
      return <Input placeholder={field.placeholder} value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} />;
    case "textarea":
      return <textarea className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring" rows={4} placeholder={field.placeholder} value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <Input type="number" placeholder={field.placeholder} value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} min={field.validation.min} max={field.validation.max} />;
    case "date":
      return <Input type="date" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <select className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">{field.placeholder || "Select..."}</option>
          {field.options.map((o) => <option key={o.id} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "multi-select":
      return (
        <select multiple className="w-full border rounded-lg px-3 py-2 text-sm bg-background min-h-[100px] focus:outline-none focus:ring-1 focus:ring-ring" value={(value as string[]) || []} onChange={(e) => onChange(Array.from(e.target.selectedOptions, (o) => o.value))}>
          {field.options.map((o) => <option key={o.id} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "radio":
      return (
        <div className="space-y-2.5">
          {field.options.map((o) => (
            <label key={o.id} className="flex items-center gap-2.5 text-sm cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-colors">
              <input type="radio" name={field.id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="accent-primary w-4 h-4" />{o.label}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="accent-primary w-4 h-4" />{field.placeholder || "Yes"}
        </label>
      );
    case "rating":
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => onChange(n)}
              className={`w-11 h-11 rounded-lg border-2 text-sm font-bold transition-all ${value === n ? "bg-primary text-primary-foreground border-primary scale-110" : "border-border hover:border-primary/50 hover:scale-105"}`}>{n}</button>
          ))}
        </div>
      );
    default:
      return <Input value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} />;
  }
}
