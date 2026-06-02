import { apiAxios } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PeriodType = "weekly" | "monthly" | "quarterly";
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
}

export interface CreateTaskReportData {
  title: string;
  content: string;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  department: string;
  status?: ReportStatus;
}

export interface UpdateTaskReportData {
  title?: string;
  content?: string;
  periodType?: PeriodType;
  periodStart?: string;
  periodEnd?: string;
  department?: string;
  status?: ReportStatus;
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
