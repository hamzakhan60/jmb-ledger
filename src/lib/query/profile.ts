"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { toast } from "sonner";
import type { Profile } from "@/types";
import type { UpdateProfilePayload } from "@/lib/validators/profile";

export interface SubscriptionInfo {
  plan: "free" | "pro";
  renewalDate: string | null;
  status: string | null;
}

export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: async () => {
      const res = await fetch("/api/subscription");
      if (!res.ok) throw new Error("Failed to fetch subscription");
      return res.json() as Promise<SubscriptionInfo>;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json() as Promise<Profile>;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { error?: string }).error ?? "Failed to update profile");
      }
      return res.json() as Promise<Profile>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success("Profile updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
