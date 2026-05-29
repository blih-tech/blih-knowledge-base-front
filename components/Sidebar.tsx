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
  // Keep the active category open by default
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.slug, c.slug === currentCategorySlug]))
  );
  // Keep the active section open by default
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
    <aside className="w-64 bg-white border-r border-slate-100 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      <div className="space-y-1.5">
        {categories.map((cat) => {
          const isActiveCategory = cat.slug === currentCategorySlug;
          const isCatOpen = openCategories[cat.slug] ?? isActiveCategory;

          return (
            <div key={cat.id} className="relative">
              {/* Category card/row */}
              <button
                onClick={() => toggleCat(cat.slug)}
                className={`flex items-center justify-between w-full text-left py-3 px-5 transition-all relative ${
                  isActiveCategory
                    ? "bg-[#f1f5f9] text-slate-800 font-semibold border-r-[3.5px] border-slate-900"
                    : "text-slate-600 hover:bg-slate-50/50 hover:text-slate-900"
                }`}
              >
                <span className="text-sm tracking-wide">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isActiveCategory
                        ? "bg-slate-200 text-slate-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cat.count}
                  </span>
                </div>
              </button>

              {/* Nested sections & documents */}
              {isCatOpen && cat.sections.length > 0 && (
                <div className="mt-1 mb-2 px-3 space-y-1">
                  {cat.sections.map((sec) => {
                    const isActiveSection = sec.slug === currentSectionSlug;
                    const isSecOpen = openSections[sec.slug] ?? isActiveSection;

                    return (
                      <div key={sec.id} className="space-y-1">
                        {/* Section row with left chevron */}
                        <button
                          onClick={() => toggleSec(sec.slug)}
                          className="flex items-center gap-2 w-full text-left py-2 px-3 rounded hover:bg-slate-50 transition-colors"
                        >
                          {isSecOpen ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                          )}
                          <span
                            className={`text-[13px] truncate ${
                              isActiveSection
                                ? "text-slate-800 font-semibold"
                                : "text-slate-500 font-medium"
                            }`}
                          >
                            {sec.name}
                          </span>
                        </button>

                        {/* Documents list */}
                        {isSecOpen && sec.documents.length > 0 && (
                          <div className="pl-6 space-y-1">
                            {sec.documents.map((doc) => {
                              const isActiveDoc = doc.slug === currentDocSlug;

                              return (
                                <Link
                                  key={doc._id}
                                  href={`/documents/${cat.slug}/${sec.slug}/${doc.slug}`}
                                  className={`flex items-start gap-2 py-1.5 px-3 rounded text-[12.5px] transition-colors leading-tight ${
                                    isActiveDoc
                                      ? "text-slate-900 font-semibold bg-slate-50/80"
                                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                                  }`}
                                >
                                  <FileText className="h-3.5 w-3.5 mt-0.5 text-slate-700 flex-shrink-0" />
                                  <span>{doc.title}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
