'use client';

import { DocumentContent } from '@/lib/types';

interface DocumentViewerProps {
  document: DocumentContent;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Document ID: {document.docId}</p>
      </div>

      {document.sections.map((section) => (
        <div key={section.id} id={section.id} className="mb-8 scroll-mt-20">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {section.number}. {section.title}
          </h2>
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {section.content}
          </p>

          {section.subsections && section.subsections.length > 0 && (
            <div className="ml-4 mt-6 space-y-4">
              {section.subsections.map((subsection) => (
                <div key={subsection.id}>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {subsection.number}. {subsection.title}
                  </h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {subsection.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
