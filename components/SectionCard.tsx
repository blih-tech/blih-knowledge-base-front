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
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      className={`bg-white border border-border rounded-xl p-6 transition-shadow duration-200 hover:shadow-md ${
        fullWidth ? "w-full" : ""
      }`}
      style={{ borderLeft: "3px solid #2563eb" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          {category.name}
        </h3>
        <span
          className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full text-xs font-semibold"
          style={{ background: "#eff6ff", color: "#2563eb" }}
        >
          {category.count}
        </span>
      </div>

      {/* Section list */}
      <div className="space-y-1.5">
        {category.sections.map((section) => {
          const isOpen = openSections.has(section.id);
          const hasDocs = section.documents.length > 0;

          return (
            <div key={section.id}>
              <button
                onClick={() => hasDocs && toggle(section.id)}
                className={`w-full flex items-center gap-2 text-sm text-muted-foreground transition-colors group text-left rounded-md px-1.5 py-1 -mx-1.5 ${
                  hasDocs
                    ? "hover:text-foreground hover:bg-blue-50/60 cursor-pointer"
                    : "cursor-default"
                } ${isOpen ? "text-foreground bg-blue-50/40" : ""}`}
                aria-expanded={isOpen}
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                  style={{ color: isOpen ? "#2563eb" : undefined }}
                />
                <span className={`text-[13px] ${isOpen ? "font-medium" : ""}`} style={isOpen ? { color: "#1e40af" } : undefined}>
                  {section.name}
                </span>
                {hasDocs && (
                  <span className="ml-auto text-[10px] text-muted-foreground/50 tabular-nums">
                    {section.documents.length}
                  </span>
                )}
              </button>

              {isOpen && hasDocs && (
                <div className="ml-5 mt-1 space-y-1 pb-1">
                  {section.documents.map((doc) => (
                    <Link
                      key={doc._id}
                      href={`/documents/${category.slug}/${section.slug}/${doc.slug}`}
                      className="flex items-center gap-1.5 text-[12px] py-0.5 rounded transition-colors hover:underline underline-offset-4"
                      style={{ color: "#2563eb" }}
                    >
                      <FileText className="h-3 w-3 flex-shrink-0 opacity-60" />
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
