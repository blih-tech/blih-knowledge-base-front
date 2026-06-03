"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  adminCreateFaq,
  adminDeleteFaq,
  adminGetAllFaqs,
  adminUpdateFaq,
  type Faq,
} from "@/lib/api/faq.api";

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

export function useFaqMutations() {
  const queryClient = useQueryClient();
  const invalidateFaqs = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.faq.all });

  const create = useMutation({
    mutationFn: adminCreateFaq,
    onSuccess: invalidateFaqs,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminUpdateFaq>[1] }) =>
      adminUpdateFaq(id, data),
    onSuccess: invalidateFaqs,
  });

  const remove = useMutation({
    mutationFn: adminDeleteFaq,
    onSuccess: invalidateFaqs,
  });

  return {
    createFaq: create,
    updateFaq: update,
    deleteFaq: remove,
  };
}
