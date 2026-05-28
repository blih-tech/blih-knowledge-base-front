"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/admin-context";
import { AdminLayout } from "@/components/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

function StructureManagementContent() {
  const { categories, isLoading, createCategory, createSection, deleteCategory, deleteSection } = useAdmin();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [addingSection, setAddingSection] = useState<string | null>(null); // categoryId
  const [newSecName, setNewSecName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const withBusy = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setActionError(null);
    try { await fn(); } catch (e) { setActionError(e instanceof Error ? e.message : "Action failed"); }
    finally { setBusyId(null); }
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">Manage Structure</h1>
        <p className="text-muted-foreground">Organize categories and sections</p>
      </div>

      {actionError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Add Category */}
      <Card className="p-6 mb-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Add New Category</h2>
        <div className="flex gap-2">
          <Input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Category name (e.g., Procedures)"
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          />
          <Button
            onClick={handleAddCategory}
            disabled={!newCatName.trim() || busyId === "new-cat"}
            className="gap-2"
          >
            {busyId === "new-cat" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </Button>
        </div>
      </Card>

      {/* Category list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <Card key={category.id} className="p-0 overflow-hidden">
              {/* Category header */}
              <div
                className="flex items-center justify-between p-4 bg-secondary hover:bg-secondary/80 cursor-pointer"
                onClick={() => setExpandedCat(expandedCat === category.id ? null : category.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedCat === category.id ? (
                    <ChevronUp className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    ({category.sections.length} sections, {category.count} docs)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={busyId === `del-cat-${category.id}`}
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id, category.name); }}
                >
                  {busyId === `del-cat-${category.id}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-500" />
                  )}
                </Button>
              </div>

              {/* Expanded sections */}
              {expandedCat === category.id && (
                <div className="border-t border-border bg-white p-4 space-y-3">
                  {category.sections.map((section) => (
                    <div
                      key={section.id}
                      className="ml-4 p-3 bg-secondary rounded border border-border flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{section.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {section.documents.length} document{section.documents.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === `del-sec-${section.id}`}
                        onClick={() => handleDeleteSection(section.id, section.name)}
                      >
                        {busyId === `del-sec-${section.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  ))}

                  {/* Add section */}
                  {addingSection === category.id ? (
                    <div className="ml-4 flex gap-2">
                      <Input
                        autoFocus
                        value={newSecName}
                        onChange={(e) => setNewSecName(e.target.value)}
                        placeholder="Section name"
                        onKeyDown={(e) => e.key === "Enter" && handleAddSection(category.id)}
                      />
                      <Button
                        size="sm"
                        disabled={!newSecName.trim() || busyId === `new-sec-${category.id}`}
                        onClick={() => handleAddSection(category.id)}
                      >
                        {busyId === `new-sec-${category.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : "Add"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setAddingSection(null); setNewSecName(""); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingSection(category.id)}
                      className="ml-4 flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      Add Section
                    </button>
                  )}
                </div>
              )}
            </Card>
          ))}

          {categories.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No categories yet. Add one above.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function StructureManagementPage() {
  return (
    <AdminLayout>
      <StructureManagementContent />
    </AdminLayout>
  );
}
