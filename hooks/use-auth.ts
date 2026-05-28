"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;
  return {
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: user?.role === "admin",
  };
}
