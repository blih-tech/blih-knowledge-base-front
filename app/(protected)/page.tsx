import { SearchWrapper } from "@/components/SearchWrapper";
import { getFullTree, type CategoryNode } from "@/lib/api/documents.api";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { q } = await searchParams;
  let categories: CategoryNode[] = [];
  try {
    categories = await getFullTree();
  } catch {
    categories = [];
  }

  return (
    <main>
      <SearchWrapper categories={categories} initialQuery={q} />
    </main>
  );
}
