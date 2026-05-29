"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AdminAIContextValue {
  isOpen: boolean;
  prefill: string;
  open: (prefillMessage?: string) => void;
  close: () => void;
}

const AdminAIContext = createContext<AdminAIContextValue | null>(null);

export function AdminAIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState("");

  const open = useCallback((prefillMessage = "") => {
    setPrefill(prefillMessage);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPrefill("");
  }, []);

  return (
    <AdminAIContext.Provider value={{ isOpen, prefill, open, close }}>
      {children}
    </AdminAIContext.Provider>
  );
}

export function useAdminAI() {
  const ctx = useContext(AdminAIContext);
  if (!ctx) throw new Error("useAdminAI must be used within AdminAIProvider");
  return ctx;
}
