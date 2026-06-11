"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createInitiative,
  deleteInitiative,
  listInitiatives,
  updateInitiative,
  rateInitiative,
  commentOnInitiative,
  deleteInitiativeComment,
  toggleInitiativeReaction,
  getEvaluationConfig,
  updateEvaluationConfig,
  saveInitiativeEvaluation,
  type InitiativeFilters,
} from "@/lib/api/initiatives.api";

export function useInitiatives(filters: InitiativeFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.initiatives.list(filters as unknown as Record<string, unknown>),
    queryFn: () => listInitiatives(filters),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.all });

  const data = query.data ?? {
    initiatives: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  };

  return {
    initiatives: data.initiatives,
    pagination: data.pagination,
    total: data.pagination.total,
    totalPages: data.pagination.totalPages,
    isLoading: query.isLoading,
    error: query.error instanceof Error
      ? query.error.message
      : query.error ? String(query.error) : null,
    invalidate,
  };
}

export function useInitiativeMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.all });

  const create = useMutation({
    mutationFn: createInitiative,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateInitiative>[1] }) =>
      updateInitiative(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteInitiative,
    onSuccess: invalidate,
  });

  return {
    createInitiative: create,
    updateInitiative: update,
    deleteInitiative: remove,
  };
}

export function useInitiativeInteractions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.all });

  const rate = useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) =>
      rateInitiative(id, value),
    onSuccess: invalidate,
  });

  const comment = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      commentOnInitiative(id, text),
    onSuccess: invalidate,
  });

  const removeComment = useMutation({
    mutationFn: ({ id, commentId }: { id: string; commentId: string }) =>
      deleteInitiativeComment(id, commentId),
    onSuccess: invalidate,
  });

  const react = useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) =>
      toggleInitiativeReaction(id, emoji),
    onSuccess: invalidate,
  });

  return { rate, comment, removeComment, react };
}

export function useEvaluationConfig() {
  return useQuery({
    queryKey: queryKeys.initiatives.evaluationConfig,
    queryFn: getEvaluationConfig,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInitiativeEvaluation() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.all });

  const saveEvaluation = useMutation({
    mutationFn: ({ id, scores, note }: { id: string; scores: Record<string, number>; note?: string }) =>
      saveInitiativeEvaluation(id, { scores, note }),
    onSuccess: invalidate,
  });

  const saveConfig = useMutation({
    mutationFn: updateEvaluationConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives.evaluationConfig });
      invalidate();
    },
  });

  return { saveEvaluation, saveConfig };
}
