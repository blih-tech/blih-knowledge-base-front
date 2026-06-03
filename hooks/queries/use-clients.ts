"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createClient,
  createContact,
  createObservation,
  deleteClient,
  deleteContact,
  deleteObservation,
  listClients,
  getClient,
  listObservations,
  updateClient,
  updateContact,
  updateObservation,
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

export function useClientMutations(clientId?: string) {
  const queryClient = useQueryClient();

  const invalidateClients = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
  const invalidateClientDetail = (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.observations(id) });
  };

  const create = useMutation({
    mutationFn: createClient,
    onSuccess: invalidateClients,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      updateClient(id, data),
    onSuccess: (_client, variables) => {
      invalidateClients();
      invalidateClientDetail(variables.id);
    },
  });

  const remove = useMutation({
    mutationFn: deleteClient,
    onSuccess: (_result, id) => {
      invalidateClients();
      queryClient.removeQueries({ queryKey: queryKeys.clients.detail(id) });
    },
  });

  const createContactMutation = useMutation({
    mutationFn: ({ data }: { data: Parameters<typeof createContact>[1] }) => {
      if (!clientId) throw new Error("Client id is required");
      return createContact(clientId, data);
    },
    onSuccess: () => {
      if (clientId) invalidateClientDetail(clientId);
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: Parameters<typeof updateContact>[2] }) => {
      if (!clientId) throw new Error("Client id is required");
      return updateContact(clientId, contactId, data);
    },
    onSuccess: () => {
      if (clientId) invalidateClientDetail(clientId);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => {
      if (!clientId) throw new Error("Client id is required");
      return deleteContact(clientId, contactId);
    },
    onSuccess: () => {
      if (clientId) invalidateClientDetail(clientId);
    },
  });

  const createObservationMutation = useMutation({
    mutationFn: ({ data }: { data: Parameters<typeof createObservation>[1] }) => {
      if (!clientId) throw new Error("Client id is required");
      return createObservation(clientId, data);
    },
    onSuccess: () => {
      if (clientId) invalidateClientDetail(clientId);
    },
  });

  const updateObservationMutation = useMutation({
    mutationFn: ({ observationId, data }: { observationId: string; data: Parameters<typeof updateObservation>[2] }) => {
      if (!clientId) throw new Error("Client id is required");
      return updateObservation(clientId, observationId, data);
    },
    onSuccess: () => {
      if (clientId) invalidateClientDetail(clientId);
    },
  });

  const deleteObservationMutation = useMutation({
    mutationFn: (observationId: string) => {
      if (!clientId) throw new Error("Client id is required");
      return deleteObservation(clientId, observationId);
    },
    onSuccess: () => {
      if (clientId) invalidateClientDetail(clientId);
    },
  });

  return {
    createClient: create,
    updateClient: update,
    deleteClient: remove,
    createContact: createContactMutation,
    updateContact: updateContactMutation,
    deleteContact: deleteContactMutation,
    createObservation: createObservationMutation,
    updateObservation: updateObservationMutation,
    deleteObservation: deleteObservationMutation,
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
