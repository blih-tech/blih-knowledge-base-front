'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { AdminLayout } from '@/components/AdminLayout';
import { DocumentEditor } from '@/components/DocumentEditor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2 } from 'lucide-react';

function ContentManagementContent() {
  const { categories } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDoc, setEditingDoc] = useState<{ categoryId: string; sectionId: string; itemId: string } | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Flatten documents for easier searching
  const allDocuments = categories.flatMap(cat =>
    cat.sections.flatMap(section =>
      section.items.map(item => ({
        ...item,
        categoryId: cat.id,
        categoryTitle: cat.title,
        sectionId: section.id,
        sectionTitle: section.title,
      }))
    )
  );

  const filteredDocs = allDocuments.filter(
    doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (editingDoc || showNewForm) {
    return (
      <DocumentEditor
        categoryId={editingDoc?.categoryId}
        sectionId={editingDoc?.sectionId}
        itemId={editingDoc?.itemId}
        onClose={() => {
          setEditingDoc(null);
          setShowNewForm(false);
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Content</h1>
          <p className="text-muted-foreground">Create, edit, and delete documents</p>
        </div>
        <Button onClick={() => setShowNewForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Document
        </Button>
      </div>

      {/* Search Bar */}
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

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No documents found matching your search.' : 'No documents yet. Create one to get started.'}
            </p>
          </Card>
        ) : (
          filteredDocs.map(doc => (
            <Card
              key={doc.id}
              className="p-4 hover:bg-secondary transition-colors cursor-pointer"
              onClick={() =>
                setEditingDoc({
                  categoryId: doc.categoryId,
                  sectionId: doc.sectionId,
                  itemId: doc.id,
                })
              }
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 truncate">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {doc.categoryTitle} › {doc.sectionTitle}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => {}}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
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
