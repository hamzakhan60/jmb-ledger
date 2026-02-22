"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { toast } from "sonner";
import type { InventoryLot, PaginatedResponse, InventoryFilters } from "@/types";
import type { CreateLotPayload, EditLotPayload } from "@/lib/validators/inventory";

export function useInventoryLots(filters: InventoryFilters) {
  return useQuery({
    queryKey: queryKeys.inventory.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v != null && v !== "") params.set(k, String(v));
      });
      const res = await fetch("/api/inventory?" + params.toString());
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return res.json() as Promise<PaginatedResponse<InventoryLot>>;
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });
}

export function useInventoryLot(id: string | null) {
  return useQuery({
    queryKey: queryKeys.inventory.detail(id ?? ""),
    queryFn: async () => {
      const res = await fetch("/api/inventory/" + id);
      if (!res.ok) throw new Error("Failed to fetch lot");
      return res.json() as Promise<InventoryLot>;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAddInventoryLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateLotPayload) => {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? "Failed to create lot");
      }
      return res.json() as Promise<InventoryLot>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Inventory lot added");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useEditInventoryLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; payload: EditLotPayload }) => {
      const res = await fetch("/api/inventory/" + args.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args.payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? "Failed to update lot");
      }
      return res.json() as Promise<InventoryLot>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Lot updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteInventoryLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/inventory/" + id, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? "Failed to delete lot");
      }
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.inventory.all });
      return { previous: qc.getQueriesData({ queryKey: queryKeys.inventory.all }) };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      toast.error(err.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
