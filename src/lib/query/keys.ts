import type { InventoryFilters, SaleFilters } from "@/types";

export const queryKeys = {
  profile: ["profile"] as const,

  inventory: {
    all: ["inventory"] as const,
    list: (filters: InventoryFilters) => ["inventory", "list", filters] as const,
    detail: (id: string) => ["inventory", "detail", id] as const,
  },

  sales: {
    all: ["sales"] as const,
    list: (filters: SaleFilters) => ["sales", "list", filters] as const,
    detail: (id: string) => ["sales", "detail", id] as const,
    fifoAudit: (saleId: string) => ["sales", "fifo-audit", saleId] as const,
  },

  dashboard: {
    stats: (period: "7d" | "30d" | "90d") =>
      ["dashboard", "stats", period] as const,
  },

  market: {
    estimate: (lotId: string) => ["market", "estimate", lotId] as const,
  },
};
