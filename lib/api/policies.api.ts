import { apiAxios } from "./client";

// ─── Constants ───────────────────────────────────────────────────────────────

export const POLICY_TYPES = [
  'terms-and-conditions',
  'privacy-policy',
  'code-of-conduct',
  'nda',
  'it-security',
  'acceptable-use',
  'data-protection',
  'other',
] as const;

export type PolicyType = (typeof POLICY_TYPES)[number];

export const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  'terms-and-conditions': 'Terms & Conditions',
  'privacy-policy': 'Privacy Policy',
  'code-of-conduct': 'Code of Conduct',
  'nda': 'Non-Disclosure Agreement',
  'it-security': 'IT Security Policy',
  'acceptable-use': 'Acceptable Use Policy',
  'data-protection': 'Data Protection Policy',
  'other': 'Other',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRef {
  _id: string;
  name: string;
  email: string;
}

export interface PolicySummary {
  _id: string;
  policyType: PolicyType;
  title: string;
  slug: string;
  version: number;
  status: "draft" | "active" | "archived";
  isRequired: boolean;
  publishedAt: string | null;
  createdBy: UserRef | null;
  updatedBy: UserRef | null;
  createdAt: string;
  updatedAt: string;
  acceptanceCount: number;
}

export interface PolicyDetail extends PolicySummary {
  contentHtml: string;
  contentJson: object;
  contentText: string;
}

export interface ActivePolicy {
  _id: string;
  policyType: PolicyType;
  title: string;
  slug: string;
  version: number;
  isRequired: boolean;
  publishedAt: string | null;
  contentHtml: string;
  contentJson: object;
  contentText: string;
  isAccepted: boolean;
  acceptedAt: string | null;
}

export interface PolicyAcceptanceRecord {
  _id: string;
  policy: string;
  user: UserRef & { position?: string };
  policyVersion: number;
  acceptedAt: string;
  ipAddress: string;
}

export interface PolicyVersion {
  _id: string;
  version: number;
  versionLabel?: string;
  title: string;
  changedBy: UserRef | null;
  changedAt: string;
  changeNote?: string;
}

export interface PolicyVersionDetail extends PolicyVersion {
  contentHtml: string;
  contentJson: object;
  contentText?: string;
}

export interface ComplianceReport {
  policies: {
    _id: string;
    title: string;
    version: number;
    acceptedCount: number;
    pendingCount: number;
  }[];
  totalEmployees: number;
  fullyCompliant: number;
  nonCompliant: (UserRef & { position?: string; department?: { name: string } })[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PolicyFilters {
  page?: number;
  limit?: number;
  status?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unwrap = <T = any>(res: { data: { data: T } }): T => res.data.data;

// ─── Public / Employee-facing ─────────────────────────────────────────────────

export const listActivePolicies = (): Promise<ActivePolicy[]> =>
  apiAxios.get("/policies/public").then(unwrap);

export const acceptPolicy = (id: string) =>
  apiAxios.post(`/policies/public/${id}/accept`).then(unwrap);

// ─── Admin ────────────────────────────────────────────────────────────────────

export const listPolicies = (
  filters: PolicyFilters = {}
): Promise<{ policies: PolicySummary[]; pagination: Pagination }> => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  return apiAxios.get(`/policies?${params}`).then(unwrap);
};

export const getPolicy = (id: string): Promise<PolicyDetail> =>
  apiAxios.get(`/policies/${id}`).then(unwrap);

export const getPolicyByType = (policyType: PolicyType): Promise<PolicyDetail> =>
  apiAxios.get(`/policies/type/${policyType}`).then(unwrap);

export const createPolicy = (data: object): Promise<PolicyDetail> =>
  apiAxios.post("/policies", data).then(unwrap);

export const updatePolicy = (id: string, data: object): Promise<PolicyDetail> =>
  apiAxios.put(`/policies/${id}`, data).then(unwrap);

export const deletePolicy = (id: string) =>
  apiAxios.delete(`/policies/${id}`);

export const hardDeletePolicy = (id: string) =>
  apiAxios.delete(`/policies/${id}/permanent`);

// Acceptances
export const getPolicyAcceptances = (
  id: string,
  page = 1,
  limit = 20
): Promise<{ acceptances: PolicyAcceptanceRecord[]; pagination: Pagination }> =>
  apiAxios.get(`/policies/${id}/acceptances?page=${page}&limit=${limit}`).then(unwrap);

// Compliance
export const getComplianceReport = (): Promise<ComplianceReport> =>
  apiAxios.get("/policies/compliance").then(unwrap);

// Version history
export const getPolicyVersions = (id: string): Promise<PolicyVersion[]> =>
  apiAxios.get(`/policies/${id}/versions`).then(unwrap);

export const getPolicyVersion = (id: string, versionId: string): Promise<PolicyVersionDetail> =>
  apiAxios.get(`/policies/${id}/versions/${versionId}`).then(unwrap);

export const restorePolicyVersion = (id: string, versionId: string, changeNote?: string) =>
  apiAxios
    .post(`/policies/${id}/versions/${versionId}/restore`, changeNote ? { changeNote } : {})
    .then(unwrap);
