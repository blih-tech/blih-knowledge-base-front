import { apiAxios } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SurveyFieldType = 'text' | 'textarea' | 'number' | 'select' | 'multi-select' | 'radio' | 'checkbox' | 'date' | 'rating';
export type SurveyStatus = 'draft' | 'active' | 'closed';

export interface FieldOption { id: string; label: string; value: string; }

export interface SurveyField {
  id: string; type: SurveyFieldType; label: string; placeholder: string;
  required: boolean; options: FieldOption[];
  validation: { min?: number; max?: number; pattern?: string }; order: number;
}

export interface Survey {
  _id: string; title: string; description: string; version: number;
  fields: SurveyField[];
  author: { _id: string; name: string; email: string };
  status: SurveyStatus;
  audience: { type: 'all' | 'departments'; departments: { _id: string; name: string }[] };
  settings: { allowAnonymous: boolean; oneResponsePerUser: boolean; closesAt: string | null };
  publishedAt: string | null; responsesCount: number;
  createdAt: string; updatedAt: string;
}

export interface SurveyListResponse {
  surveys: Survey[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface SurveyResponse {
  _id: string; survey: string; surveyVersion: number;
  respondent: { _id: string; name: string; email: string } | null;
  answers: { fieldId: string; value: unknown }[];
  submittedAt: string;
}

export interface SurveyResponseListResponse {
  responses: SurveyResponse[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface FieldSummary {
  fieldId: string; label: string; type: SurveyFieldType; totalAnswers: number;
  distribution?: Record<string, number>;
  average?: number; min?: number; max?: number;
  sample?: unknown[];
}

export interface SurveySummary { surveyId: string; totalResponses: number; fields: FieldSummary[]; }

export interface SurveyFilters { page?: number; limit?: number; status?: SurveyStatus; sortBy?: string; sortOrder?: string; }

// ─── API ──────────────────────────────────────────────────────────────────────

const unwrap = (res: any) => res.data.data;

// Admin
export const listSurveys = (f: SurveyFilters = {}): Promise<SurveyListResponse> => apiAxios.get("/surveys", { params: f }).then(unwrap);
export const getSurvey = (id: string): Promise<Survey> => apiAxios.get(`/surveys/${id}`).then(unwrap);
export const createSurvey = (data: object): Promise<Survey> => apiAxios.post("/surveys", data).then(unwrap);
export const updateSurvey = (id: string, data: object): Promise<Survey> => apiAxios.put(`/surveys/${id}`, data).then(unwrap);
export const deleteSurvey = (id: string): Promise<void> => apiAxios.delete(`/surveys/${id}`).then(() => undefined);
export const getSurveyResponses = (id: string, page = 1, limit = 20): Promise<SurveyResponseListResponse> => apiAxios.get(`/surveys/${id}/responses`, { params: { page, limit } }).then(unwrap);
export const getSurveySummary = (id: string): Promise<SurveySummary> => apiAxios.get(`/surveys/${id}/summary`).then(unwrap);

// Public
export const listPublicSurveys = (page = 1, limit = 20): Promise<SurveyListResponse> => apiAxios.get("/surveys/public", { params: { page, limit } }).then(unwrap);
export const getPublicSurvey = (id: string): Promise<Survey> => apiAxios.get(`/surveys/public/${id}`).then(unwrap);
export const submitSurveyResponse = (id: string, answers: { fieldId: string; value: unknown }[]): Promise<SurveyResponse> => apiAxios.post(`/surveys/public/${id}/respond`, { answers }).then(unwrap);
