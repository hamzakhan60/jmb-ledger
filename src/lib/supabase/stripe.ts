import Stripe from "stripe";
import { createSupabaseServiceClient } from "./server";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const subscriptionId = session.subscription as string | null;
  const customerId = session.customer as string | null;
  const userId = session.metadata?.user_id as string | undefined;

  if (!userId) return;

  const supabase = createSupabaseServiceClient();
  await supabase
    .from("profiles")
    .update({
      role: "pro",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: "active",
    })
    .eq("id", userId);
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const supabase = createSupabaseServiceClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_subscription_id", subscription.id);

  if (profiles?.length) {
    await supabase
      .from("profiles")
      .update({
        role: "free",
        stripe_subscription_id: null,
        subscription_status: "canceled",
      })
      .eq("id", profiles[0].id);
  }
}

export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
) {
  const subscription =
    invoice.parent?.subscription_details?.subscription;
  const subscriptionId =
    typeof subscription === "string" ? subscription : subscription?.id;
  if (!subscriptionId) return;

  const supabase = createSupabaseServiceClient();
  await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("stripe_subscription_id", subscriptionId);
}

export async function verifyWebhook(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    secret
  ) as Stripe.Event;
}
