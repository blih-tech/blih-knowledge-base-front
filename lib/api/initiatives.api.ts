import { apiAxios } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InitiativeStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed";

export interface InitiativeAuthor {
  _id: string;
  name: string;
  email: string;
  position?: string;
}

export interface InitiativeDepartment {
  _id: string;
  name: string;
}

export interface Initiative {
  _id: string;
  title: string;
  problem: string;
  whyItMatters: string;
  proposedSolution: string;
  executionPlan: string;
  expectedOutcome: string;
  supportNeeded: InitiativeDepartment[];
  status: InitiativeStatus;
  department: InitiativeDepartment;
  author: InitiativeAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface InitiativeListResponse {
  initiatives: Initiative[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InitiativeFilters {
  page?: number;
  limit?: number;
  status?: InitiativeStatus;
  department?: string;
  author?: string;
  sortBy?: string;
  sortOrder?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateInitiativeData {
  title: string;
  problem: string;
  whyItMatters?: string;
  proposedSolution: string;
  executionPlan?: string;
  expectedOutcome?: string;
  supportNeeded?: string[];
  department: string;
  status?: InitiativeStatus;
}

export interface UpdateInitiativeData {
  title?: string;
  problem?: string;
  whyItMatters?: string;
  proposedSolution?: string;
  executionPlan?: string;
  expectedOutcome?: string;
  supportNeeded?: string[];
  department?: string;
  status?: InitiativeStatus;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function listInitiatives(
  filters: InitiativeFilters = {},
): Promise<InitiativeListResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "") params.append(k, String(v));
  });
  const { data } = await apiAxios.get(`/initiatives?${params}`);
  return data.data;
}

export async function getInitiative(id: string): Promise<Initiative> {
  const { data } = await apiAxios.get(`/initiatives/${id}`);
  return data.data;
}

export async function createInitiative(
  payload: CreateInitiativeData,
): Promise<Initiative> {
  const { data } = await apiAxios.post("/initiatives", payload);
  return data.data;
}

export async function updateInitiative(
  id: string,
  payload: UpdateInitiativeData,
): Promise<Initiative> {
  const { data } = await apiAxios.put(`/initiatives/${id}`, payload);
  return data.data;
}

export async function updateInitiativeStatus(
  id: string,
  status: InitiativeStatus,
): Promise<Initiative> {
  const { data } = await apiAxios.patch(`/initiatives/${id}/status`, { status });
  return data.data;
}

export async function deleteInitiative(id: string): Promise<void> {
  await apiAxios.delete(`/initiatives/${id}`);
}
