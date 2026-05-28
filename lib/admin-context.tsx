"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  CategoryNode,
  SectionNode,
  DocSummary,
  getFullTree,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminCreateSection,
  adminUpdateSection,
  adminDeleteSection,
  adminCreateDocument,
  adminUpdateDocument,
  adminDeleteDocument,
} from "./api/documents.api";

// ─── Context shape ─────────────────────────────────────────────────────────────

interface AdminContextType {
  categories: CategoryNode[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;

  // Category
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, data: object) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Section
  createSection: (categoryId: string, name: string) => Promise<void>;
  updateSection: (id: string, data: object) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  // Document
  createDocument: (data: {
    categoryId: string;
    sectionId: string;
    title: string;
    docId?: string;
    contentHtml?: string;
    contentJson?: object;
    contentText?: string;
  }) => Promise<DocSummary>;
  updateDocument: (id: string, data: object) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tree = await getFullTree();
      setCategories(tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // ── Categories ────────────────────────────────────────────────────────────

  const createCategory = async (name: string) => {
    await adminCreateCategory({ name });
    await reload();
  };

  const updateCategory = async (id: string, data: object) => {
    await adminUpdateCategory(id, data);
    await reload();
  };

  const deleteCategory = async (id: string) => {
    await adminDeleteCategory(id);
    await reload();
  };

  // ── Sections ──────────────────────────────────────────────────────────────

  const createSection = async (categoryId: string, name: string) => {
    await adminCreateSection({ categoryId, name });
    await reload();
  };

  const updateSection = async (id: string, data: object) => {
    await adminUpdateSection(id, data);
    await reload();
  };

  const deleteSection = async (id: string) => {
    await adminDeleteSection(id);
    await reload();
  };

  // ── Documents ─────────────────────────────────────────────────────────────

  const createDocument = async (data: {
    categoryId: string;
    sectionId: string;
    title: string;
    docId?: string;
    contentHtml?: string;
    contentJson?: object;
    contentText?: string;
  }): Promise<DocSummary> => {
    const created = await adminCreateDocument(data);
    await reload();
    return created as DocSummary;
  };

  const updateDocument = async (id: string, data: object) => {
    await adminUpdateDocument(id, data);
    await reload();
  };

  const deleteDocument = async (id: string) => {
    await adminDeleteDocument(id);
    await reload();
  };

  return (
    <AdminContext.Provider
      value={{
        categories,
        isLoading,
        error,
        reload,
        createCategory,
        updateCategory,
        deleteCategory,
        createSection,
        updateSection,
        deleteSection,
        createDocument,
        updateDocument,
        deleteDocument,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

// Re-export types for convenience
export type { CategoryNode, SectionNode, DocSummary };
