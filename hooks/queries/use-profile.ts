"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getMyProfile, type MyProfile } from "@/lib/api/profile.api";

/**
 * Fetch the current user's profile.
 */
export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: getMyProfile,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.me });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error
      ? query.error.message
      : query.error ? String(query.error) : null,
    invalidate,
  };
}
