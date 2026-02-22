import { createSupabaseServerClient } from "./server";
import type { Sale, SaleFilters, PaginatedResponse, FIFOConsumption } from "@/types";
import type { RecordSalePayload, EditSalePayload } from "@/lib/validators/sales";
import { runFIFOAllocation } from "./fifo";
import { recalculateFIFOForCard } from "./fifo";

function toSale(row: Record<string, unknown>): Sale {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    sale_date: (row.sale_date as string).split("T")[0],
    platform: row.platform as string,
    card_name: row.card_name as string,
    game: row.game as Sale["game"],
    set_name: row.set_name as string,
    variant: (row.variant as string) ?? "",
    condition: row.condition as Sale["condition"],
    qty_sold: Number(row.qty_sold),
    sale_price_each: Number(row.sale_price_each),
    platform_fee: Number(row.platform_fee),
    processing_fee: Number(row.processing_fee),
    shipping_cost: Number(row.shipping_cost),
    other_fees: Number(row.other_fees),
    net_proceeds: Number(row.net_proceeds),
    cost_basis_used: Number(row.cost_basis_used),
    realized_profit: Number(row.realized_profit),
    created_at: row.created_at as string,
  };
}

export async function getSales(
  userId: string,
  filters: SaleFilters
): Promise<PaginatedResponse<Sale>> {
  const supabase = await createSupabaseServerClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("sales")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("sale_date", { ascending: false });

  if (filters.game) query = query.eq("game", filters.game);
  if (filters.platform) query = query.eq("platform", filters.platform);
  if (filters.search?.trim()) {
    query = query.ilike("card_name", `%${filters.search.trim()}%`);
  }

  const { data, count, error } = await query.range(from, to);

  if (error) throw new Error(error.message);

  const totalCount = count ?? (data?.length ?? 0);
  const sales = (data ?? []).map((row) => toSale(row as Record<string, unknown>));

  return {
    data: sales,
    totalCount,
    page,
    pageSize,
  };
}

export async function getSaleById(
  userId: string,
  id: string
): Promise<Sale> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Sale not found");
  return toSale(data as Record<string, unknown>);
}

function netProceedsFromPayload(p: RecordSalePayload): number {
  const gross = p.qty_sold * p.sale_price_each;
  const fees =
    (p.platform_fee ?? 0) +
    (p.processing_fee ?? 0) +
    (p.shipping_cost ?? 0) +
    (p.other_fees ?? 0);
  return gross - fees;
}

export async function createSale(
  userId: string,
  payload: RecordSalePayload
): Promise<Sale> {
  const supabase = await createSupabaseServerClient();
  const netProceeds = netProceedsFromPayload(payload);

  const { data: saleRow, error: insertError } = await supabase
    .from("sales")
    .insert({
      user_id: userId,
      sale_date: payload.sale_date,
      platform: payload.platform,
      card_name: payload.card_name,
      game: payload.game,
      set_name: payload.set_name,
      variant: payload.variant ?? "",
      condition: payload.condition,
      qty_sold: payload.qty_sold,
      sale_price_each: payload.sale_price_each,
      platform_fee: payload.platform_fee ?? 0,
      processing_fee: payload.processing_fee ?? 0,
      shipping_cost: payload.shipping_cost ?? 0,
      other_fees: payload.other_fees ?? 0,
      net_proceeds: netProceeds,
      cost_basis_used: 0,
      realized_profit: 0,
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);
  const saleId = (saleRow as Record<string, unknown>).id as string;

  const { costBasis, profit } = await runFIFOAllocation(
    userId,
    saleId,
    {
      game: payload.game,
      card_name: payload.card_name,
      set_name: payload.set_name,
      variant: payload.variant ?? "",
      condition: payload.condition,
    },
    payload.qty_sold,
    netProceeds
  );

  const { data: updated, error: updateError } = await supabase
    .from("sales")
    .update({ cost_basis_used: costBasis, realized_profit: profit })
    .eq("id", saleId)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);
  return toSale(updated as Record<string, unknown>);
}

export async function updateSale(
  userId: string,
  id: string,
  payload: EditSalePayload
): Promise<Sale> {
  const supabase = await createSupabaseServerClient();
  const existing = await getSaleById(userId, id);

  const saleDate = (payload.sale_date ?? existing.sale_date).toString();
  const platform = payload.platform ?? existing.platform;
  const cardName = payload.card_name ?? existing.card_name;
  const game = payload.game ?? existing.game;
  const setName = payload.set_name ?? existing.set_name;
  const variant = payload.variant ?? existing.variant;
  const condition = payload.condition ?? existing.condition;
  const qtySold = payload.qty_sold ?? existing.qty_sold;
  const salePriceEach = payload.sale_price_each ?? existing.sale_price_each;
  const platformFee = payload.platform_fee ?? existing.platform_fee;
  const processingFee = payload.processing_fee ?? existing.processing_fee;
  const shippingCost = payload.shipping_cost ?? existing.shipping_cost;
  const otherFees = payload.other_fees ?? existing.other_fees;
  const netProceeds =
    qtySold * salePriceEach - platformFee - processingFee - shippingCost - otherFees;

  const { data, error } = await supabase
    .from("sales")
    .update({
      sale_date: saleDate,
      platform,
      card_name: cardName,
      game,
      set_name: setName,
      variant,
      condition,
      qty_sold: qtySold,
      sale_price_each: salePriceEach,
      platform_fee: platformFee,
      processing_fee: processingFee,
      shipping_cost: shippingCost,
      other_fees: otherFees,
      net_proceeds: netProceeds,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await recalculateFIFOForCard(userId, {
    game,
    card_name: cardName,
    set_name: setName,
    variant,
    condition,
  });

  const afterRecalc = await getSaleById(userId, id);
  return afterRecalc;
}

export async function deleteSale(userId: string, id: string): Promise<void> {
  const existing = await getSaleById(userId, id);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  await recalculateFIFOForCard(userId, {
    game: existing.game,
    card_name: existing.card_name,
    set_name: existing.set_name,
    variant: existing.variant,
    condition: existing.condition,
  });
}

export async function getFIFOConsumptionsForSale(
  userId: string,
  saleId: string
): Promise<FIFOConsumption[]> {
  const supabase = await createSupabaseServerClient();
  const { data: sale } = await supabase
    .from("sales")
    .select("id")
    .eq("id", saleId)
    .eq("user_id", userId)
    .single();

  if (!sale) throw new Error("Sale not found");

  const { data, error } = await supabase
    .from("fifo_consumption")
    .select("*")
    .eq("sale_id", saleId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    sale_id: row.sale_id,
    inventory_lot_id: row.inventory_lot_id,
    qty_taken: Number(row.qty_taken),
    cost_per_card: Number(row.cost_per_card),
    cost_total: Number(row.cost_total),
  }));
}
