import { SearchWrapper } from "@/components/SearchWrapper";
import { getFullTree, type CategoryNode } from "@/lib/api/documents.api";
import { getAllFaqs, type Faq } from "@/lib/api/faq.api";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { q } = await searchParams;

  let categories: CategoryNode[] = [];
  let faqs: Faq[] = [];

  const [catResult, faqResult] = await Promise.allSettled([
    getFullTree(),
    getAllFaqs(),
  ]);

  if (catResult.status === "fulfilled") categories = catResult.value;
  if (faqResult.status === "fulfilled") faqs = faqResult.value;

  return (
    <main>
      <SearchWrapper categories={categories} initialQuery={q} faqs={faqs} />
    </main>
  );
}
