"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  createMeetingMinute,
  deleteMeetingMinute,
  listMeetingMinutes,
  updateMeetingMinute,
  type MeetingMinuteFilters,
} from "@/lib/api/meetings.api";

/**
 * Fetch a paginated, filtered list of meeting minutes (admin).
 */
export function useMeetings(filters: MeetingMinuteFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.meetings.list(filters as unknown as Record<string, unknown>),
    queryFn: () => listMeetingMinutes(filters),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });

  const data = query.data ?? {
    minutes: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  };

  return {
    minutes: data.minutes,
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

export function useMeetingMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });

  const create = useMutation({
    mutationFn: createMeetingMinute,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMeetingMinute>[1] }) =>
      updateMeetingMinute(id, data),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteMeetingMinute,
    onSuccess: invalidate,
  });

  return {
    createMeeting: create,
    updateMeeting: update,
    deleteMeeting: remove,
  };
}
