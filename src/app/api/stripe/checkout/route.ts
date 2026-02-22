import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/supabase/auth";
import { getStripe } from "@/lib/supabase/stripe";

function handleError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const { priceId, successUrl, cancelUrl } = body;

    const price = priceId ?? process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;
    if (!price) {
      return NextResponse.json(
        { error: "Price ID not configured" },
        { status: 400 }
      );
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price, quantity: 1 }],
      success_url:
        successUrl ??
        `${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/dashboard`,
      cancel_url:
        cancelUrl ??
        `${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/pricing`,
      metadata: { user_id: user.id },
      customer_email: user.email ?? undefined,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (e) {
    return handleError(e);
  }
}
