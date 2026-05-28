import { Header } from "@/components/Header";
import { SearchWrapper } from "@/components/SearchWrapper";
import { getFullTree, type CategoryNode } from "@/lib/api/documents.api";

export const dynamic = "force-dynamic"; // Always fresh — no stale categories

export default async function Home() {
  let categories: CategoryNode[] = [];
  try {
    categories = await getFullTree();
  } catch {
    // Backend offline during build/dev — fall back to empty
    categories = [];
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showNav />
      <SearchWrapper categories={categories} />
    </div>
  );
}
