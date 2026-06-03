"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  CategoryNode,
  SectionNode,
  DocSummary,
  adminGetDocumentById,
  adminGetDocumentVersion,
  adminGetDocumentVersions,
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
  parseDocumentFile,
  type DocumentVersion,
  type DocumentVersionDetail,
  type FullDocument,
} from "@/lib/api/documents.api";

// Re-export types for convenience (mirrors old admin-context exports)
export type {
  CategoryNode,
  SectionNode,
  DocSummary,
  DocumentVersion,
  DocumentVersionDetail,
  FullDocument,
};

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

  const createCategoryMutation = useMutation({
    mutationFn: adminCreateCategory,
    onSuccess: invalidateTree,
  });
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      adminUpdateCategory(id, data),
    onSuccess: invalidateTree,
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: invalidateTree,
  });
  const createSectionMutation = useMutation({
    mutationFn: adminCreateSection,
    onSuccess: invalidateTree,
  });
  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      adminUpdateSection(id, data),
    onSuccess: invalidateTree,
  });
  const deleteSectionMutation = useMutation({
    mutationFn: adminDeleteSection,
    onSuccess: invalidateTree,
  });
  const createDocumentMutation = useMutation({
    mutationFn: adminCreateDocument,
    onSuccess: invalidateTree,
  });
  const updateDocumentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) =>
      adminUpdateDocument(id, data),
    onSuccess: (_result, variables) => {
      invalidateTree();
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.versions(variables.id) });
    },
  });
  const deleteDocumentMutation = useMutation({
    mutationFn: adminDeleteDocument,
    onSuccess: (_result, id) => {
      invalidateTree();
      queryClient.removeQueries({ queryKey: queryKeys.documents.detail(id) });
    },
  });
  const restoreVersionMutation = useMutation({
    mutationFn: ({ id, versionId, changeNote }: { id: string; versionId: string; changeNote?: string }) =>
      adminRestoreDocumentVersion(id, versionId, changeNote),
    onSuccess: (_result, variables) => {
      invalidateTree();
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.versions(variables.id) });
    },
  });

  // ── Categories ──────────────────────────────────────────────────────────────

  const createCategory = async (name: string) => {
    await createCategoryMutation.mutateAsync({ name });
  };

  const updateCategory = async (id: string, data: object) => {
    await updateCategoryMutation.mutateAsync({ id, data });
  };

  const deleteCategory = async (id: string) => {
    await deleteCategoryMutation.mutateAsync(id);
  };

  // ── Sections ────────────────────────────────────────────────────────────────

  const createSection = async (categoryId: string, name: string) => {
    await createSectionMutation.mutateAsync({ categoryId, name });
  };

  const updateSection = async (id: string, data: object) => {
    await updateSectionMutation.mutateAsync({ id, data });
  };

  const deleteSection = async (id: string) => {
    await deleteSectionMutation.mutateAsync(id);
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
    const created = await createDocumentMutation.mutateAsync(data);
    return created as DocSummary;
  };

  const updateDocument = async (id: string, data: object) => {
    await updateDocumentMutation.mutateAsync({ id, data });
  };

  const deleteDocument = async (id: string) => {
    await deleteDocumentMutation.mutateAsync(id);
  };

  const restoreDocumentVersion = async (id: string, versionId: string) => {
    await restoreVersionMutation.mutateAsync({ id, versionId });
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

export function useDocument(documentId?: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(documentId ?? ""),
    queryFn: () => adminGetDocumentById(documentId!),
    enabled: !!documentId,
  });
}

export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: queryKeys.documents.versions(documentId),
    queryFn: () => adminGetDocumentVersions(documentId),
    enabled: !!documentId,
  });
}

export function useDocumentVersion() {
  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      adminGetDocumentVersion(documentId, versionId),
  });
}

export function useDocumentFileImport() {
  return useMutation({
    mutationFn: parseDocumentFile,
  });
}
