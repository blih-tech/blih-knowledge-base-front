"use client";

import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/lib/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus  // re-fetch when user switches back to tab
      refetchInterval={5 * 60} // also re-fetch every 5 minutes
    >
      <QueryProvider>
        {children}
      </QueryProvider>
    </SessionProvider>
  );
}
