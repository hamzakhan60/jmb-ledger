import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/supabase/auth";
import {
  getInventoryLotById,
  updateInventoryLot,
  deleteInventoryLot,
} from "@/lib/supabase/inventory";
import { EditLotSchema } from "@/lib/validators/inventory";

function handleError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const err = error as Error & { code?: string };
    if (err.code === "LOT_HAS_SALES") {
      return NextResponse.json({ error: err.message }, { status: 409 });
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
    const { id } = await ctx.params;
    const lot = await getInventoryLotById(user.id, id);
    return NextResponse.json(lot);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = EditLotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const lot = await updateInventoryLot(user.id, id, parsed.data);
    return NextResponse.json(lot);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthUser();
    const { id } = await ctx.params;
    await deleteInventoryLot(user.id, id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}
