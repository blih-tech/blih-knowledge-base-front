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
    <>
      {/* Styles for custom data-text-size inline marks produced by the rich text editor */}
      <style>{`
        .doc-viewer [data-text-size="h1"] {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.025em;
          color: #1e293b;
        }
        .doc-viewer [data-text-size="h2"] {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.025em;
          color: #1e293b;
        }
        .doc-viewer [data-text-size="h3"] {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.015em;
          color: #1e293b;
        }
      `}</style>
      <article
        className="
          doc-viewer
          prose prose-slate max-w-none
          prose-headings:font-bold prose-headings:text-slate-800 prose-headings:tracking-tight
          prose-h1:text-3xl prose-h1:mt-0 prose-h1:mb-4
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-slate-700 prose-p:leading-relaxed prose-p:my-3
          prose-strong:text-slate-800 prose-strong:font-semibold
          prose-a:text-teal-700 prose-a:no-underline hover:prose-a:underline
          prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
          prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
          prose-li:text-slate-700 prose-li:my-1
          prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:text-slate-500 prose-blockquote:pl-4
          prose-code:text-teal-700 prose-code:bg-teal-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg
          prose-hr:border-slate-200 prose-hr:my-8
        "
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </>
  );
}
