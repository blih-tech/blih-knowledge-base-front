'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { DocumentCategory } from '@/lib/types';

interface SidebarProps {
  categories: DocumentCategory[];
  currentCategory?: string;
  currentSection?: string;
  currentDocument?: string;
}

export function Sidebar({
  categories,
  currentCategory,
  currentSection,
  currentDocument,
}: SidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    [currentCategory || '']: true,
    [currentSection || '']: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside className="w-56 lg:w-64 bg-white border-r border-border overflow-y-auto h-screen sticky top-0">
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {categories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => toggleSection(category.id)}
              className="flex items-center gap-2 w-full text-left py-2 hover:opacity-70 transition-opacity"
            >
              {openSections[category.id] ? (
                <ChevronDown className="h-4 w-4 text-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-foreground" />
              )}
              <span
                className={`text-sm font-semibold ${
                  currentCategory === category.slug
                    ? 'text-accent'
                    : 'text-foreground'
                }`}
              >
                {category.title}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {category.count}
              </span>
            </button>

            {openSections[category.id] && (
              <div className="ml-4 mt-2 space-y-1">
                {category.sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-2 w-full text-left py-1 hover:opacity-70 transition-opacity"
                    >
                      {openSections[section.id] ? (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span
                        className={`text-xs ${
                          currentSection === section.slug
                            ? 'text-accent font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {section.title}
                      </span>
                    </button>

                    {openSections[section.id] && (
                      <div className="ml-4 mt-1 space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.id}
                            href={`/documents/${category.slug}/${section.slug}/${item.slug}`}
                            className={`flex items-center gap-2 py-1 px-2 rounded text-xs transition-colors ${
                              currentDocument === item.slug
                                ? 'bg-accent/10 text-accent'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
