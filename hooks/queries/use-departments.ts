"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  listDepartments,
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
