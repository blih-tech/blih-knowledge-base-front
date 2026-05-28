"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import type { CategoryNode } from "@/lib/api/documents.api";

interface SidebarProps {
  categories: CategoryNode[];
  currentCategorySlug?: string;
  currentSectionSlug?: string;
  currentDocSlug?: string;
}

export function Sidebar({
  categories,
  currentCategorySlug,
  currentSectionSlug,
  currentDocSlug,
}: SidebarProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.slug, c.slug === currentCategorySlug]))
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(
      categories.flatMap((c) =>
        c.sections.map((s) => [s.slug, s.slug === currentSectionSlug])
      )
    )
  );

  const toggleCat = (slug: string) =>
    setOpenCategories((p) => ({ ...p, [slug]: !p[slug] }));
  const toggleSec = (slug: string) =>
    setOpenSections((p) => ({ ...p, [slug]: !p[slug] }));

  return (
    <aside className="w-60 lg:w-64 bg-white border-r border-border h-screen sticky top-0 overflow-y-auto">
      <div className="py-6 px-4 space-y-1">
        {categories.map((cat) => (
          <div key={cat.id}>
            {/* Category row */}
            <button
              onClick={() => toggleCat(cat.slug)}
              className="flex items-center justify-between w-full text-left py-2 px-2 rounded hover:bg-secondary/60 transition-colors"
            >
              <span
                className={`text-sm font-semibold truncate ${
                  cat.slug === currentCategorySlug ? "text-accent" : "text-foreground"
                }`}
              >
                {cat.name}
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-muted-foreground">{cat.count}</span>
                {openCategories[cat.slug] ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            </button>

            {openCategories[cat.slug] && (
              <div className="ml-3 mt-1 space-y-0.5">
                {cat.sections.map((sec) => (
                  <div key={sec.id}>
                    {/* Section row */}
                    <button
                      onClick={() => toggleSec(sec.slug)}
                      className="flex items-center gap-1.5 w-full text-left py-1.5 px-2 rounded hover:bg-secondary/60 transition-colors"
                    >
                      {openSections[sec.slug] ? (
                        <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs truncate ${
                          sec.slug === currentSectionSlug
                            ? "text-accent font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {sec.name}
                      </span>
                    </button>

                    {openSections[sec.slug] && (
                      <div className="ml-5 mt-0.5 space-y-0.5">
                        {sec.documents.map((doc) => (
                          <Link
                            key={doc._id}
                            href={`/documents/${cat.slug}/${sec.slug}/${doc.slug}`}
                            className={`flex items-center gap-1.5 py-1.5 px-2 rounded text-xs transition-colors ${
                              doc.slug === currentDocSlug
                                ? "bg-accent/10 text-accent font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            }`}
                          >
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{doc.title}</span>
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
