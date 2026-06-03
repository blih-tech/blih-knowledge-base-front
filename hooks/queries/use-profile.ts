"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
  type MyProfile,
} from "@/lib/api/profile.api";

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

export function useProfileMutations() {
  const queryClient = useQueryClient();
  const invalidateProfile = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.me });

  const update = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: invalidateProfile,
  });

  const changePassword = useMutation({
    mutationFn: changeMyPassword,
  });

  return {
    updateMyProfile: update,
    changeMyPassword: changePassword,
  };
}
