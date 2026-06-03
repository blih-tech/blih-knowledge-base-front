"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createTaskReport,
  deleteTaskReport,
  listTaskReports,
  updateTaskReport,
  type TaskReportFilters,
  type TaskReportListResponse,
} from "@/lib/api/reports.api";

/**
 * Fetch a paginated, filtered list of task reports.
 */
export function useReports(filters: TaskReportFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.reports.list(filters as unknown as Record<string, unknown>),
    queryFn: () => listTaskReports(filters),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });

  const data = query.data ?? { reports: [], pagination: { page: 1, limit: 15, total: 0, totalPages: 1 } };

  return {
    reports: data.reports,
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

export function useReportMutations() {
  const queryClient = useQueryClient();
  const invalidateReports = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });

  const create = useMutation({
    mutationFn: createTaskReport,
    onSuccess: invalidateReports,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTaskReport>[1] }) =>
      updateTaskReport(id, data),
    onSuccess: invalidateReports,
  });

  const remove = useMutation({
    mutationFn: deleteTaskReport,
    onSuccess: invalidateReports,
  });

  return {
    createTaskReport: create,
    updateTaskReport: update,
    deleteTaskReport: remove,
  };
}
