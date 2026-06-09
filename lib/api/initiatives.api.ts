import { apiAxios } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InitiativeStatus =
  | "draft"
  | "submitted";

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

export interface InitiativeRating {
  user: { _id: string; name: string };
  value: number;
  createdAt: string;
}

export interface InitiativeComment {
  _id: string;
  user: { _id: string; name: string; email: string };
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitiativeReaction {
  user: { _id: string; name: string };
  emoji: string;
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
  ratings: InitiativeRating[];
  comments: InitiativeComment[];
  reactions: InitiativeReaction[];
  averageRating: number;
  ratingsCount: number;
  commentsCount: number;
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

// ─── CRUD ─────────────────────────────────────────────────────────────────────

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

export async function deleteInitiative(id: string): Promise<void> {
  await apiAxios.delete(`/initiatives/${id}`);
}

// ─── Interactions ─────────────────────────────────────────────────────────────

export async function rateInitiative(id: string, value: number): Promise<Initiative> {
  const { data } = await apiAxios.post(`/initiatives/${id}/ratings`, { value });
  return data.data;
}

export async function commentOnInitiative(id: string, text: string): Promise<Initiative> {
  const { data } = await apiAxios.post(`/initiatives/${id}/comments`, { text });
  return data.data;
}

export async function deleteInitiativeComment(id: string, commentId: string): Promise<Initiative> {
  const { data } = await apiAxios.delete(`/initiatives/${id}/comments/${commentId}`);
  return data.data;
}

export async function toggleInitiativeReaction(id: string, emoji: string): Promise<Initiative> {
  const { data } = await apiAxios.post(`/initiatives/${id}/reactions`, { emoji });
  return data.data;
}
