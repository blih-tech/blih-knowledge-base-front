"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createDepartment,
  deleteDepartment,
  listDepartments,
  updateDepartment,
  type Department,
} from "@/lib/api/departments.api";

type DepartmentFilters = {
  search?: string;
  isActive?: boolean;
};

/**
 * Fetch a filtered list of departments.
 */
export function useDepartments(filters: DepartmentFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.departments.list(filters as Record<string, unknown>),
    queryFn: () => listDepartments(filters),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });

  return {
    departments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error
      ? query.error.message
      : query.error ? String(query.error) : null,
    invalidate,
  };
}

export function useDepartmentMutations() {
  const queryClient = useQueryClient();
  const invalidateDepartments = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });

  const create = useMutation({
    mutationFn: createDepartment,
    onSuccess: invalidateDepartments,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateDepartment>[1] }) =>
      updateDepartment(id, data),
    onSuccess: invalidateDepartments,
  });

  const remove = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: invalidateDepartments,
  });

  return {
    createDepartment: create,
    updateDepartment: update,
    deleteDepartment: remove,
  };
}
