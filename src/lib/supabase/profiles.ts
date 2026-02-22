import { createSupabaseServerClient } from "./server";
import type { Profile } from "@/types";
import type { UpdateProfilePayload } from "@/lib/validators/profile";

function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    role: (row.role as Profile["role"]) ?? "free",
    stripe_customer_id: (row.stripe_customer_id as string) ?? null,
    stripe_subscription_id: (row.stripe_subscription_id as string) ?? null,
    subscription_status: (row.subscription_status as Profile["subscription_status"]) ?? null,
    created_at: row.created_at as string,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return toProfile(data as Record<string, unknown>);
}

export async function updateProfile(
  userId: string,
  payload: UpdateProfilePayload
): Promise<Profile> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toProfile(data as Record<string, unknown>);
}

export async function updateSubscriptionStatus(
  userId: string,
  subscriptionStatus: Profile["subscription_status"],
  stripeSubscriptionId: string | null
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const role = subscriptionStatus === "active" ? "pro" : "free";
  await supabase
    .from("profiles")
    .update({
      subscription_status: subscriptionStatus,
      stripe_subscription_id: stripeSubscriptionId,
      role,
    })
    .eq("id", userId);
}
