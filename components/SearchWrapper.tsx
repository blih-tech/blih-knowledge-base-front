"use client";

import { SearchBar } from "@/components/SearchBar";
import { SectionCard } from "@/components/SectionCard";
import type { CategoryNode } from "@/lib/api/documents.api";

interface SearchWrapperProps {
  categories: CategoryNode[];
  initialQuery?: string;
}

export function SearchWrapper({ categories, initialQuery = "" }: SearchWrapperProps) {
  return (
    <>
      {/* Search */}
      <section className="bg-secondary py-10 sm:py-14">
        <div className="mx-auto max-w-2xl px-4">
          <SearchBar categories={categories} />
        </div>
      </section>

      {/* Categories grid */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Top 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {categories.slice(0, 3).map((cat) => (
            <SectionCard key={cat.id} category={cat} />
          ))}
        </div>
        {/* Remaining categories full-width */}
        {categories.slice(3).map((cat) => (
          <div key={cat.id} className="mb-6">
            <SectionCard key={cat.id} category={cat} fullWidth />
          </div>
        ))}
      </main>
    </>
  );
}
