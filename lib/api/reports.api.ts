import { apiAxios } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PeriodType = "daily" | "weekly" | "monthly" | "quarterly";
export type ReportStatus = "draft" | "submitted";

export interface TaskReportAuthor {
  _id: string;
  name: string;
  email: string;
  position?: string;
}

export interface TaskReportDepartment {
  _id: string;
  name: string;
}

export interface TaskReportAttachment {
  publicId: string;
  url: string;
  originalFilename: string;
  format: string;
  bytes: number;
}

export interface TaskReport {
  _id: string;
  title: string;
  content: string;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  department: TaskReportDepartment;
  author: TaskReportAuthor;
  status: ReportStatus;
  nextPlan: string;
  attachments: TaskReportAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskReportListResponse {
  reports: TaskReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskReportFilters {
  page?: number;
  limit?: number;
  periodType?: PeriodType;
  department?: string;
  author?: string;
  status?: ReportStatus;
  sortBy?: "createdAt" | "periodStart" | "title";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateTaskReportData {
  title: string;
  content: string;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  department: string;
  status?: ReportStatus;
  nextPlan?: string;
}

export interface UpdateTaskReportData {
  title?: string;
  content?: string;
  periodType?: PeriodType;
  periodStart?: string;
  periodEnd?: string;
  department?: string;
  status?: ReportStatus;
  nextPlan?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const listTaskReports = (
  filters?: TaskReportFilters
): Promise<TaskReportListResponse> =>
  apiAxios
    .get("/reports/task-reports", { params: filters })
    .then((r) => r.data.data);

export const getTaskReport = (id: string): Promise<TaskReport> =>
  apiAxios.get(`/reports/task-reports/${id}`).then((r) => r.data.data);

export const createTaskReport = (
  data: CreateTaskReportData
): Promise<TaskReport> =>
  apiAxios.post("/reports/task-reports", data).then((r) => r.data.data);

export const updateTaskReport = (
  id: string,
  data: UpdateTaskReportData
): Promise<TaskReport> =>
  apiAxios.put(`/reports/task-reports/${id}`, data).then((r) => r.data.data);

export const deleteTaskReport = (id: string): Promise<void> =>
  apiAxios.delete(`/reports/task-reports/${id}`).then(() => undefined);

// ─── Public (any authenticated user) ─────────────────────────────────────────

export const listPublicTaskReports = (
  filters?: Pick<TaskReportFilters, "page" | "limit" | "periodType" | "department" | "sortBy" | "sortOrder">
): Promise<TaskReportListResponse> =>
  apiAxios
    .get("/reports/task-reports/public", { params: filters })
    .then((r) => r.data.data);
