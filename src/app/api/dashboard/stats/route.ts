import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/supabase/auth";
import { getDashboardStats } from "@/lib/supabase/dashboard";

function handleError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthUser();
    const period = (req.nextUrl.searchParams.get("period") || "30d") as
      | "7d"
      | "30d"
      | "90d";
    if (!["7d", "30d", "90d"].includes(period)) {
      return NextResponse.json({ error: "Invalid period" }, { status: 422 });
    }
    const stats = await getDashboardStats(user.id, period);
    return NextResponse.json(stats);
  } catch (e) {
    return handleError(e);
  }
}
