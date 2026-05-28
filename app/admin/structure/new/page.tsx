"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DocumentEditor } from "@/components/DocumentEditor";

function NewDocumentPage() {
  const params = useSearchParams();
  const router = useRouter();

  const categoryId = params.get("categoryId") ?? undefined;
  const sectionId = params.get("sectionId") ?? undefined;

  return (
    <DocumentEditor
      defaultCategoryId={categoryId}
      defaultSectionId={sectionId}
      onClose={() => router.push("/admin/structure")}
    />
  );
}

export default function AdminStructureNewPage() {
  return (
    <Suspense>
      <NewDocumentPage />
    </Suspense>
  );
}
