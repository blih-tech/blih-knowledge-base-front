"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useActivePolicies } from "@/hooks/queries";

/**
 * Checks if the authenticated user has unaccepted required policies.
 * If so, redirects them to `/policy-acceptance`.
 *
 * Mount this inside any authenticated layout that should enforce policy acceptance.
 * The `/policy-acceptance` page itself is excluded from the check to avoid loops.
 */
export function PolicyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: policies, isLoading } = useActivePolicies();

  const pendingRequired = (policies ?? []).filter(
    (p) => p.isRequired && !p.isAccepted
  );

  useEffect(() => {
    // Don't redirect if we're already on the acceptance page or still loading
    if (isLoading || pathname.startsWith("/policy-acceptance")) return;

    if (pendingRequired.length > 0) {
      router.replace(`/policy-acceptance?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, pendingRequired.length, pathname, router]);

  // While loading, render children normally (the layout's own loader covers this)
  if (isLoading) return <>{children}</>;

  // If pending policies exist and we're not on the acceptance page, render nothing
  // (the redirect effect is in-flight)
  if (pendingRequired.length > 0 && !pathname.startsWith("/policy-acceptance")) {
    return null;
  }

  return <>{children}</>;
}
