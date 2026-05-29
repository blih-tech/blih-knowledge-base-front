"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/lib/admin-context";
import { adminGetDocumentById } from "@/lib/api/documents.api";
import { RichTextEditor } from "./RichTextEditor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Save, Trash2, Loader2 } from "lucide-react";
import { FileImportButton } from "./FileImportButton";

interface DocumentEditorProps {
  /** Pass _id when editing an existing document */
  documentId?: string;
  /** Pre-select category/section when creating from the structure view */
  defaultCategoryId?: string;
  defaultSectionId?: string;
  onClose: () => void;
}

export function DocumentEditor({
  documentId,
  defaultCategoryId,
  defaultSectionId,
  onClose,
}: DocumentEditorProps) {
  const { categories, createDocument, updateDocument, deleteDocument } = useAdmin();

  const [title, setTitle] = useState("");
  const [docId, setDocId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategoryId ?? "");
  const [selectedSection, setSelectedSection] = useState(defaultSectionId ?? "");
  const [contentHtml, setContentHtml] = useState("");
  const [contentJson, setContentJson] = useState<object>({ type: "doc", content: [] });
  const [contentVersion, setContentVersion] = useState(0); // bumped on file import to sync editor
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch full document content when editing
  useEffect(() => {
    if (!documentId) return;
    setIsLoadingDoc(true);
    adminGetDocumentById(documentId)
      .then((doc) => {
        setTitle(doc.title);
        setDocId(doc.docId ?? "");
        setSelectedCategory(
          typeof doc.categoryId === "object" ? doc.categoryId._id : doc.categoryId
        );
        setSelectedSection(
          typeof doc.sectionId === "object" ? doc.sectionId._id : doc.sectionId
        );
        setContentHtml(doc.contentHtml ?? "");
        if (doc.contentJson && Object.keys(doc.contentJson).length > 0) {
          setContentJson(doc.contentJson);
        }
      })
      .catch(() => setSaveError("Failed to load document content"))
      .finally(() => setIsLoadingDoc(false));
  }, [documentId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!selectedCategory) e.category = "Category is required";
    if (!selectedSection) e.section = "Section is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Plain-text extraction from HTML for search indexing
  const extractText = (html: string) =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  /** Called by FileImportButton after successful parse */
  const handleImport = (html: string, importedTitle?: string) => {
    setContentHtml(html);
    setContentVersion((v) => v + 1); // triggers RichTextEditor to sync
    // Auto-fill title only when it's currently empty
    if (importedTitle && !title.trim()) {
      setTitle(importedTitle);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        title: title.trim(),
        docId: docId.trim(),
        categoryId: selectedCategory,
        sectionId: selectedSection,
        contentHtml,
        contentJson,
        contentText: extractText(contentHtml),
      };

      if (documentId) {
        await updateDocument(documentId, payload);
      } else {
        await createDocument(payload);
      }
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!documentId || !confirm("Delete this document? This cannot be undone.")) return;
    try {
      await deleteDocument(documentId);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const currentSections =
    categories.find((c) => c.id === selectedCategory)?.sections ?? [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {documentId ? "Edit Document" : "New Document"}
        </h1>
        {isLoadingDoc && (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-1" />
        )}
      </div>

      {isLoadingDoc ? (
        <div className="space-y-4">
          <div className="h-48 rounded-xl bg-muted animate-pulse" />
          <div className="h-80 rounded-xl bg-muted animate-pulse" />
        </div>
      ) : (
      <div className="space-y-6">
        {/* Info card */}
        <Card className="p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Document Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <Input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: "" }); }}
                placeholder="Document title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Document ID <span className="text-muted-foreground text-xs">(e.g. RM-TD-P-25-002)</span>
              </label>
              <Input
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                placeholder="Optional — leave blank to skip"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category *</label>
              <Select
                value={selectedCategory}
                onValueChange={(v) => { setSelectedCategory(v); setSelectedSection(""); setErrors({ ...errors, category: "" }); }}
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Section *</label>
              <Select
                value={selectedSection}
                onValueChange={(v) => { setSelectedSection(v); setErrors({ ...errors, section: "" }); }}
                disabled={!selectedCategory}
              >
                <SelectTrigger className={errors.section ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {currentSections.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.section && <p className="text-xs text-red-600 mt-1">{errors.section}</p>}
            </div>
          </div>
        </Card>

        {/* Editor card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Content</h2>
            <FileImportButton
              onImport={handleImport}
              hasContent={contentHtml.trim().length > 0}
            />
          </div>
          <RichTextEditor
            value={contentHtml}
            onChange={setContentHtml}
            onChangeJson={setContentJson}
            placeholder="Write your document content here..."
            externalContentVersion={contentVersion}
          />
        </Card>

        {/* Error banner */}
        {saveError && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? "Saving…" : "Save Document"}
          </Button>
          {documentId && (
            <Button onClick={handleDelete} variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
          <Button onClick={onClose} variant="outline">Cancel</Button>
        </div>
      </div>
      )}
    </div>
  );
}
