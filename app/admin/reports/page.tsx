"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  listTaskReports,
  createTaskReport,
  updateTaskReport,
  deleteTaskReport,
  type TaskReport,
  type TaskReportFilters,
  type PeriodType,
  type ReportStatus,
  type CreateTaskReportData,
} from "@/lib/api/reports.api";
import { listDepartments, type Department } from "@/lib/api/departments.api";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  Building2,
  ChevronLeft,
  Save,
  Send,
  Trash2,
  Edit3,
  Clock,
  User,
  FileText,
  Filter,
  X,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_TYPES: { value: PeriodType | ""; label: string }[] = [
  { value: "", label: "All Periods" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

const STATUS_OPTIONS: { value: ReportStatus | ""; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Drafts" },
  { value: "submitted", label: "Submitted" },
];

const PERIOD_BADGE_COLORS: Record<PeriodType, string> = {
  weekly: "bg-blue-50 text-blue-700 border-blue-200",
  monthly: "bg-violet-50 text-violet-700 border-violet-200",
  quarterly: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_BADGE: Record<ReportStatus, { cls: string; label: string }> = {
  draft: { cls: "bg-gray-100 text-gray-600 border-gray-200", label: "Draft" },
  submitted: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Submitted" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDefaultDates(periodType: PeriodType): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  const start = new Date(now);
  if (periodType === "weekly") start.setDate(start.getDate() - 7);
  else if (periodType === "monthly") start.setMonth(start.getMonth() - 1);
  else start.setMonth(start.getMonth() - 3);
  return { start: start.toISOString().slice(0, 10), end };
}

// ─── Report Card ──────────────────────────────────────────────────────────────

function ReportCard({ report, onClick }: { report: TaskReport; onClick: () => void }) {
  const snippet = report.content.replace(/<[^>]*>/g, "").slice(0, 120);
  return (
    <Card
      className="p-5 border cursor-pointer hover:shadow-md hover:border-teal-200 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-teal-700 transition-colors truncate">
            {report.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="outline" className={`text-[10px] py-0 ${PERIOD_BADGE_COLORS[report.periodType]}`}>
              {report.periodType}
            </Badge>
            <Badge variant="outline" className={`text-[10px] py-0 ${STATUS_BADGE[report.status].cls}`}>
              {STATUS_BADGE[report.status].label}
            </Badge>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {report.department?.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{snippet || "No content"}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(report.periodStart)} — {formatDate(report.periodEnd)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 justify-end">
            <User className="w-3 h-3" /> {report.author?.name}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ─── Report Detail ────────────────────────────────────────────────────────────

function ReportDetail({
  report,
  onBack,
  onEdit,
  onDelete,
  canModify,
}: {
  report: TaskReport;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canModify: boolean;
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground" onClick={onBack}>
        <ChevronLeft className="w-4 h-4" /> Back to reports
      </Button>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">{report.title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className={PERIOD_BADGE_COLORS[report.periodType]}>
                  {report.periodType}
                </Badge>
                <Badge variant="outline" className={STATUS_BADGE[report.status].cls}>
                  {STATUS_BADGE[report.status].label}
                </Badge>
              </div>
            </div>
            {canModify && (
              <div className="flex gap-1.5 shrink-0">
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={onEdit}>
                  <Edit3 className="w-3 h-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-xs text-red-600 hover:bg-red-50 hover:border-red-300" onClick={onDelete}>
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="w-3.5 h-3.5" /> <span className="font-medium text-foreground">{report.author?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" /> <span className="font-medium text-foreground">{report.department?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(report.periodStart)} — {formatDate(report.periodEnd)}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> Created {formatDate(report.createdAt)}
            </div>
          </div>

          <Separator />

          <div
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: report.content }}
          />
        </div>
      </Card>
    </div>
  );
}

// ─── Create / Edit Form ───────────────────────────────────────────────────────

function ReportForm({
  report,
  departments,
  userDeptId,
  onSave,
  onCancel,
}: {
  report?: TaskReport | null;
  departments: Department[];
  userDeptId?: string;
  onSave: (data: CreateTaskReportData) => Promise<void>;
  onCancel: () => void;
}) {
  const isEdit = !!report;
  const defaults = report
    ? {
        title: report.title,
        content: report.content,
        periodType: report.periodType,
        periodStart: report.periodStart.slice(0, 10),
        periodEnd: report.periodEnd.slice(0, 10),
        department: report.department._id,
      }
    : {
        title: "",
        content: "",
        periodType: "weekly" as PeriodType,
        periodStart: getDefaultDates("weekly").start,
        periodEnd: getDefaultDates("weekly").end,
        department: userDeptId || departments[0]?._id || "",
      };

  const [form, setForm] = useState(defaults);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePeriodTypeChange = (pt: PeriodType) => {
    const dates = getDefaultDates(pt);
    setForm((f) => ({ ...f, periodType: pt, periodStart: dates.start, periodEnd: dates.end }));
  };

  const submit = async (status: ReportStatus) => {
    if (!form.title.trim() || !form.content.trim() || !form.department) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSave({ ...form, status });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save report");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground" onClick={onCancel}>
        <ChevronLeft className="w-4 h-4" /> Cancel
      </Button>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />
        <div className="px-6 py-4 border-b bg-secondary/30 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{isEdit ? "Edit Report" : "New Task Report"}</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Marketing Weekly Report — Week 22"
              autoFocus
            />
          </div>

          {/* Period Type + Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Period Type</label>
              <select
                value={form.periodType}
                onChange={(e) => handlePeriodTypeChange(e.target.value as PeriodType)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start Date</label>
              <Input type="date" value={form.periodStart} onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">End Date</label>
              <Input type="date" value={form.periodEnd} onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))} />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</label>
            <select
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Report Content</label>
            <div className="border border-input rounded-lg overflow-hidden">
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                placeholder="Write your task report here..."
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" variant="outline" className="gap-1.5" disabled={isSaving} onClick={() => submit("draft")}>
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save as Draft
            </Button>
            <Button size="sm" className="gap-1.5" disabled={isSaving || !form.title.trim() || !form.content.trim()} onClick={() => submit("submitted")}>
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit Report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type View = "list" | "detail" | "create" | "edit";

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("list");
  const [reports, setReports] = useState<TaskReport[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<TaskReport | null>(null);

  // Filters
  const [filterPeriod, setFilterPeriod] = useState<PeriodType | "">("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "">("");

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters: TaskReportFilters = { page, limit: 15 };
      if (filterPeriod) filters.periodType = filterPeriod;
      if (filterDept) filters.department = filterDept;
      if (filterStatus) filters.status = filterStatus;

      const [data, depts] = await Promise.all([
        listTaskReports(filters),
        departments.length ? Promise.resolve(departments) : listDepartments({ isActive: true }),
      ]);
      setReports(data.reports);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
      if (!departments.length) setDepartments(depts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, [page, filterPeriod, filterDept, filterStatus, departments.length]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleCreate = async (data: CreateTaskReportData) => {
    await createTaskReport(data);
    setView("list");
    setPage(1);
    loadReports();
  };

  const handleUpdate = async (data: CreateTaskReportData) => {
    if (!selectedReport) return;
    const updated = await updateTaskReport(selectedReport._id, data);
    setSelectedReport(updated);
    setView("detail");
    loadReports();
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    if (!confirm("Delete this report? This cannot be undone.")) return;
    await deleteTaskReport(selectedReport._id);
    setSelectedReport(null);
    setView("list");
    loadReports();
  };

  const canModify = (report: TaskReport) =>
    user?.id === report.author?._id || user?.isSuperAdmin;

  const hasFilters = filterPeriod || filterDept || filterStatus;

  // ── Detail View ──
  if (view === "detail" && selectedReport) {
    return (
      <ReportDetail
        report={selectedReport}
        onBack={() => { setSelectedReport(null); setView("list"); }}
        onEdit={() => setView("edit")}
        onDelete={handleDelete}
        canModify={canModify(selectedReport)}
      />
    );
  }

  // ── Create / Edit View ──
  if (view === "create" || (view === "edit" && selectedReport)) {
    return (
      <ReportForm
        report={view === "edit" ? selectedReport : null}
        departments={departments}
        onSave={view === "edit" ? handleUpdate : handleCreate}
        onCancel={() => { setView(selectedReport ? "detail" : "list"); }}
      />
    );
  }

  // ── List View ──

  const draftCount = reports.filter((r) => r.status === "draft").length;
  const submittedCount = reports.filter((r) => r.status === "submitted").length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-50">
              <BarChart3 className="w-5 h-5 text-teal-600" />
            </div>
            Task Reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Department task reports — weekly, monthly, and quarterly
          </p>
        </div>
        <Button className="gap-1.5 shadow-sm" onClick={() => { setSelectedReport(null); setView("create"); }}>
          <Plus className="w-4 h-4" /> New Report
        </Button>
      </div>

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="px-4 py-3 border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground leading-none">{total}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total Reports</p>
          </div>
        </Card>
        <Card className="px-4 py-3 border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <Edit3 className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground leading-none">{draftCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Drafts</p>
          </div>
        </Card>
        <Card className="px-4 py-3 border flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50">
            <Send className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground leading-none">{submittedCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Submitted</p>
          </div>
        </Card>
      </div>

      {/* ── Filters ── */}
      <Card className="border shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          {/* Period tabs */}
          <div className="flex items-center gap-0.5 p-0.5 bg-secondary rounded-lg">
            {PERIOD_TYPES.map((p) => (
              <button
                key={p.value}
                onClick={() => { setFilterPeriod(p.value as PeriodType | ""); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterPeriod === p.value
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-red-600"
              onClick={() => { setFilterPeriod(""); setFilterDept(""); setFilterStatus(""); setPage(1); }}
            >
              <X className="w-3 h-3" /> Clear filters
            </Button>
          )}

          {/* Right-aligned: Department + Status */}
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filterDept}
                onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
                className="h-8 rounded-lg border border-input bg-background pl-8 pr-6 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer appearance-none"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as ReportStatus | ""); setPage(1); }}
                className="h-8 rounded-lg border border-input bg-background pl-8 pr-6 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer appearance-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          <Button variant="outline" size="sm" className="ml-auto" onClick={loadReports}>Retry</Button>
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[88px] rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card className="py-16 text-center border">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-semibold text-foreground">No reports found</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
            {hasFilters ? "Try adjusting your filters to find reports." : "Create your first task report to get started."}
          </p>
          {!hasFilters && (
            <Button size="sm" className="mt-5 gap-1.5" onClick={() => setView("create")}>
              <Plus className="w-4 h-4" /> Create Report
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Report list */}
          <div className="space-y-2.5">
            {reports.map((r) => (
              <ReportCard key={r._id} report={r} onClick={() => { setSelectedReport(r); setView("detail"); }} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" className="text-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Previous
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                Page <span className="font-medium text-foreground">{page}</span> of{" "}
                <span className="font-medium text-foreground">{totalPages}</span>
              </span>
              <Button variant="outline" size="sm" className="text-xs" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
