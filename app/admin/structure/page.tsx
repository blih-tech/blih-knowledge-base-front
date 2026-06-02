"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/admin-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  Folder,
  BookOpen,
  FileText,
  Edit2,
  Check,
  X,
} from "lucide-react";

// ─── Main component ────────────────────────────────────────────────────────────

function StructureManagementContent() {
  const router = useRouter();
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    createSection,
    updateSection,
    deleteCategory,
    deleteSection,
  } = useAdmin();

  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [expandedSec, setExpandedSec] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [newSecName, setNewSecName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // ── Inline rename state ────────────────────────────────────────────────────
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [editingSecId, setEditingSecId] = useState<string | null>(null);
  const [editingSecName, setEditingSecName] = useState("");

  // ─── Navigation helpers ───────────────────────────────────────────────────

  const openNewDocument = (categoryId: string, sectionId: string) =>
    router.push(`/admin/structure/new?categoryId=${categoryId}&sectionId=${sectionId}`);

  const openEditDocument = (documentId: string) =>
    router.push(`/admin/structure/${documentId}/edit`);

  const withBusy = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setActionError(null);
    try {
      await fn();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    withBusy("new-cat", async () => {
      await createCategory(newCatName.trim());
      setNewCatName("");
    });
  };

  const handleAddSection = (categoryId: string) => {
    if (!newSecName.trim()) return;
    withBusy(`new-sec-${categoryId}`, async () => {
      await createSection(categoryId, newSecName.trim());
      setNewSecName("");
      setAddingSection(null);
    });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and ALL its contents? This cannot be undone.`)) return;
    withBusy(`del-cat-${id}`, () => deleteCategory(id));
  };

  const handleDeleteSection = (id: string, name: string) => {
    if (!confirm(`Delete section "${name}" and all its documents?`)) return;
    withBusy(`del-sec-${id}`, () => deleteSection(id));
  };

  // ── Rename handlers ───────────────────────────────────────────────────────

  const startEditCategory = (id: string, currentName: string) => {
    setEditingCatId(id);
    setEditingCatName(currentName);
  };

  const cancelEditCategory = () => {
    setEditingCatId(null);
    setEditingCatName("");
  };

  const handleRenameCategory = (id: string) => {
    if (!editingCatName.trim()) return;
    withBusy(`rename-cat-${id}`, async () => {
      await updateCategory(id, { name: editingCatName.trim() });
      cancelEditCategory();
    });
  };

  const startEditSection = (id: string, currentName: string) => {
    setEditingSecId(id);
    setEditingSecName(currentName);
  };

  const cancelEditSection = () => {
    setEditingSecId(null);
    setEditingSecName("");
  };

  const handleRenameSection = (id: string) => {
    if (!editingSecName.trim()) return;
    withBusy(`rename-sec-${id}`, async () => {
      await updateSection(id, { name: editingSecName.trim() });
      cancelEditSection();
    });
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Structure</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organize categories, sections, and documents in one place
        </p>
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Add Category */}
      <Card className="p-5 border shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Folder className="w-4 h-4 text-teal-600" />
          Add New Category
        </h2>
        <div className="flex gap-2">
          <Input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder='e.g., "HR Policies" or "Procedures"'
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            className="flex-1"
          />
          <Button
            onClick={handleAddCategory}
            disabled={!newCatName.trim() || busyId === "new-cat"}
            className="shrink-0 gap-1.5"
          >
            {busyId === "new-cat" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Category
          </Button>
        </div>
      </Card>

      {/* Category list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <Folder className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No categories yet. Add your first one above.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => {
            const isCatExpanded = expandedCat === category.id;
            const isDeleting = busyId === `del-cat-${category.id}`;

            return (
              <Card key={category.id} className="overflow-hidden border shadow-sm p-0">
                {/* ── Category row ── */}
                <div
                  className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-secondary/60 transition-colors select-none"
                  onClick={() => setExpandedCat(isCatExpanded ? null : category.id)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-1.5 rounded-md bg-teal-50 shrink-0">
                      {isCatExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-teal-700" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-teal-700" />
                      )}
                    </div>

                    {editingCatId === category.id ? (
                      /* ── Inline rename input ── */
                      <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                        <Input
                          autoFocus
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameCategory(category.id);
                            if (e.key === "Escape") cancelEditCategory();
                          }}
                          className="h-7 text-sm font-semibold flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={busyId === `rename-cat-${category.id}`}
                          onClick={() => handleRenameCategory(category.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0"
                        >
                          {busyId === `rename-cat-${category.id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={cancelEditCategory}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      /* ── Normal name display ── */
                      <>
                        <span className="font-semibold text-foreground text-sm truncate">
                          {category.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-xs font-normal">
                            {category.sections.length} section{category.sections.length !== 1 ? "s" : ""}
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-normal">
                            {category.count} doc{category.count !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {editingCatId !== category.id && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => { e.stopPropagation(); startEditCategory(category.id, category.name); }}
                        className="text-muted-foreground hover:text-primary hover:bg-teal-50"
                        title="Rename category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isDeleting}
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id, category.name); }}
                      className="text-muted-foreground hover:text-red-600 hover:bg-red-50 shrink-0"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* ── Sections ── */}
                {isCatExpanded && (
                  <div className="border-t border-border bg-secondary/20 p-4 space-y-2">
                    {category.sections.length === 0 && addingSection !== category.id && (
                      <p className="text-xs text-muted-foreground ml-8 mb-1">
                        No sections yet — add one below.
                      </p>
                    )}

                    {category.sections.map((section) => {
                      const isSecExpanded = expandedSec === section.id;
                      const isDeletingSec = busyId === `del-sec-${section.id}`;

                      return (
                        <div key={section.id} className="ml-7">
                          {/* Section row */}
                          <div
                            className="flex items-center justify-between bg-white rounded-lg border border-border px-3 py-2.5 shadow-xs cursor-pointer hover:bg-secondary/40 transition-colors select-none"
                            onClick={() => setExpandedSec(isSecExpanded ? null : section.id)}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {isSecExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              )}
                              <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

                              {editingSecId === section.id ? (
                                /* ── Inline rename input ── */
                                <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    autoFocus
                                    value={editingSecName}
                                    onChange={(e) => setEditingSecName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleRenameSection(section.id);
                                      if (e.key === "Escape") cancelEditSection();
                                    }}
                                    className="h-7 text-sm font-medium flex-1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled={busyId === `rename-sec-${section.id}`}
                                    onClick={() => handleRenameSection(section.id)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0"
                                  >
                                    {busyId === `rename-sec-${section.id}` ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={cancelEditSection}
                                    className="text-muted-foreground hover:text-foreground shrink-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                /* ── Normal name display ── */
                                <>
                                  <span className="text-sm font-medium text-foreground truncate">
                                    {section.name}
                                  </span>
                                  <Badge variant="secondary" className="text-xs font-normal shrink-0">
                                    {section.documents.length} doc{section.documents.length !== 1 ? "s" : ""}
                                  </Badge>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {editingSecId !== section.id && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditSection(section.id, section.name);
                                  }}
                                  className="text-muted-foreground hover:text-primary hover:bg-teal-50"
                                  title="Rename section"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openNewDocument(category.id, section.id);
                                }}
                                className="text-muted-foreground hover:text-primary hover:bg-teal-50"
                                title="Add document to this section"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                disabled={isDeletingSec}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section.id, section.name);
                                }}
                                className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                              >
                                {isDeletingSec ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Document list inside section */}
                          {isSecExpanded && (
                            <div className="ml-6 mt-1.5 space-y-1">
                              {section.documents.length === 0 ? (
                                <p className="text-xs text-muted-foreground px-2 py-1.5">
                                  No documents yet.
                                </p>
                              ) : (
                                section.documents.map((doc) => (
                                  <button
                                    key={doc._id}
                                    onClick={() => openEditDocument(doc._id)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border border-border text-left hover:bg-teal-50 hover:border-teal-200 transition-colors group shadow-xs"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:text-teal-600" />
                                    <span className="text-sm text-foreground truncate flex-1">
                                      {doc.title}
                                    </span>
                                    {doc.docId && (
                                      <span className="text-xs font-mono text-muted-foreground shrink-0">
                                        {doc.docId}
                                      </span>
                                    )}
                                    <Edit2 className="w-3 h-3 text-muted-foreground/30 group-hover:text-teal-600 shrink-0 transition-colors" />
                                  </button>
                                ))
                              )}

                              {/* Add document inline CTA */}
                              <button
                                onClick={() => openNewDocument(category.id, section.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary hover:bg-teal-50 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add document to &ldquo;{section.name}&rdquo;
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add section inline form */}
                    {addingSection === category.id ? (
                      <div className="ml-7 flex gap-2 pt-1">
                        <Input
                          autoFocus
                          value={newSecName}
                          onChange={(e) => setNewSecName(e.target.value)}
                          placeholder="Section name"
                          onKeyDown={(e) => e.key === "Enter" && handleAddSection(category.id)}
                          className="h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          disabled={!newSecName.trim() || busyId === `new-sec-${category.id}`}
                          onClick={() => handleAddSection(category.id)}
                          className="shrink-0"
                        >
                          {busyId === `new-sec-${category.id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : "Add"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setAddingSection(null); setNewSecName(""); }}
                          className="shrink-0"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingSection(category.id)}
                        className="ml-7 mt-1 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Section
                      </button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StructureManagementPage() {
  return <StructureManagementContent />;
}
