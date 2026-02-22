"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { toast } from "sonner";
import type { Sale, PaginatedResponse, SaleFilters, FIFOConsumption } from "@/types";
import type { RecordSalePayload, EditSalePayload } from "@/lib/validators/sales";

export function useSales(filters: SaleFilters) {
  return useQuery({
    queryKey: queryKeys.sales.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v != null && v !== "") params.set(k, String(v));
      });
      const res = await fetch(`/api/sales?${params}`);
      if (!res.ok) throw new Error("Failed to fetch sales");
      return res.json() as Promise<PaginatedResponse<Sale>>;
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
}

export function useSale(id: string | null) {
  return useQuery({
    queryKey: queryKeys.sales.detail(id ?? ""),
    queryFn: async () => {
      const res = await fetch(`/api/sales/${id}`);
      if (!res.ok) throw new Error("Failed to fetch sale");
      return res.json() as Promise<Sale>;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useRecordSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RecordSalePayload) => {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? "Failed to record sale");
      }
      return res.json() as Promise<Sale>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Sale recorded");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useEditSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: EditSalePayload }) => {
      const res = await fetch(`/api/sales/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? "Failed to update sale");
      }
      return res.json() as Promise<Sale>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Sale updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? "Failed to delete sale");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.sales.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Sale deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useFIFOAudit(saleId: string | null) {
  return useQuery({
    queryKey: queryKeys.sales.fifoAudit(saleId ?? ""),
    queryFn: async () => {
      const res = await fetch(`/api/sales/${saleId}/fifo-audit`);
      if (!res.ok) throw new Error("Failed to fetch FIFO audit");
      return res.json() as Promise<FIFOConsumption[]>;
    },
    enabled: !!saleId,
    staleTime: 1000 * 60 * 2,
  });
}
