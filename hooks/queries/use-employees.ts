"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  listEmployees,
  type Employee,
} from "@/lib/api/employees.api";

type EmployeeFilters = {
  search?: string;
  department?: string;
  isActive?: boolean;
  role?: string;
};

/**
 * Fetch a filtered list of employees.
 * Pass filters to narrow results; pass `{}` to fetch all.
 */
export function useEmployees(filters: EmployeeFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.employees.list(filters as Record<string, unknown>),
    queryFn: () => listEmployees(filters),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });

  return {
    employees: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error
      ? query.error.message
      : query.error ? String(query.error) : null,
    invalidate,
  };
}
