'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { RichTextEditor } from './RichTextEditor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';

interface DocumentEditorProps {
  categoryId?: string;
  sectionId?: string;
  itemId?: string;
  onClose: () => void;
}

export function DocumentEditor({ categoryId, sectionId, itemId, onClose }: DocumentEditorProps) {
  const { categories, updateCategory } = useAdmin();
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryId || '');
  const [selectedSection, setSelectedSection] = useState(sectionId || '');
  const [content, setContent] = useState('');
  const [docId, setDocId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load document if editing
  useEffect(() => {
    if (categoryId && sectionId && itemId) {
      const category = categories.find(c => c.id === categoryId);
      const section = category?.sections.find(s => s.id === sectionId);
      const item = section?.items.find(i => i.id === itemId);

      if (item && category && section) {
        setTitle(item.title);
        setSelectedCategory(categoryId);
        setSelectedSection(sectionId);
        setDocId(item.id);

        // Parse content if it's structured
        const contentData = typeof item.content === 'string' ? item.content : item.content.content || '';
        setContent(contentData);
      }
    }
  }, [categoryId, sectionId, itemId, categories]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!selectedCategory) newErrors.category = 'Category is required';
    if (!selectedSection) newErrors.section = 'Section is required';
    if (!content.trim()) newErrors.content = 'Content is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateDocId = (title: string, category: string) => {
    const cat = categories.find(c => c.id === category);
    const catCode = cat?.title.split(' ')[0].toUpperCase() || 'DOC';
    const timestamp = Date.now().toString().slice(-4);
    return `${catCode}-${timestamp}`;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const category = categories.find(c => c.id === selectedCategory);
      if (!category) return;

      const newDocId = docId || generateDocId(title, selectedCategory);

      if (itemId) {
        // Update existing document
        const updatedCategory = {
          ...category,
          sections: category.sections.map(section => {
            if (section.id === selectedSection) {
              return {
                ...section,
                items: section.items.map(item =>
                  item.id === itemId
                    ? {
                        ...item,
                        title,
                        id: newDocId,
                        content: {
                          ...item.content,
                          title,
                          content,
                        },
                      }
                    : item
                ),
              };
            }
            return section;
          }),
        };
        updateCategory(selectedCategory, updatedCategory);
      } else {
        // Create new document
        const updatedCategory = {
          ...category,
          sections: category.sections.map(section => {
            if (section.id === selectedSection) {
              return {
                ...section,
                items: [
                  ...section.items,
                  {
                    id: newDocId,
                    title,
                    content: {
                      title,
                      docId: newDocId,
                      content,
                      tableOfContents: [],
                    },
                  },
                ],
              };
            }
            return section;
          }),
        };
        updateCategory(selectedCategory, updatedCategory);
      }

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!itemId || !confirm('Are you sure you want to delete this document?')) return;

    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return;

    const updatedCategory = {
      ...category,
      sections: category.sections.map(section => {
        if (section.id === selectedSection) {
          return {
            ...section,
            items: section.items.filter(item => item.id !== itemId),
          };
        }
        return section;
      }),
    };

    updateCategory(selectedCategory, updatedCategory);
    onClose();
  };

  const currentCategory = categories.find(c => c.id === selectedCategory);
  const currentSections = currentCategory?.sections || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">{itemId ? 'Edit Document' : 'New Document'}</h1>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Document Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                placeholder="Document title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Document ID</label>
              <Input
                value={docId}
                disabled
                placeholder="Auto-generated"
                className="bg-secondary text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
              <Select value={selectedCategory} onValueChange={(val) => {
                setSelectedCategory(val);
                setSelectedSection('');
              }}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Section *</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className={errors.section ? 'border-red-500' : ''} disabled={!selectedCategory}>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {currentSections.map(sec => (
                    <SelectItem key={sec.id} value={sec.id}>
                      {sec.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.section && <p className="text-sm text-red-600 mt-1">{errors.section}</p>}
            </div>
          </div>
        </Card>

        {/* Content Editor */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Content *</h2>
          <RichTextEditor
            value={content}
            onChange={(val) => {
              setContent(val);
              if (errors.content) setErrors({ ...errors, content: '' });
            }}
            placeholder="Write your document content here..."
            error={errors.content}
          />
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 flex-1 sm:flex-none">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Document'}
          </Button>

          {itemId && (
            <Button onClick={handleDelete} variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}

          <Button onClick={onClose} variant="outline" className="flex-1 sm:flex-none">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
