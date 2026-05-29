"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSummaryReport,
  getEmployeeReport,
  getClientReport,
  getContentReport,
  getObservationReport,
  type ReportPeriod,
  type SummaryReport,
  type EmployeeReport,
  type ClientReport,
  type ContentReport,
  type ObservationReport,
} from "@/lib/api/reports.api";
import { listDepartments, type Department } from "@/lib/api/departments.api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Loader2,
  Download,
  Calendar,
  Building2,
  AlertCircle,
  Eye,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  prospect: "#6366f1",
  "at-risk": "#f59e0b",
  paused: "#94a3b8",
  churned: "#ef4444",
};

const SENTIMENT_COLORS = {
  positive: "#10b981",
  neutral: "#6366f1",
  negative: "#ef4444",
};

const DEPT_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  delta: number;
  deltaLabel: string;
  icon: React.ElementType;
  color: string;
}) {
  const isPositive = delta >= 0;
  return (
    <Card className="p-5 border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          <div className="flex items-center gap-1 mt-1.5">
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                isPositive ? "text-emerald-600" : "text-red-600"
              }`}
            >
              +{delta} {deltaLabel}
            </span>
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

// ─── Chart wrapper ────────────────────────────────────────────────────────────

function ChartCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`p-5 border shadow-sm ${className}`}>
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </Card>
  );
}

// ─── CSV Export ────────────────────────────────────────────────────────────────

function exportCSV(summary: SummaryReport, period: ReportPeriod) {
  const rows = [
    ["Metric", "Value"],
    ["Period", period],
    ["Date Range", `${summary.period.start} — ${summary.period.end}`],
    ["Total Employees", String(summary.totalEmployees)],
    ["Active Employees", String(summary.activeEmployees)],
    ["New Employees (period)", String(summary.newEmployees)],
    ["Total Clients", String(summary.totalClients)],
    ["Active Clients", String(summary.activeClients)],
    ["New Clients (period)", String(summary.newClients)],
    ["Total Documents", String(summary.totalDocuments)],
    ["New Documents (period)", String(summary.newDocuments)],
    ["Total Observations", String(summary.totalObservations)],
    ["New Observations (period)", String(summary.newObservations)],
    ["Total FAQs", String(summary.totalFaqs)],
    ["New FAQs (period)", String(summary.newFaqs)],
    ["Total Departments", String(summary.totalDepartments)],
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Report data
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [empReport, setEmpReport] = useState<EmployeeReport | null>(null);
  const [clientReport, setClientReport] = useState<ClientReport | null>(null);
  const [contentReport, setContentReport] = useState<ContentReport | null>(null);
  const [obsReport, setObsReport] = useState<ObservationReport | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const params = { period, departmentId: departmentId || undefined };
    try {
      const [sum, emp, cli, con, obs, depts] = await Promise.all([
        getSummaryReport(params),
        getEmployeeReport(params),
        getClientReport(params),
        getContentReport(params),
        getObservationReport(params),
        listDepartments({ isActive: true }),
      ]);
      setSummary(sum);
      setEmpReport(emp);
      setClientReport(cli);
      setContentReport(con);
      setObsReport(obs);
      setDepartments(depts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, [period, departmentId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Reports & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organizational performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {summary && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => exportCSV(summary, period)}
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 flex items-center gap-3 flex-wrap border shadow-sm">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Period:</span>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "ghost"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="w-px h-6 bg-border hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="h-7 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                label="Total Employees"
                value={summary.activeEmployees}
                delta={summary.newEmployees}
                deltaLabel="new"
                icon={Users}
                color="bg-indigo-50 text-indigo-700"
              />
              <KPICard
                label="Active Clients"
                value={summary.activeClients}
                delta={summary.newClients}
                deltaLabel="new"
                icon={Briefcase}
                color="bg-emerald-50 text-emerald-700"
              />
              <KPICard
                label="Documents"
                value={summary.totalDocuments}
                delta={summary.newDocuments}
                deltaLabel="created"
                icon={FileText}
                color="bg-violet-50 text-violet-700"
              />
              <KPICard
                label="Observations"
                value={summary.totalObservations}
                delta={summary.newObservations}
                deltaLabel="logged"
                icon={Eye}
                color="bg-amber-50 text-amber-700"
              />
            </div>
          )}

          {/* Secondary stats row */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-3 text-center border">
                <p className="text-2xl font-bold text-foreground">{summary.totalDepartments}</p>
                <p className="text-xs text-muted-foreground">Departments</p>
              </Card>
              <Card className="p-3 text-center border">
                <p className="text-2xl font-bold text-foreground">{summary.inactiveEmployees}</p>
                <p className="text-xs text-muted-foreground">Inactive Employees</p>
              </Card>
              <Card className="p-3 text-center border">
                <p className="text-2xl font-bold text-foreground">{summary.totalFaqs}</p>
                <p className="text-xs text-muted-foreground">Total FAQs</p>
              </Card>
              <Card className="p-3 text-center border">
                <p className="text-2xl font-bold text-foreground">{summary.newFaqs}</p>
                <p className="text-xs text-muted-foreground">New FAQs</p>
              </Card>
            </div>
          )}

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Department Employee Distribution */}
            {empReport && empReport.departmentBreakdown.length > 0 && (
              <ChartCard title="Employees by Department">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={empReport.departmentBreakdown}
                    layout="vertical"
                    margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" fontSize={11} />
                    <YAxis
                      dataKey="departmentName"
                      type="category"
                      width={100}
                      fontSize={11}
                      tick={{ fill: "#6b7280" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="admins" stackId="a" fill="#6366f1" name="Admins" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="users" stackId="a" fill="#a5b4fc" name="Users" radius={[0, 4, 4, 0]} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Client Status Distribution */}
            {clientReport && clientReport.statusDistribution.length > 0 && (
              <ChartCard title="Client Status Distribution">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={clientReport.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="status"
                      label={({ status, count }) => `${status}: ${count}`}
                      labelLine={false}
                      style={{ fontSize: 11 }}
                    >
                      {clientReport.statusDistribution.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={STATUS_COLORS[entry.status] || DEPT_COLORS[idx % DEPT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Observation Sentiment */}
            {obsReport && (
              <ChartCard title="Observation Sentiment">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Positive", value: obsReport.sentimentDistribution.positive },
                        { name: "Neutral", value: obsReport.sentimentDistribution.neutral },
                        { name: "Negative", value: obsReport.sentimentDistribution.negative },
                      ].filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                      style={{ fontSize: 11 }}
                    >
                      <Cell fill={SENTIMENT_COLORS.positive} />
                      <Cell fill={SENTIMENT_COLORS.neutral} />
                      <Cell fill={SENTIMENT_COLORS.negative} />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Activity Timeline */}
            {obsReport && obsReport.timeline.length > 0 && (
              <ChartCard title="Observation Activity">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={obsReport.timeline}
                    margin={{ left: 5, right: 20, top: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      fontSize={10}
                      tick={{ fill: "#6b7280" }}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis fontSize={11} tick={{ fill: "#6b7280" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ fill: "#6366f1", r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Observations"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          {/* Content breakdown */}
          {contentReport && contentReport.categoryBreakdown.length > 0 && (
            <ChartCard title="Documents by Category">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={contentReport.categoryBreakdown}
                  margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="categoryName"
                    fontSize={10}
                    tick={{ fill: "#6b7280" }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={11} tick={{ fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="total" fill="#8b5cf6" name="Total Docs" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="newInPeriod" fill="#06b6d4" name="New in Period" radius={[4, 4, 0, 0]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Top Contributors */}
          {obsReport && obsReport.topContributors.length > 0 && (
            <ChartCard title="Top Contributors (Observations)">
              <ResponsiveContainer width="100%" height={Math.max(200, obsReport.topContributors.length * 40)}>
                <BarChart
                  data={obsReport.topContributors}
                  layout="vertical"
                  margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis
                    dataKey="authorName"
                    type="category"
                    width={120}
                    fontSize={11}
                    tick={{ fill: "#6b7280" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" name="Observations" radius={[0, 4, 4, 0]}>
                    {obsReport.topContributors.map((_, idx) => (
                      <Cell key={idx} fill={DEPT_COLORS[idx % DEPT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Department Comparison Table */}
          {empReport && empReport.departmentBreakdown.length > 0 && (
            <Card className="p-5 border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Department Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Department
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Total
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Admins
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Users
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {empReport.departmentBreakdown.map((dept, idx) => (
                      <tr
                        key={dept.departmentId || idx}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: DEPT_COLORS[idx % DEPT_COLORS.length],
                            }}
                          />
                          {dept.departmentName}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Badge variant="secondary" className="text-xs">
                            {dept.total}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right text-indigo-600 font-medium">
                          {dept.admins}
                        </td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">
                          {dept.users}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Industry breakdown */}
          {clientReport && clientReport.industryBreakdown.length > 0 && (
            <Card className="p-5 border shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Clients by Industry
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {clientReport.industryBreakdown.map((ind, idx) => (
                  <div
                    key={ind.industry}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 bg-secondary/20"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: DEPT_COLORS[idx % DEPT_COLORS.length],
                      }}
                    />
                    <span className="text-xs font-medium truncate">{ind.industry}</span>
                    <Badge variant="secondary" className="ml-auto text-xs shrink-0">
                      {ind.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
