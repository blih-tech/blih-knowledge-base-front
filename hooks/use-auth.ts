"use client";

import { useAuthContext } from "@/lib/auth/auth.context";

/**
 * useAuth — access auth state and actions from any client component.
 *
 * @example
 * const { user, isAdmin, login, logout } = useAuth();
 */
export function useAuth() {
  return useAuthContext();
}
