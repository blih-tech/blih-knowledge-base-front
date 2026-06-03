import { serverFetch, apiAxios } from "./client";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface UserRef {
  _id: string;
  name: string;
  email: string;
}

export interface DocSummary {
  _id: string;
  title: string;
  slug: string;
  docId: string;
  order: number;
  owner?: UserRef | null;
  updatedAt?: string;
}

export interface SectionNode {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive?: boolean;
  documents: DocSummary[];
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive?: boolean;
  count: number;
  sections: SectionNode[];
}

export interface FullDocument {
  _id: string;
  title: string;
  slug: string;
  docId: string;
  contentHtml: string;
  contentJson: object;
  contentText: string;
  categoryId: { _id: string; name: string; slug: string };
  sectionId: { _id: string; name: string; slug: string };
  owner?: UserRef | null;
  contributors?: UserRef[];
  createdBy?: UserRef | null;
  updatedBy?: UserRef | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentVersion {
  _id: string;
  version: number;
  versionLabel?: string;
  title: string;
  docId: string;
  changedBy: UserRef | null;
  changedAt: string;
  changeNote?: string;
}

export interface DocumentVersionDetail extends DocumentVersion {
  contentHtml: string;
  contentJson: object;
  contentText?: string;
}

export interface SearchResult {
  _id: string;
  title: string;
  slug: string;
  docId: string;
  categoryId: { name: string; slug: string };
  sectionId: { name: string; slug: string };
}

// ─── Public reads (server-side, for Server Components) ─────────────────────────

export const getFullTree = (): Promise<CategoryNode[]> =>
  serverFetch<CategoryNode[]>("/docs");

// ─── Admin reads (client-side, attaches auth token via getSession) ───────────────

export const getFullTreeClient = (): Promise<CategoryNode[]> =>
  apiAxios.get("/docs/admin-tree").then((res) => res.data.data as CategoryNode[]);

export const getDocumentBySlug = (slug: string): Promise<FullDocument> =>
  serverFetch<FullDocument>(`/docs/doc/${slug}`);

// ─── Admin writes (client-side, needs auth token) ─────────────────────────────

const unwrap = <T>(res: { data: { data: T } }) => res.data.data;

// Categories
export const adminCreateCategory = (data: object) =>
  apiAxios.post("/docs/categories", data).then(unwrap);
export const adminUpdateCategory = (id: string, data: object) =>
  apiAxios.put(`/docs/categories/${id}`, data).then(unwrap);
export const adminDeleteCategory = (id: string) =>
  apiAxios.delete(`/docs/categories/${id}`);

// Sections
export const adminCreateSection = (data: object) =>
  apiAxios.post("/docs/sections", data).then(unwrap);
export const adminUpdateSection = (id: string, data: object) =>
  apiAxios.put(`/docs/sections/${id}`, data).then(unwrap);
export const adminDeleteSection = (id: string) =>
  apiAxios.delete(`/docs/sections/${id}`);

// Documents
export const adminGetDocumentById = (id: string): Promise<FullDocument> =>
  apiAxios.get(`/docs/documents/${id}`).then((res) => res.data.data as FullDocument);
export const adminCreateDocument = (data: object) =>
  apiAxios.post("/docs/documents", data).then(unwrap);
export const adminUpdateDocument = (id: string, data: object) =>
  apiAxios.put(`/docs/documents/${id}`, data).then(unwrap);
export const adminDeleteDocument = (id: string) =>
  apiAxios.delete(`/docs/documents/${id}`);

// Document version history
export const adminGetDocumentVersions = (id: string): Promise<DocumentVersion[]> =>
  apiAxios.get(`/docs/documents/${id}/versions`).then((res) => res.data.data as DocumentVersion[]);
export const adminGetDocumentVersion = (id: string, versionId: string): Promise<DocumentVersionDetail> =>
  apiAxios.get(`/docs/documents/${id}/versions/${versionId}`).then((res) => res.data.data as DocumentVersionDetail);
export const adminRestoreDocumentVersion = (id: string, versionId: string, changeNote?: string) =>
  apiAxios.post(`/docs/documents/${id}/versions/${versionId}/restore`, changeNote ? { changeNote } : {}).then(unwrap);

// Search
export const searchDocuments = (q: string): Promise<SearchResult[]> =>
  apiAxios.get(`/docs/search?q=${encodeURIComponent(q)}`).then((res) => res.data.data as SearchResult[]);

// File → HTML parsing
export const parseDocumentFile = async (
  file: File
): Promise<{ html: string; title?: string }> => {
  const form = new FormData();
  form.append('file', file);
  const res = await apiAxios.post('/docs/parse-file', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data as { html: string; title?: string };
};

