import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/supabase/auth";
import { getInventoryLots, createInventoryLot } from "@/lib/supabase/inventory";
import { CreateLotSchema, InventoryFiltersSchema } from "@/lib/validators/inventory";
import type { InventoryFilters } from "@/types";

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
    const { searchParams } = req.nextUrl;
    const parsed = InventoryFiltersSchema.safeParse({
      game: searchParams.get("game") || undefined,
      search: searchParams.get("search") || undefined,
      condition: searchParams.get("condition") || undefined,
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || "25",
    });
    const filters: InventoryFilters = parsed.success
      ? parsed.data
      : { page: 1, pageSize: 25 };
    const result = await getInventoryLots(user.id, filters);
    return NextResponse.json(result);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthUser();
    const body = await req.json();
    const parsed = CreateLotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const lot = await createInventoryLot(user.id, parsed.data);
    return NextResponse.json(lot, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
