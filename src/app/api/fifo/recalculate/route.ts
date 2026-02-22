import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/supabase/auth";
import { recalculateFIFOForCard } from "@/lib/supabase/fifo";

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
    const { game, card_name, set_name, variant, condition } = body;
    if (!game || !card_name || !set_name || condition == null) {
      return NextResponse.json(
        { error: "game, card_name, set_name, condition required" },
        { status: 422 }
      );
    }
    await recalculateFIFOForCard(user.id, {
      game,
      card_name,
      set_name: set_name ?? "",
      variant: variant ?? "",
      condition,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
