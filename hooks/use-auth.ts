"use client";

import { useSession } from "next-auth/react";
import type { Permission } from "@/lib/permissions";

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user ?? null;
  const isSuperAdmin = user?.isSuperAdmin === true;

  const hasPermission = (permission: Permission): boolean => {
    if (isSuperAdmin) return true; // super admins bypass all checks
    return (user?.permissions ?? []).includes(permission);
  };

  return {
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: user?.role === "admin",
    isSuperAdmin,
    permissions: user?.permissions ?? [],
    hasPermission,
  };
}
