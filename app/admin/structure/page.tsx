'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

function StructureManagementContent() {
  const { categories, updateCategory, addCategory } = useAdmin();
  const [expandedCat, setExpandedCat] = useState<string | null>(categories[0]?.id);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [editingSection, setEditingSection] = useState<{ catId: string; secId: string } | null>(null);
  const [newSecTitle, setNewSecTitle] = useState('');

  const handleAddCategory = () => {
    if (!newCatTitle.trim()) return;

    const newCat: typeof categories[0] = {
      id: `cat-${Date.now()}`,
      title: newCatTitle,
      slug: newCatTitle.toLowerCase().replace(/\s+/g, '-'),
      count: 0,
      sections: [],
    };

    addCategory(newCat);
    setNewCatTitle('');
  };

  const handleAddSection = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !newSecTitle.trim()) return;

    const updatedCategory = {
      ...category,
      sections: [
        ...category.sections,
        {
          id: `sec-${Date.now()}`,
          title: newSecTitle,
          slug: newSecTitle.toLowerCase().replace(/\s+/g, '-'),
          items: [],
        },
      ],
    };

    updateCategory(categoryId, updatedCategory);
    setNewSecTitle('');
    setEditingSection(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Delete this category and all its contents?')) {
      // This would require a deleteCategory method in context
      window.location.reload();
    }
  };

  const handleDeleteSection = (categoryId: string, sectionId: string) => {
    if (confirm('Delete this section and all its documents?')) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        const updated = {
          ...category,
          sections: category.sections.filter(s => s.id !== sectionId),
        };
        updateCategory(categoryId, updated);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Structure</h1>
        <p className="text-muted-foreground">Organize categories and sections</p>
      </div>

      {/* Add New Category */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Add New Category</h2>
        <div className="flex gap-2">
          <Input
            value={newCatTitle}
            onChange={(e) => setNewCatTitle(e.target.value)}
            placeholder="Category name (e.g., Procedures)"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button onClick={handleAddCategory} disabled={!newCatTitle.trim()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </Card>

      {/* Categories and Sections */}
      <div className="space-y-3">
        {categories.map(category => (
          <Card key={category.id} className="p-0 overflow-hidden">
            {/* Category Header */}
            <div
              className="flex items-center justify-between p-4 hover:bg-secondary transition-colors cursor-pointer bg-secondary"
              onClick={() => setExpandedCat(expandedCat === category.id ? null : category.id)}
            >
              <div className="flex items-center gap-3 flex-1">
                {expandedCat === category.id ? (
                  <ChevronUp className="w-5 h-5 text-primary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
                <h3 className="font-semibold text-foreground">{category.title}</h3>
                <span className="text-sm text-muted-foreground">({category.sections.length} sections)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(category.id);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            {/* Expanded Content */}
            {expandedCat === category.id && (
              <div className="border-t border-border">
                {/* Sections List */}
                <div className="p-4 space-y-3 bg-white">
                  {category.sections.map(section => (
                    <div
                      key={section.id}
                      className="ml-6 p-3 bg-secondary rounded border border-border flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{section.title}</p>
                        <p className="text-xs text-muted-foreground">{section.items.length} documents</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(category.id, section.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                  {/* Add Section */}
                  {editingSection?.catId === category.id ? (
                    <div className="ml-6 flex gap-2">
                      <Input
                        autoFocus
                        value={newSecTitle}
                        onChange={(e) => setNewSecTitle(e.target.value)}
                        placeholder="Section name"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleAddSection(category.id);
                        }}
                      />
                      <Button
                        onClick={() => handleAddSection(category.id)}
                        disabled={!newSecTitle.trim()}
                        size="sm"
                      >
                        Add
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingSection(null);
                          setNewSecTitle('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingSection({ catId: category.id, secId: '' })}
                      className="ml-6 flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Plus className="w-4 h-4" />
                      Add Section
                    </button>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
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
