"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  CategoryNode,
  SectionNode,
  DocSummary,
  getFullTreeClient,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminCreateSection,
  adminUpdateSection,
  adminDeleteSection,
  adminCreateDocument,
  adminUpdateDocument,
  adminDeleteDocument,
  adminRestoreDocumentVersion,
} from "@/lib/api/documents.api";

// Re-export types for convenience (mirrors old admin-context exports)
export type { CategoryNode, SectionNode, DocSummary };

/**
 * React Query replacement for the legacy AdminContext.
 * Provides the full document tree + CRUD helpers that invalidate the cache.
 */
export function useDocumentTree() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.documents.tree,
    queryFn: getFullTreeClient,
  });

  const error = queryError instanceof Error
    ? queryError.message
    : queryError
      ? String(queryError)
      : null;

  const invalidateTree = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.documents.tree });

  // ── Categories ──────────────────────────────────────────────────────────────

  const createCategory = async (name: string) => {
    await adminCreateCategory({ name });
    await invalidateTree();
  };

  const updateCategory = async (id: string, data: object) => {
    await adminUpdateCategory(id, data);
    await invalidateTree();
  };

  const deleteCategory = async (id: string) => {
    await adminDeleteCategory(id);
    await invalidateTree();
  };

  // ── Sections ────────────────────────────────────────────────────────────────

  const createSection = async (categoryId: string, name: string) => {
    await adminCreateSection({ categoryId, name });
    await invalidateTree();
  };

  const updateSection = async (id: string, data: object) => {
    await adminUpdateSection(id, data);
    await invalidateTree();
  };

  const deleteSection = async (id: string) => {
    await adminDeleteSection(id);
    await invalidateTree();
  };

  // ── Documents ───────────────────────────────────────────────────────────────

  const createDocument = async (data: {
    categoryId: string;
    sectionId: string;
    title: string;
    docId?: string;
    contentHtml?: string;
    contentJson?: object;
    contentText?: string;
    owner?: string;
    contributors?: string[];
  }): Promise<DocSummary> => {
    const created = await adminCreateDocument(data);
    await invalidateTree();
    return created as DocSummary;
  };

  const updateDocument = async (id: string, data: object) => {
    await adminUpdateDocument(id, data);
    await invalidateTree();
  };

  const deleteDocument = async (id: string) => {
    await adminDeleteDocument(id);
    await invalidateTree();
  };

  const restoreDocumentVersion = async (id: string, versionId: string) => {
    await adminRestoreDocumentVersion(id, versionId);
    await invalidateTree();
  };

  return {
    categories,
    isLoading,
    error,
    reload: invalidateTree,
    invalidateTree,
    createCategory,
    updateCategory,
    deleteCategory,
    createSection,
    updateSection,
    deleteSection,
    createDocument,
    updateDocument,
    deleteDocument,
    restoreDocumentVersion,
  };
}
