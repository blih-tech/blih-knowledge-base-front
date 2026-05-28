import { Header } from "@/components/Header";
import { SearchWrapper } from "@/components/SearchWrapper";
import { getFullTree, type CategoryNode } from "@/lib/api/documents.api";

export const dynamic = "force-dynamic";

export default async function Home() {
  let categories: CategoryNode[] = [];
  try {
    categories = await getFullTree();
  } catch {
    categories = [];
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showNav />
      <main>
        <SearchWrapper categories={categories} />
      </main>
    </div>
  );
}
