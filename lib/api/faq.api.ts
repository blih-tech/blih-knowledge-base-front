import { serverFetch, apiAxios } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Public ───────────────────────────────────────────────────────────────────

export const getAllFaqs = (): Promise<Faq[]> =>
  serverFetch<Faq[]>("/faqs");

// ─── Admin (authenticated) ────────────────────────────────────────────────────

const unwrap = <T>(res: { data: { data: T } }) => res.data.data;

export const adminGetAllFaqs = (): Promise<Faq[]> =>
  apiAxios.get("/faqs").then((res) => res.data.data as Faq[]);

export const adminCreateFaq = (data: { question: string; answer: string; order?: number }) =>
  apiAxios.post("/faqs", data).then(unwrap<Faq>);

export const adminUpdateFaq = (id: string, data: { question?: string; answer?: string; order?: number }) =>
  apiAxios.put(`/faqs/${id}`, data).then(unwrap<Faq>);

export const adminDeleteFaq = (id: string) =>
  apiAxios.delete(`/faqs/${id}`);
