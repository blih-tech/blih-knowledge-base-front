"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SectionCard } from "@/components/SectionCard";
import type { CategoryNode } from "@/lib/api/documents.api";

interface SearchWrapperProps {
  categories: CategoryNode[];
}

export function SearchWrapper({ categories }: SearchWrapperProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? categories
        .map((cat) => ({
          ...cat,
          sections: cat.sections
            .map((sec) => ({
              ...sec,
              documents: sec.documents.filter(
                (doc) =>
                  doc.title.toLowerCase().includes(query.toLowerCase()) ||
                  sec.name.toLowerCase().includes(query.toLowerCase())
              ),
            }))
            .filter((sec) => sec.documents.length > 0),
        }))
        .filter((cat) => cat.sections.length > 0)
    : categories;

  return (
    <>
      {/* Search */}
      <section className="bg-secondary py-10 sm:py-14">
        <div className="mx-auto max-w-2xl px-4">
          <SearchBar onSearch={setQuery} />
        </div>
      </section>

      {/* Categories grid */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No documents found matching your search.
          </p>
        ) : (
          <>
            {/* Top 3-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filtered.slice(0, 3).map((cat) => (
                <SectionCard key={cat.id} category={cat} />
              ))}
            </div>
            {/* Remaining categories full-width */}
            {filtered.slice(3).map((cat) => (
              <div key={cat.id} className="mb-6">
                <SectionCard key={cat.id} category={cat} fullWidth />
              </div>
            ))}
          </>
        )}
      </main>
    </>
  );
}
