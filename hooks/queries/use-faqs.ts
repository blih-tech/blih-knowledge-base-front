"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { adminGetAllFaqs, type Faq } from "@/lib/api/faq.api";

/**
 * Fetch all FAQ items (admin).
 */
export function useFaqs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.faq.list({}),
    queryFn: () => adminGetAllFaqs(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.faq.all });

  return {
    faqs: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error
      ? query.error.message
      : query.error ? String(query.error) : null,
    invalidate,
  };
}
