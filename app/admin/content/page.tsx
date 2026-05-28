"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/admin-context";
import { AdminLayout } from "@/components/AdminLayout";
import { DocumentEditor } from "@/components/DocumentEditor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2 } from "lucide-react";

function ContentManagementContent() {
  const { categories, isLoading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Flatten all documents across the tree
  const allDocuments = categories.flatMap((cat) =>
    cat.sections.flatMap((sec) =>
      sec.documents.map((doc) => ({
        ...doc,
        categoryId: cat.id,
        categoryName: cat.name,
        sectionId: sec.id,
        sectionName: sec.name,
      }))
    )
  );

  const filteredDocs = allDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.sectionName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (editingDocId || showNewForm) {
    return (
      <DocumentEditor
        documentId={editingDocId ?? undefined}
        onClose={() => {
          setEditingDocId(null);
          setShowNewForm(false);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Manage Content</h1>
          <p className="text-muted-foreground">Create, edit, and delete documents</p>
        </div>
        <Button onClick={() => setShowNewForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Document
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search documents by title, category, or section..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Documents list */}
      {isLoading ? (
        <p className="text-center py-12 text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-3">
          {filteredDocs.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No documents match your search."
                  : "No documents yet. Create one to get started."}
              </p>
            </Card>
          ) : (
            filteredDocs.map((doc) => (
              <Card
                key={doc._id}
                className="p-4 hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => setEditingDocId(doc._id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.categoryName} › {doc.sectionName}
                      {doc.docId && (
                        <span className="ml-2 font-mono text-xs">{doc.docId}</span>
                      )}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function ContentManagementPage() {
  return (
    <AdminLayout>
      <ContentManagementContent />
    </AdminLayout>
  );
}
