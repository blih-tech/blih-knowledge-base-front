import { apiAxios } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReportPeriod = "week" | "month" | "quarter" | "year" | "custom";

export interface ReportParams {
  period: ReportPeriod;
  from?: string;
  to?: string;
  departmentId?: string;
}

export interface SummaryReport {
  period: { start: string; end: string; label: string };
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  newEmployees: number;
  totalClients: number;
  activeClients: number;
  newClients: number;
  totalDocuments: number;
  newDocuments: number;
  totalObservations: number;
  newObservations: number;
  totalFaqs: number;
  newFaqs: number;
  totalDepartments: number;
}

export interface TimelinePoint {
  date: string;
  count: number;
}

export interface EmployeeReport {
  period: { start: string; end: string };
  roleDistribution: { role: string; count: number }[];
  departmentBreakdown: {
    departmentId: string | null;
    departmentName: string;
    total: number;
    admins: number;
    users: number;
  }[];
  newHiresTimeline: TimelinePoint[];
  statusDistribution: { active: number; inactive: number };
}

export interface ClientReport {
  period: { start: string; end: string };
  statusDistribution: { status: string; count: number }[];
  tierDistribution: { tier: string; count: number }[];
  newClientsTimeline: TimelinePoint[];
  industryBreakdown: { industry: string; count: number }[];
  assignmentsPerDept: {
    departmentName: string;
    totalAssignments: number;
    employeesWithClients: number;
  }[];
}

export interface ContentReport {
  period: { start: string; end: string };
  docsTimeline: { date: string; created: number }[];
  docsUpdated: number;
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    total: number;
    newInPeriod: number;
  }[];
  totalFaqs: number;
  newFaqs: number;
}

export interface ObservationReport {
  period: { start: string; end: string };
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  typeDistribution: { type: string; count: number }[];
  timeline: TimelinePoint[];
  topContributors: {
    authorId: string;
    authorName: string;
    count: number;
  }[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const getSummaryReport = (params: ReportParams): Promise<SummaryReport> =>
  apiAxios.get("/reports/summary", { params }).then((r) => r.data.data);

export const getEmployeeReport = (params: ReportParams): Promise<EmployeeReport> =>
  apiAxios.get("/reports/employees", { params }).then((r) => r.data.data);

export const getClientReport = (params: ReportParams): Promise<ClientReport> =>
  apiAxios.get("/reports/clients", { params }).then((r) => r.data.data);

export const getContentReport = (params: ReportParams): Promise<ContentReport> =>
  apiAxios.get("/reports/content", { params }).then((r) => r.data.data);

export const getObservationReport = (params: ReportParams): Promise<ObservationReport> =>
  apiAxios.get("/reports/observations", { params }).then((r) => r.data.data);
