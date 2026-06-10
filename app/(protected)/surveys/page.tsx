"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { listPublicSurveys, getPublicSurvey, submitSurveyResponse, getSurveySummary, type Survey, type SurveyField, type SurveyCategory } from "@/lib/api/surveys.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ChevronLeft, Loader2, AlertCircle, Send, CheckCircle2, Clock, Users, BarChart3 } from "lucide-react";

const CATEGORY_COLORS: Record<SurveyCategory, string> = {
  feedback: "bg-blue-50 text-blue-700 border-blue-200",
  ideas: "bg-amber-50 text-amber-700 border-amber-200",
  satisfaction: "bg-emerald-50 text-emerald-700 border-emerald-200",
  poll: "bg-violet-50 text-violet-700 border-violet-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function PublicSurveysPage() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["surveys", "public", page],
    queryFn: () => listPublicSurveys(page),
  });

  const surveys = data?.surveys || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  if (selectedId) {
    return <SurveyFiller surveyId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto pt-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10"><ClipboardList className="w-5 h-5 text-primary" /></div>
        <div><h1 className="text-xl font-bold">Surveys</h1><p className="text-sm text-muted-foreground">Share your feedback and ideas</p></div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : error ? (
        <Card className="p-6 text-center text-red-600"><AlertCircle className="w-5 h-5 mx-auto mb-2" />Failed to load surveys</Card>
      ) : surveys.length === 0 ? (
        <Card className="p-12 text-center"><ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No surveys available right now</p></Card>
      ) : (
        <div className="space-y-3">
          {surveys.map((s) => (
            <Card key={s._id} className="p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all" onClick={() => setSelectedId(s._id)}>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-semibold text-sm">{s.title}</h3>
                <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[s.category]}`}>{s.category}</Badge>
              </div>
              {s.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{s.description}</p>}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{s.fields.length} questions</span>
                {s.settings.closesAt && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Closes {new Date(s.settings.closesAt).toLocaleDateString()}</span>}
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.responsesCount} responses</span>
              </div>
            </Card>
          ))}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground py-2">Page {page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Survey Filler ────────────────────────────────────────────────────────────

function SurveyFiller({ surveyId, onBack }: { surveyId: string; onBack: () => void }) {
  const { data: survey, isLoading } = useQuery({ queryKey: ["surveys", "public", surveyId], queryFn: () => getPublicSurvey(surveyId) });
  const { data: summary } = useQuery({
    queryKey: ["surveys", "public", surveyId, "summary"],
    queryFn: () => getSurveySummary(surveyId),
    enabled: false,
  });
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: () => {
      const payload = Object.entries(answers).map(([fieldId, value]) => ({ fieldId, value }));
      return submitSurveyResponse(surveyId, payload);
    },
    onSuccess: () => setSubmitted(true),
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to submit";
      setSubmitError(msg);
    },
  });

  if (isLoading || !survey) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto pt-6">
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">Thank you!</h2>
          <p className="text-muted-foreground mb-6">Your response has been recorded.</p>
          <div className="flex justify-center gap-3">
            <Button onClick={onBack}>Back to Surveys</Button>
          </div>
        </Card>
      </div>
    );
  }

  const sorted = [...survey.fields].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-2xl mx-auto pt-6 space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[survey.category]}`}>{survey.category}</Badge>
          </div>
          <h2 className="text-lg font-bold">{survey.title}</h2>
          {survey.description && <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>}
        </div>
      </Card>

      <div className="space-y-4">
        {sorted.map((field) => (
          <Card key={field.id} className="p-5">
            <label className="text-sm font-medium mb-2 block">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <FieldInput field={field} value={answers[field.id]} onChange={(v) => setAnswers((a) => ({ ...a, [field.id]: v }))} />
          </Card>
        ))}
      </div>

      {submitError && <Card className="p-4 border-red-200 bg-red-50 text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{submitError}</Card>}

      <Button className="w-full gap-2" size="lg" onClick={() => { setSubmitError(null); submit.mutate(); }} disabled={submit.isPending}>
        {submit.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Submit Response
      </Button>
    </div>
  );
}

// ─── Dynamic field renderer ──────────────────────────────────────────────────

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
        <div className="space-y-2">
          {field.options.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name={field.id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="accent-primary" />{o.label}
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="accent-primary" />{field.placeholder || "Yes"}
        </label>
      );
    case "rating":
      return (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => onChange(n)}
              className={`w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all ${value === n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>{n}</button>
          ))}
        </div>
      );
    default:
      return <Input value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} />;
  }
}
