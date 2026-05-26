'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Sidebar } from '@/components/Sidebar';
import { TableOfContents } from '@/components/TableOfContents';
import { DocumentViewer } from '@/components/DocumentViewer';
import { getContent, getDocument } from '@/lib/get-content';
import { DocumentCategory } from '@/lib/types';
import { useParams } from 'next/navigation';

export default function DocumentPage() {
  const params = useParams();
  const categorySlug = Array.isArray(params.category) ? params.category[0] : params.category;
  const sectionSlug = Array.isArray(params.section) ? params.section[0] : params.section;
  const documentSlug = Array.isArray(params.document) ? params.document[0] : params.document;

  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCategories(getContent());
    setIsLoading(false);
  }, []);

  const document = getDocument(categorySlug, sectionSlug, documentSlug);

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!document || !document.content) {
    return (
      <div className="min-h-screen bg-background">
        <Header showNav={false} />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Document not found</p>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.id === categorySlug);

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'Documentation', href: '/' },
    { title: category?.title || 'Category', href: '/' },
    { title: document.title },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header showNav={false} />

      <div className="flex">
        {/* Sidebar - Hidden on mobile and tablet */}
        <div className="hidden lg:block">
          <Sidebar
            categories={documentsData}
            currentCategory={categorySlug}
            currentSection={sectionSlug}
            currentDocument={documentSlug}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="flex-1 min-w-0 overflow-x-hidden">
            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
              <Breadcrumbs items={breadcrumbItems} />

              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 break-words">
                  {document.content.title}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {document.content.docId}
                </p>
              </div>

              <DocumentViewer document={document.content} />
            </div>
          </div>

          {/* Table of Contents Sidebar - Hidden on smaller screens */}
          <div className="hidden xl:block w-56 2xl:w-64 px-4 lg:px-6 py-6 sm:py-8 border-l border-border flex-shrink-0">
            <TableOfContents items={document.content.tableOfContents} />
          </div>
        </div>
      </div>
    </div>
  );
}
