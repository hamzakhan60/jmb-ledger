import { createSupabaseServerClient } from "./server";
import type {
  InventoryLot,
  InventoryFilters,
  PaginatedResponse,
  CardIdentity,
} from "@/types";
import type { CreateLotPayload, EditLotPayload } from "@/lib/validators/inventory";

function toLot(row: Record<string, unknown>): InventoryLot {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    game: row.game as InventoryLot["game"],
    card_name: row.card_name as string,
    set_name: row.set_name as string,
    variant: (row.variant as string) ?? "",
    condition: row.condition as InventoryLot["condition"],
    qty_on_hand: Number(row.qty_on_hand),
    qty_initial: Number(row.qty_initial),
    purchase_date: (row.purchase_date as string).split("T")[0],
    vendor: (row.vendor as string) ?? null,
    total_cost: Number(row.total_cost),
    cost_per_card: Number(row.cost_per_card),
    created_at: row.created_at as string,
  };
}

export async function getInventoryLots(
  userId: string,
  filters: InventoryFilters
): Promise<PaginatedResponse<InventoryLot>> {
  const supabase = await createSupabaseServerClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("inventory_lots")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("purchase_date", { ascending: true });

  if (filters.game) query = query.eq("game", filters.game);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.search?.trim()) {
    query = query.ilike("card_name", `%${filters.search.trim()}%`);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) throw new Error(error.message);

  const totalCount = count ?? (data?.length ?? 0);
  const lots = (data ?? []).map((row) => toLot(row as Record<string, unknown>));

  return {
    data: lots,
    totalCount,
    page,
    pageSize,
  };
}

export async function getInventoryLotById(
  userId: string,
  id: string
): Promise<InventoryLot> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inventory_lots")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Lot not found");
  return toLot(data as Record<string, unknown>);
}

export async function createInventoryLot(
  userId: string,
  payload: CreateLotPayload
): Promise<InventoryLot> {
  const supabase = await createSupabaseServerClient();
  const qty = payload.qty_initial;
  const totalCost = payload.total_cost;
  const costPerCard = qty > 0 ? totalCost / qty : 0;

  const { data, error } = await supabase
    .from("inventory_lots")
    .insert({
      user_id: userId,
      game: payload.game,
      card_name: payload.card_name,
      set_name: payload.set_name,
      variant: payload.variant ?? "",
      condition: payload.condition,
      qty_on_hand: qty,
      qty_initial: qty,
      purchase_date: payload.purchase_date,
      vendor: payload.vendor ?? null,
      total_cost: totalCost,
      cost_per_card: costPerCard,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toLot(data as Record<string, unknown>);
}

export async function updateInventoryLot(
  userId: string,
  id: string,
  payload: EditLotPayload
): Promise<InventoryLot> {
  const supabase = await createSupabaseServerClient();
  const existing = await getInventoryLotById(userId, id);

  const updates: Record<string, unknown> = { ...payload };
  if (payload.qty_initial !== undefined && payload.total_cost !== undefined) {
    const qty = payload.qty_initial;
    updates.cost_per_card = qty > 0 ? payload.total_cost / qty : existing.cost_per_card;
    updates.qty_on_hand = existing.qty_on_hand - existing.qty_initial + qty;
  } else if (payload.qty_initial !== undefined) {
    updates.qty_on_hand = existing.qty_on_hand - existing.qty_initial + payload.qty_initial;
  }
  if (payload.total_cost !== undefined && payload.qty_initial === undefined) {
    const qty = existing.qty_initial;
    updates.cost_per_card = qty > 0 ? payload.total_cost / qty : existing.cost_per_card;
  }

  const { data, error } = await supabase
    .from("inventory_lots")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toLot(data as Record<string, unknown>);
}

export async function deleteInventoryLot(
  userId: string,
  id: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const lot = await getInventoryLotById(userId, id);

  const { count } = await supabase
    .from("fifo_consumption")
    .select("id", { count: "exact", head: true })
    .eq("inventory_lot_id", id);

  if (count && count > 0) {
    const err = new Error("Cannot delete lot with linked sales (FIFO consumption exists).");
    (err as Error & { code?: string }).code = "LOT_HAS_SALES";
    throw err;
  }

  const { error } = await supabase
    .from("inventory_lots")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function getAvailableQtyForCard(
  userId: string,
  identity: CardIdentity
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("inventory_lots")
    .select("qty_on_hand")
    .eq("user_id", userId)
    .eq("game", identity.game)
    .eq("card_name", identity.card_name)
    .eq("set_name", identity.set_name)
    .eq("variant", identity.variant ?? "")
    .eq("condition", identity.condition)
    .gt("qty_on_hand", 0);

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  const total = (data ?? []).reduce((sum, row) => sum + Number(row.qty_on_hand), 0);
  return total;
}
