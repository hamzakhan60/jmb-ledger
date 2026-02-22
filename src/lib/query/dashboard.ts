"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import type { DashboardStats } from "@/types";

export function useDashboardStats(period: "7d" | "30d" | "90d") {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(period),
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/stats?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json() as Promise<DashboardStats>;
    },
    staleTime: 1000 * 60 * 2,
  });
}
