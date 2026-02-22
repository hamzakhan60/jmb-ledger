import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/supabase/auth";
import { getFIFOConsumptionsForSale } from "@/lib/supabase/sales";

function handleError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id: saleId } = await ctx.params;
    const data = await getFIFOConsumptionsForSale(user.id, saleId);
    return NextResponse.json(data);
  } catch (e) {
    return handleError(e);
  }
}
