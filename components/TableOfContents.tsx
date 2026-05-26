'use client';

import { TOCItem } from '@/lib/types';
import { useState } from 'react';

interface TableOfContentsProps {
  items: TOCItem[];
  onItemClick?: (id: string) => void;
}

export function TableOfContents({ items, onItemClick }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id || null);

  const handleClick = (id: string) => {
    setActiveId(id);
    onItemClick?.(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderItems = (tocItems: TOCItem[]) => {
    return tocItems.map((item) => (
      <div key={item.id}>
        <button
          onClick={() => handleClick(item.id)}
          className={`text-sm py-1 hover:text-accent transition-colors text-left ${
            activeId === item.id ? 'text-accent font-medium' : 'text-muted-foreground'
          }`}
          style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
        >
          {item.number}. {item.title}
        </button>
        {item.children && item.children.length > 0 && (
          <div>{renderItems(item.children)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="sticky top-6">
      <h4 className="text-sm font-semibold text-foreground mb-4">Table of contents</h4>
      <div className="space-y-1">
        {renderItems(items)}
      </div>
    </div>
  );
}
