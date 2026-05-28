import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Sidebar } from "@/components/Sidebar";
import { DocumentViewer } from "@/components/DocumentViewer";
import { TableOfContents } from "@/components/TableOfContents";
import { getFullTree, getDocumentBySlug } from "@/lib/api/documents.api";

interface Props {
  params: Promise<{ category: string; section: string; document: string }>;
}

export const dynamic = "force-dynamic";

export default async function DocumentPage({ params }: Props) {
  const { document: docSlug, category: categorySlug, section: sectionSlug } = await params;

  // Fetch in parallel
  const [categories, doc] = await Promise.all([
    getFullTree().catch(() => []),
    getDocumentBySlug(docSlug).catch(() => null),
  ]);

  if (!doc) notFound();

  const breadcrumbs = [
    { title: "Home", href: "/" },
    { title: "Documentation", href: "/" },
    { title: doc.categoryId.name, href: "/" },
    { title: doc.sectionId.name, href: "/" },
    { title: doc.title },
  ];

  // Extract headings from HTML for Table of Contents
  const headingRegex = /<h([1-3])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h[1-3]>/gi;
  const tocItems: { id: string; title: string; level: number; number: string }[] = [];
  let match: RegExpExecArray | null;
  let counter = 0;
  while ((match = headingRegex.exec(doc.contentHtml)) !== null) {
    counter++;
    tocItems.push({
      id: match[2],
      title: match[3].replace(/<[^>]+>/g, ""), // strip inner tags
      level: parseInt(match[1]),
      number: String(counter),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showNav={false} />

      <div className="flex">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            categories={categories}
            currentCategorySlug={categorySlug}
            currentSectionSlug={sectionSlug}
            currentDocSlug={docSlug}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col xl:flex-row min-w-0">
          <div className="flex-1 min-w-0 px-6 lg:px-10 py-8 max-w-4xl">
            <Breadcrumbs items={breadcrumbs} />

            <div className="mt-6 mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-2">
                {doc.title}
              </h1>
              {doc.docId && (
                <p className="text-xs text-muted-foreground font-mono">{doc.docId}</p>
              )}
            </div>

            <DocumentViewer contentHtml={doc.contentHtml} />
          </div>

          {/* Right TOC */}
          {tocItems.length > 0 && (
            <div className="hidden xl:block w-56 flex-shrink-0 border-l border-border px-6 py-8">
              <TableOfContents items={tocItems} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
