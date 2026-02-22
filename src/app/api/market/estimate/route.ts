import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/supabase/auth";

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
    await requireAuthUser();
    const lotId = req.nextUrl.searchParams.get("lotId");
    if (!lotId) {
      return NextResponse.json({ error: "lotId required" }, { status: 422 });
    }
    return NextResponse.json({
      lotId,
      estimated_value_each: null,
      source: null,
      disclaimer: "Market values shown are estimates or user-provided.",
    });
  } catch (e) {
    return handleError(e);
  }
}
