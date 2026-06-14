"use client";

import { Input } from "@/components/ui/input";
import { Search, FileText, FolderOpen, X } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CategoryNode } from "@/lib/api/documents.api";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  large?: boolean;
  categories?: CategoryNode[];
}

interface SuggestionItem {
  type: "document" | "section" | "category";
  title: string;
  breadcrumb: string;
  slug: string;
  href: string;
}

export function SearchBar({
  onSearch,
  large = false,
  categories = [],
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Build a flat index of all searchable items
  const allItems = useMemo<SuggestionItem[]>(() => {
    const items: SuggestionItem[] = [];
    for (const cat of categories) {
      items.push({
        type: "category",
        title: cat.name,
        breadcrumb: "Category",
        slug: cat.slug,
        href: `/?q=${encodeURIComponent(cat.name)}`,
      });
      for (const sec of cat.sections) {
        items.push({
          type: "section",
          title: sec.name,
          breadcrumb: cat.name,
          slug: `${cat.slug}/${sec.slug}`,
          href: `/?q=${encodeURIComponent(sec.name)}`,
        });
        for (const doc of sec.documents) {
          items.push({
            type: "document",
            title: doc.title,
            breadcrumb: `${cat.name} › ${sec.name}`,
            slug: doc.slug,
            href: `/documents/${cat.slug}/${sec.slug}/${doc.slug}`,
          });
        }
      }
    }
    return items;
  }, [categories]);

  // Filter suggestions based on query
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.breadcrumb.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, allItems]);

  const showDropdown = isFocused && suggestions.length > 0;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIdx(-1);
  }, [suggestions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleSelect = (item: SuggestionItem) => {
    setIsFocused(false);
    if (item.type === "document") {
      // Navigate directly to the document page
      router.push(item.href);
    } else {
      // For categories/sections, filter the grid
      setQuery(item.title);
      onSearch?.(item.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIdx]);
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  const iconForType = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="w-3.5 h-3.5 text-primary/60" />;
      case "section":
        return <FolderOpen className="w-3.5 h-3.5 text-amber-500/70" />;
      case "category":
        return <FolderOpen className="w-3.5 h-3.5 text-violet-500/70" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-primary font-medium">
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  if (large) {
    return (
      <div className="w-full max-w-2xl mx-auto" ref={wrapperRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search documents, categories, or sections…"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            className="pl-12 pr-10 py-6 bg-white border-0 text-base rounded-lg shadow-sm"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Suggestions dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border/60 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="py-1.5">
                <p className="px-3.5 py-1 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  Suggestions
                </p>
                {suggestions.map((item, i) => (
                  <button
                    key={`${item.type}-${item.slug}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIdx(i)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 text-left transition-colors ${
                      i === selectedIdx
                        ? "bg-primary/5"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className="shrink-0">{iconForType(item.type)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">
                        {highlightMatch(item.title, query)}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 truncate">
                        {item.breadcrumb}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/40 bg-secondary/60 px-1.5 py-0.5 rounded shrink-0 capitalize">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        className={`pl-10 bg-white border border-border rounded-md ${query ? "pr-8" : ""}`}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-secondary text-muted-foreground z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border/60 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="py-1">
            {suggestions.map((item, i) => (
              <button
                key={`${item.type}-${item.slug}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIdx(i)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
                  i === selectedIdx
                    ? "bg-primary/5"
                    : "hover:bg-secondary/50"
                }`}
              >
                <div className="shrink-0">{iconForType(item.type)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground truncate">
                    {highlightMatch(item.title, query)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
