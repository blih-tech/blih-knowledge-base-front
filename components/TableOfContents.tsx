"use client";

import { useState } from "react";

interface TocItem {
  id: string;
  title: string;
  level: number;
  number: string;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  const handleClick = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="sticky top-8">
      <h4 className="text-sm font-semibold text-foreground mb-3">Table of contents</h4>
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            className={`block w-full text-left text-sm py-0.5 transition-colors ${
              activeId === item.id
                ? "text-accent font-medium"
                : "text-muted-foreground hover:text-accent"
            }`}
          >
            {item.number}. {item.title}
          </button>
        ))}
      </nav>
    </div>
  );
}
