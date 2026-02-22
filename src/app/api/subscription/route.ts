import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/supabase/auth";
import { getProfile } from "@/lib/supabase/profiles";
import { getStripe } from "@/lib/supabase/stripe";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const profile = await getProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { plan: "free", renewalDate: null, status: null },
        { status: 200 }
      );
    }

    const isPro =
      profile.role === "pro" || profile.role === "dealer";
    if (!profile.stripe_subscription_id || profile.subscription_status !== "active") {
      return NextResponse.json(
        {
          plan: isPro ? "pro" : "free",
          renewalDate: null,
          status: profile.subscription_status ?? null,
        },
        { status: 200 }
      );
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(
      profile.stripe_subscription_id,
      { expand: ["items.data.price"] }
    );

    const renewalDate =
      subscription.current_period_end != null
        ? new Date(subscription.current_period_end * 1000).toISOString().slice(0, 10)
        : null;

    return NextResponse.json({
      plan: "pro",
      renewalDate,
      status: subscription.status,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 }
    );
  }
}
