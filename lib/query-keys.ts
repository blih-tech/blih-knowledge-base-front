/**
 * Centralized query key factory.
 * Using `as const` ensures keys are narrowly typed for targeted invalidation.
 */
export const queryKeys = {
  employees: {
    all: ["employees"] as const,
    list: (filters: Record<string, unknown>) =>
      ["employees", "list", filters] as const,
    detail: (id: string) => ["employees", "detail", id] as const,
  },
  clients: {
    all: ["clients"] as const,
    list: (filters: Record<string, unknown>) =>
      ["clients", "list", filters] as const,
    detail: (id: string) => ["clients", "detail", id] as const,
    observations: (clientId: string) =>
      ["clients", clientId, "observations"] as const,
  },
  departments: {
    all: ["departments"] as const,
    list: (filters: Record<string, unknown>) =>
      ["departments", "list", filters] as const,
  },
  documents: {
    tree: ["documents", "tree"] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
  },
  faq: {
    all: ["faq"] as const,
    list: (filters: Record<string, unknown>) =>
      ["faq", "list", filters] as const,
  },
  reports: {
    all: ["reports"] as const,
    list: (filters: Record<string, unknown>) =>
      ["reports", "list", filters] as const,
  },
  profile: ["profile"] as const,
};
