import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/supabase/auth";
import { getProfile } from "@/lib/supabase/profiles";
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
    const profile = await getProfile(user.id);

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing customer found" },
        { status: 400 }
      );
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    let returnUrl = `${origin}/settings`;
    try {
      const body = await req.json().catch(() => ({}));
      if (typeof body.return_url === "string" && body.return_url.startsWith("/")) {
        returnUrl = `${origin}${body.return_url}`;
      }
    } catch {
      // leave returnUrl as default
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    return handleError(e);
  }
}
