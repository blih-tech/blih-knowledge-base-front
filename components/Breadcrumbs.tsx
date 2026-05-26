'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BreadcrumbItem } from '@/lib/types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {item.href ? (
            <Link
              href={item.href}
              className="text-accent hover:underline transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className="text-accent">{item.title}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
