"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  listClients,
  getClient,
  listObservations,
  type Client,
  type ClientListResult,
  type ClientDetail,
  type ClientStatus,
  type ClientTier,
  type Observation,
  type ObservationType,
} from "@/lib/api/clients.api";

type ClientListFilters = {
  search?: string;
  tag?: string;
  industry?: string;
  status?: ClientStatus;
  tier?: ClientTier;
  page?: number;
  limit?: number;
};

/**
 * Fetch a paginated list of clients.
 */
export function useClients(filters: ClientListFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.clients.list(filters as Record<string, unknown>),
    queryFn: () => listClients(filters),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });

  return {
    data: query.data ?? ({ clients: [], total: 0, page: 1, limit: 20, pages: 1 } as ClientListResult),
    clients: query.data?.clients ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error
      ? query.error.message
      : query.error ? String(query.error) : null,
    invalidate,
  };
}

/**
 * Fetch a single client's full detail (profile, contacts, observations summary).
 */
export function useClientDetail(id: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => getClient(id),
    enabled: !!id,
  });

  const { data: observations = [] } = useQuery({
    queryKey: queryKeys.clients.observations(id),
    queryFn: () => listObservations(id),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.observations(id) });
  };

  return {
    detail: query.data ?? null,
    client: query.data?.client ?? null,
    typeCounts: query.data?.typeCounts ?? ({} as Record<ObservationType, number>),
    contacts: query.data?.contacts ?? [],
    healthScore: query.data?.healthScore ?? 50,
    observations,
    isLoading: query.isLoading,
    error: query.error instanceof Error
      ? query.error.message
      : query.error ? String(query.error) : null,
    invalidate,
  };
}
