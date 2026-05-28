"use client";

import { useState } from "react";
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
} from "lucide-react";

function StructureManagementContent() {
  const {
    categories,
    isLoading,
    createCategory,
    createSection,
    deleteCategory,
    deleteSection,
  } = useAdmin();

  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [addingSection, setAddingSection] = useState<string | null>(null);
  const [newSecName, setNewSecName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Structure</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organize your knowledge base into categories and sections
        </p>
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Add Category card */}
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
            const isExpanded = expandedCat === category.id;
            const isDeleting = busyId === `del-cat-${category.id}`;

            return (
              <Card key={category.id} className="overflow-hidden border shadow-sm p-0">
                {/* Category row */}
                <div
                  className="flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-secondary/60 transition-colors select-none"
                  onClick={() => setExpandedCat(isExpanded ? null : category.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-md bg-teal-50">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-teal-700" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-teal-700" />
                      )}
                    </div>
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
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={isDeleting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id, category.name);
                    }}
                    className="text-muted-foreground hover:text-red-600 hover:bg-red-50 shrink-0"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Expanded: sections */}
                {isExpanded && (
                  <div className="border-t border-border bg-secondary/30 p-4 space-y-2">
                    {/* Section rows */}
                    {category.sections.length === 0 && addingSection !== category.id && (
                      <p className="text-xs text-muted-foreground ml-8 mb-2">
                        No sections yet — add one below.
                      </p>
                    )}

                    {category.sections.map((section) => {
                      const isDeletingSec = busyId === `del-sec-${section.id}`;
                      return (
                        <div
                          key={section.id}
                          className="ml-7 flex items-center justify-between bg-white rounded-lg border border-border px-3 py-2.5 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">
                              {section.name}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {section.documents.length} doc{section.documents.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={isDeletingSec}
                            onClick={() => handleDeleteSection(section.id, section.name)}
                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50 shrink-0"
                          >
                            {isDeletingSec ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
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
                          ) : (
                            "Add"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAddingSection(null);
                            setNewSecName("");
                          }}
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
