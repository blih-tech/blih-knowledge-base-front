'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CollapsibleSection } from './CollapsibleSection';
import { DocumentCategory } from '@/lib/types';

interface SectionCardProps {
  category: DocumentCategory;
}

export function SectionCard({ category }: SectionCardProps) {
  return (
    <Card className="bg-white border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
        <Badge className="bg-accent text-white hover:bg-accent">{category.count}</Badge>
      </div>

      <div className="space-y-2">
        {category.sections.map((section) => (
          <CollapsibleSection
            key={section.id}
            section={section}
            category={category}
          />
        ))}
      </div>
    </Card>
  );
}
