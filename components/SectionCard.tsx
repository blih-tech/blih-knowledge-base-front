"use client";

import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import type { CategoryNode } from "@/lib/api/documents.api";

interface SectionCardProps {
  category: CategoryNode;
  fullWidth?: boolean;
}

export function SectionCard({ category, fullWidth = false }: SectionCardProps) {
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

      {/* Section links — flat list matching reference */}
      <div className="space-y-2">
        {category.sections.map((section) => (
          <div key={section.id}>
            {section.documents.length === 1 ? (
              /* Single doc: link directly to document */
              <Link
                href={`/documents/${category.slug}/${section.slug}/${section.documents[0].slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group"
              >
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent flex-shrink-0" />
                <span>{section.name}</span>
              </Link>
            ) : (
              /* Multiple docs: link to first, show section name */
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{section.name}</span>
              </div>
            )}
            {/* If full-width card, show individual document links */}
            {fullWidth && section.documents.length > 0 && (
              <div className="ml-5 mt-1 space-y-1">
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
        ))}
      </div>
    </div>
  );
}
