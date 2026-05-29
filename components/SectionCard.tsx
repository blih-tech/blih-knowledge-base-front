"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import type { CategoryNode } from "@/lib/api/documents.api";

interface SectionCardProps {
  category: CategoryNode;
  fullWidth?: boolean;
}

export function SectionCard({ category, fullWidth = false }: SectionCardProps) {
  // Track which section IDs are expanded. Default: all closed.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div
      className={`bg-white border border-border rounded-lg p-6 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-semibold">
          {category.count}
        </span>
      </div>

      {/* Section list */}
      <div className="space-y-2">
        {category.sections.map((section) => {
          const isOpen = openSections.has(section.id);
          const hasDocs = section.documents.length > 0;

          return (
            <div key={section.id}>
              {/* Section row — always clickable to toggle */}
              <button
                onClick={() => hasDocs && toggle(section.id)}
                className={`w-full flex items-center gap-2 text-sm text-muted-foreground transition-colors group text-left ${
                  hasDocs ? "hover:text-accent cursor-pointer" : "cursor-default"
                }`}
                aria-expanded={isOpen}
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-90 text-accent" : "group-hover:text-accent"
                  }`}
                />
                <span className={isOpen ? "text-accent font-medium" : ""}>
                  {section.name}
                </span>
              </button>

              {/* Document links — shown when section is expanded */}
              {isOpen && hasDocs && (
                <div className="ml-5 mt-1.5 space-y-1">
                  {section.documents.map((doc) => (
                    <Link
                      key={doc._id}
                      href={`/documents/${category.slug}/${section.slug}/${doc.slug}`}
                      className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      <FileText className="h-3 w-3 flex-shrink-0" />
                      {doc.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
