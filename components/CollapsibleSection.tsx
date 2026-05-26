'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { DocumentSection, DocumentCategory } from '@/lib/types';

interface CollapsibleSectionProps {
  section: DocumentSection;
  category: DocumentCategory;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  section,
  category,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-border pt-3 first:border-t-0 first:pt-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left hover:opacity-70 transition-opacity"
      >
        {section.items.length > 0 ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 text-accent" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0" />
        )}
        <span className="text-sm font-medium text-foreground">{section.title}</span>
      </button>

      {isOpen && section.items.length > 0 && (
        <div className="ml-6 mt-3 space-y-2 border-l-2 border-border pl-3">
          {section.items.map((item) => (
            <Link
              key={item.id}
              href={`/documents/${category.slug}/${section.slug}/${item.slug}`}
              className="flex items-center gap-2 text-sm text-accent hover:underline transition-colors py-1"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
