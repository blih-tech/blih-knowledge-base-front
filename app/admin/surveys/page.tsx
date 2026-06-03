"use client";

import { useState } from "react";
import { useSurveys, useSurveyMutations, useSurveyResponses, useSurveySummary, useDepartments } from "@/hooks/queries";
import type { Survey, SurveyField, SurveyFieldType, FieldOption, SurveyFilters, SurveyStatus } from "@/lib/api/surveys.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList, Plus, Loader2, AlertCircle, ChevronLeft, Save, Send,
  Trash2, Edit3, Filter, X, BarChart3, Users, Eye, Settings, GripVertical,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type View = "list" | "builder" | "detail" | "responses";

const FIELD_TYPES: { type: SurveyFieldType; label: string }[] = [
  { type: "text", label: "Short Text" }, { type: "textarea", label: "Long Text" },
  { type: "number", label: "Number" }, { type: "select", label: "Dropdown" },
  { type: "multi-select", label: "Multi Select" }, { type: "radio", label: "Radio" },
  { type: "checkbox", label: "Checkbox" }, { type: "date", label: "Date" },
  { type: "rating", label: "Rating" },
];

const STATUS_COLORS: Record<SurveyStatus, string> = { draft: "secondary", active: "default", closed: "outline" } as Record<SurveyStatus, string>;

export default function AdminSurveysPage() {
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Survey | null>(null);
  const [filters, setFilters] = useState<SurveyFilters>({ page: 1, limit: 15 });
  const { surveys, pagination, isLoading, error } = useSurveys(filters);
  const { createSurvey, updateSurvey, deleteSurvey } = useSurveyMutations();

  const goList = () => { setSelected(null); setView("list"); };

  const handleSave = async (data: Record<string, unknown>, status: SurveyStatus) => {
    const payload = { ...data, status };
    if (selected) {
      await updateSurvey.mutateAsync({ id: selected._id, data: payload });
    } else {
      await createSurvey.mutateAsync(payload);
    }
    goList();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this survey and all responses?")) return;
    await deleteSurvey.mutateAsync(id);
    goList();
  };

  if (view === "builder") {
    return <SurveyBuilder initial={selected} onSave={handleSave} onCancel={goList} isSaving={createSurvey.isPending || updateSurvey.isPending} />;
  }
  if (view === "responses" && selected) {
    return <ResponsesView survey={selected} onBack={goList} />;
  }
  if (view === "detail" && selected) {
    return (
      <SurveyDetail survey={selected} onBack={goList}
        onEdit={() => setView("builder")} onResponses={() => setView("responses")}
        onDelete={() => handleDelete(selected._id)} />
    );
  }

  // ─── List ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10"><ClipboardList className="w-5 h-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold">Surveys</h1><p className="text-sm text-muted-foreground">Create forms and collect responses</p></div>
        </div>
        <Button onClick={() => { setSelected(null); setView("builder"); }} className="gap-2"><Plus className="w-4 h-4" />New Survey</Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select className="border rounded-lg px-3 py-2 text-sm bg-background" value={filters.status || ""}
            onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as SurveyStatus | undefined, page: 1 }))}>
            <option value="">All Status</option>
            <option value="draft">Draft</option><option value="active">Active</option><option value="closed">Closed</option>
          </select>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : error ? (
        <Card className="p-6 text-center text-red-600"><AlertCircle className="w-5 h-5 mx-auto mb-2" />{error}</Card>
      ) : surveys.length === 0 ? (
        <Card className="p-12 text-center"><ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No surveys yet</p></Card>
      ) : (
        <div className="space-y-3">
          {surveys.map((s) => (
            <Card key={s._id} className="p-4 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all" onClick={() => { setSelected(s); setView("detail"); }}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{s.title}</h3>
                    <Badge variant={STATUS_COLORS[s.status] as "default" | "secondary" | "outline"} className="text-[10px]">{s.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{s.fields.length} fields</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.responsesCount} responses</span>
                    <span>v{s.version}</span>
                    <span>{s.audience.type === "all" ? "All departments" : `${s.audience.departments.length} dept(s)`}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}>Previous</Button>
              <span className="text-sm text-muted-foreground py-2">Page {pagination.page} of {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Detail ───────────────────────────────────────────────────────────────────

function SurveyDetail({ survey: s, onBack, onEdit, onResponses, onDelete }: {
  survey: Survey; onBack: () => void; onEdit: () => void; onResponses: () => void; onDelete: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onResponses}><BarChart3 className="w-3.5 h-3.5 mr-1" />Responses ({s.responsesCount})</Button>
          <Button variant="outline" size="sm" onClick={onEdit}><Edit3 className="w-3.5 h-3.5 mr-1" />Edit</Button>
          <Button variant="outline" size="sm" className="text-red-600" onClick={onDelete}><Trash2 className="w-3.5 h-3.5 mr-1" />Delete</Button>
        </div>
      </div>
      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div><h2 className="text-lg font-bold">{s.title}</h2>{s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}</div>
          <Badge variant={STATUS_COLORS[s.status] as "default" | "secondary" | "outline"}>{s.status}</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-muted-foreground block text-xs mb-1">Version</span>v{s.version}</div>
          <div><span className="text-muted-foreground block text-xs mb-1">Audience</span>{s.audience.type === "all" ? "All" : s.audience.departments.map((d) => d.name).join(", ")}</div>
          <div><span className="text-muted-foreground block text-xs mb-1">Anonymous</span>{s.settings.allowAnonymous ? "Yes" : "No"}</div>
          <div><span className="text-muted-foreground block text-xs mb-1">Closes</span>{s.settings.closesAt ? new Date(s.settings.closesAt).toLocaleDateString() : "Never"}</div>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-3">Fields ({s.fields.length})</h3>
          <div className="space-y-2">
            {s.fields.sort((a, b) => a.order - b.order).map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 border rounded-lg bg-secondary/30">
                <Badge variant="outline" className="text-[10px] shrink-0">{f.type}</Badge>
                <span className="text-sm font-medium">{f.label}</span>
                {f.required && <Badge variant="destructive" className="text-[10px]">Required</Badge>}
                {f.options.length > 0 && <span className="text-xs text-muted-foreground">{f.options.length} options</span>}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Responses ────────────────────────────────────────────────────────────────

function ResponsesView({ survey, onBack }: { survey: Survey; onBack: () => void }) {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"list" | "summary">("summary");
  const { data: respData, isLoading } = useSurveyResponses(survey._id, page);
  const { data: summary } = useSurveySummary(survey._id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
        <h1 className="text-lg font-bold">Responses — {survey.title}</h1>
      </div>
      <div className="flex gap-2">
        <Button variant={tab === "summary" ? "default" : "outline"} size="sm" onClick={() => setTab("summary")}><BarChart3 className="w-3.5 h-3.5 mr-1" />Summary</Button>
        <Button variant={tab === "list" ? "default" : "outline"} size="sm" onClick={() => setTab("list")}><Eye className="w-3.5 h-3.5 mr-1" />Individual</Button>
      </div>

      {tab === "summary" && summary && (
        <div className="space-y-4">
          <Card className="p-4"><p className="text-sm"><strong>{summary.totalResponses}</strong> total responses</p></Card>
          {summary.fields.map((f) => (
            <Card key={f.fieldId} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="text-[10px]">{f.type}</Badge>
                <h3 className="text-sm font-semibold">{f.label}</h3>
                <span className="text-xs text-muted-foreground">({f.totalAnswers} answers)</span>
              </div>
              {f.distribution && (
                <div className="space-y-1.5">
                  {Object.entries(f.distribution).sort((a, b) => b[1] - a[1]).map(([val, count]) => (
                    <div key={val} className="flex items-center gap-3">
                      <span className="text-sm w-32 truncate">{val}</span>
                      <div className="flex-1 bg-secondary rounded-full h-5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${(count / f.totalAnswers) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{count} ({Math.round((count / f.totalAnswers) * 100)}%)</span>
                    </div>
                  ))}
                </div>
              )}
              {f.average !== undefined && (
                <div className="flex gap-6 text-sm">
                  <span>Average: <strong>{f.average}</strong></span>
                  <span>Min: {f.min}</span><span>Max: {f.max}</span>
                </div>
              )}
              {f.sample && <div className="space-y-1">{(f.sample as string[]).map((s, i) => <p key={i} className="text-sm text-muted-foreground border-l-2 pl-3">{String(s)}</p>)}</div>}
            </Card>
          ))}
        </div>
      )}

      {tab === "list" && (
        <div className="space-y-3">
          {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div> :
            respData?.responses.map((r) => (
              <Card key={r._id} className="p-4">
                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  <span>{r.respondent ? r.respondent.name : "Anonymous"}</span>
                  <span>{new Date(r.submittedAt).toLocaleString()}</span>
                  <Badge variant="outline" className="text-[10px]">v{r.surveyVersion}</Badge>
                </div>
                <div className="space-y-2">
                  {r.answers.map((a) => {
                    const field = survey.fields.find((f) => f.id === a.fieldId);
                    return (
                      <div key={a.fieldId} className="text-sm">
                        <span className="font-medium">{field?.label || a.fieldId}: </span>
                        <span className="text-muted-foreground">{Array.isArray(a.value) ? a.value.join(", ") : String(a.value)}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          {respData && respData.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground py-2">Page {page} of {respData.pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= respData.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Builder ──────────────────────────────────────────────────────────────────

function SurveyBuilder({ initial, onSave, onCancel, isSaving }: {
  initial: Survey | null; onSave: (data: Record<string, unknown>, status: SurveyStatus) => Promise<void>; onCancel: () => void; isSaving: boolean;
}) {
  const { departments } = useDepartments();
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [fields, setFields] = useState<SurveyField[]>(initial?.fields || []);
  const [audienceType, setAudienceType] = useState<"all" | "departments">(initial?.audience?.type || "all");
  const [audienceDepts, setAudienceDepts] = useState<string[]>(initial?.audience?.departments?.map((d) => d._id) || []);
  const [allowAnonymous, setAllowAnonymous] = useState(initial?.settings?.allowAnonymous || false);
  const [oneResponse, setOneResponse] = useState(initial?.settings?.oneResponsePerUser ?? true);
  const [closesAt, setClosesAt] = useState(initial?.settings?.closesAt?.slice(0, 10) || "");
  const [editingField, setEditingField] = useState<string | null>(null);

  const addField = (type: SurveyFieldType) => {
    const newField: SurveyField = {
      id: uuidv4(), type, label: `New ${type} field`, placeholder: "",
      required: false, options: [], validation: {}, order: fields.length,
    };
    setFields((f) => [...f, newField]);
    setEditingField(newField.id);
  };

  const updateField = (id: string, updates: Partial<SurveyField>) => {
    setFields((f) => f.map((field) => field.id === id ? { ...field, ...updates } : field));
  };

  const removeField = (id: string) => {
    setFields((f) => f.filter((field) => field.id !== id));
    if (editingField === id) setEditingField(null);
  };

  const addOption = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    const opt: FieldOption = { id: uuidv4(), label: `Option ${field.options.length + 1}`, value: `option_${field.options.length + 1}` };
    updateField(fieldId, { options: [...field.options, opt] });
  };

  const updateOption = (fieldId: string, optId: string, updates: Partial<FieldOption>) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    updateField(fieldId, { options: field.options.map((o) => o.id === optId ? { ...o, ...updates } : o) });
  };

  const removeOption = (fieldId: string, optId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;
    updateField(fieldId, { options: field.options.filter((o) => o.id !== optId) });
  };

  const buildPayload = () => ({
    title, description, fields: fields.map((f, i) => ({ ...f, order: i })),
    audience: { type: audienceType, departments: audienceType === "departments" ? audienceDepts : [] },
    settings: { allowAnonymous, oneResponsePerUser: oneResponse, closesAt: closesAt || null },
  });

  const ef = fields.find((f) => f.id === editingField);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onCancel}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
        <h1 className="text-lg font-bold">{initial ? "Edit" : "New"} Survey</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Title *</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Employee satisfaction survey" /></div>
            <div><label className="text-sm font-medium mb-1 block">Description</label><textarea className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." /></div>
          </Card>

          {/* Field palette */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Add Field</h3>
            <div className="flex flex-wrap gap-2">
              {FIELD_TYPES.map((ft) => (
                <Button key={ft.type} variant="outline" size="sm" onClick={() => addField(ft.type)} className="text-xs">{ft.label}</Button>
              ))}
            </div>
          </Card>

          {/* Fields list */}
          <div className="space-y-2">
            {fields.length === 0 ? (
              <Card className="p-8 text-center"><p className="text-muted-foreground text-sm">Click a field type above to add your first question</p></Card>
            ) : fields.map((f) => (
              <Card key={f.id} className={`p-4 cursor-pointer transition-all ${editingField === f.id ? "border-primary shadow-md" : "hover:border-primary/30"}`} onClick={() => setEditingField(f.id)}>
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  <Badge variant="outline" className="text-[10px] shrink-0">{f.type}</Badge>
                  <span className="text-sm font-medium flex-1">{f.label}</span>
                  {f.required && <Badge variant="destructive" className="text-[10px]">Required</Badge>}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); removeField(f.id); }}><X className="w-3.5 h-3.5" /></Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Save buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
            <Button variant="outline" onClick={() => onSave(buildPayload(), "draft")} disabled={isSaving || !title || !fields.length}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}Save Draft
            </Button>
            <Button onClick={() => onSave(buildPayload(), "active")} disabled={isSaving || !title || !fields.length}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}Publish
            </Button>
          </div>
        </div>

        {/* Right panel: field properties + settings */}
        <div className="space-y-4">
          {ef ? (
            <Card className="p-4 space-y-3 sticky top-4">
              <h3 className="text-sm font-semibold flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5" />Field Properties</h3>
              <div><label className="text-xs font-medium mb-1 block">Label</label><Input value={ef.label} onChange={(e) => updateField(ef.id, { label: e.target.value })} /></div>
              <div><label className="text-xs font-medium mb-1 block">Placeholder</label><Input value={ef.placeholder} onChange={(e) => updateField(ef.id, { placeholder: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ef.required} onChange={(e) => updateField(ef.id, { required: e.target.checked })} />Required</label>
              {["select", "multi-select", "radio"].includes(ef.type) && (
                <div>
                  <div className="flex items-center justify-between mb-2"><label className="text-xs font-medium">Options</label><Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => addOption(ef.id)}><Plus className="w-3 h-3 mr-1" />Add</Button></div>
                  {ef.options.map((o) => (
                    <div key={o.id} className="flex gap-1.5 mb-1.5">
                      <Input className="h-7 text-xs" value={o.label} onChange={(e) => updateOption(ef.id, o.id, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_") })} />
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeOption(ef.id, o.id)}><X className="w-3 h-3" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-4 text-center text-sm text-muted-foreground">Select a field to edit its properties</Card>
          )}

          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" />Settings</h3>
            <div>
              <label className="text-xs font-medium mb-1 block">Audience</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm bg-background" value={audienceType} onChange={(e) => setAudienceType(e.target.value as "all" | "departments")}>
                <option value="all">All Departments</option><option value="departments">Specific Departments</option>
              </select>
            </div>
            {audienceType === "departments" && (
              <select multiple className="w-full border rounded-lg px-2 py-1.5 text-sm bg-background min-h-[80px]" value={audienceDepts} onChange={(e) => setAudienceDepts(Array.from(e.target.selectedOptions, (o) => o.value))}>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            )}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowAnonymous} onChange={(e) => setAllowAnonymous(e.target.checked)} />Allow anonymous</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={oneResponse} onChange={(e) => setOneResponse(e.target.checked)} />One response per user</label>
            <div><label className="text-xs font-medium mb-1 block">Closes at</label><Input type="date" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} /></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
