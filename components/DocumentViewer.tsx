"use client";

interface DocumentViewerProps {
  contentHtml: string;
}

export function DocumentViewer({ contentHtml }: DocumentViewerProps) {
  if (!contentHtml) {
    return (
      <p className="text-muted-foreground italic">This document has no content yet.</p>
    );
  }

  return (
    <article
      className="prose prose-sm sm:prose max-w-none
        prose-headings:font-semibold prose-headings:text-foreground
        prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-foreground/90 prose-p:leading-relaxed
        prose-strong:text-foreground prose-strong:font-semibold
        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
        prose-ul:list-disc prose-ol:list-decimal
        prose-li:text-foreground/90
        prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground
        prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:text-gray-100"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
