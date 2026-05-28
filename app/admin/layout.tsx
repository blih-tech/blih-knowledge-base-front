"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AdminProvider } from "@/lib/admin-context";
import { AuthProvider } from "@/lib/auth/auth.context";
import { Loader2 } from "lucide-react";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated — render nothing while redirect fires
  if (!isAuthenticated || !isAdmin) return null;

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminGuard>
        {/* Single AdminProvider for all admin/* pages */}
        <AdminProvider>{children}</AdminProvider>
      </AdminGuard>
    </AuthProvider>
  );
}
