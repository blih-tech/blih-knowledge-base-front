import { apiAxios } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ObservationType = "like" | "dislike" | "preference" | "behavior" | "communication" | "general";
export type SentimentType = "positive" | "negative" | "neutral";

export interface Client {
  _id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  tags: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface Observation {
  _id: string;
  clientId: string;
  type: ObservationType;
  content: string;
  tags: string[];
  sentiment: SentimentType;
  authorId: string;
  authorName: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientListResult {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ClientDetail {
  client: Client;
  typeCounts: Record<ObservationType, number>;
}

// ─── Client CRUD ──────────────────────────────────────────────────────────────

export const listClients = (params?: {
  search?: string;
  tag?: string;
  industry?: string;
  page?: number;
  limit?: number;
}): Promise<ClientListResult> =>
  apiAxios.get("/clients", { params }).then((r) => r.data.data);

export const getClient = (id: string): Promise<ClientDetail> =>
  apiAxios.get(`/clients/${id}`).then((r) => r.data.data);

export const createClient = (data: Partial<Client>): Promise<Client> =>
  apiAxios.post("/clients", data).then((r) => r.data.data);

export const updateClient = (id: string, data: Partial<Client>): Promise<Client> =>
  apiAxios.put(`/clients/${id}`, data).then((r) => r.data.data);

export const deleteClient = (id: string) => apiAxios.delete(`/clients/${id}`);

// ─── Observations CRUD ────────────────────────────────────────────────────────

export const listObservations = (clientId: string, type?: string): Promise<Observation[]> =>
  apiAxios.get(`/clients/${clientId}/observations`, { params: type ? { type } : {} }).then((r) => r.data.data);

export const createObservation = (
  clientId: string,
  data: { type: ObservationType; content: string; tags?: string[]; sentiment?: SentimentType; isPrivate?: boolean }
): Promise<Observation> =>
  apiAxios.post(`/clients/${clientId}/observations`, data).then((r) => r.data.data);

export const updateObservation = (
  clientId: string,
  obsId: string,
  data: Partial<{ type: ObservationType; content: string; tags: string[]; sentiment: SentimentType; isPrivate: boolean }>
): Promise<Observation> =>
  apiAxios.put(`/clients/${clientId}/observations/${obsId}`, data).then((r) => r.data.data);

export const deleteObservation = (clientId: string, obsId: string) =>
  apiAxios.delete(`/clients/${clientId}/observations/${obsId}`);
