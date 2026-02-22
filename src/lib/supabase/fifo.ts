import "server-only";
import { createSupabaseServerClient } from "./server";
import type { CardIdentity } from "@/types";

export async function runFIFOAllocation(
  userId: string,
  saleId: string,
  cardIdentity: CardIdentity,
  qtySold: number,
  netProceeds: number
): Promise<{ costBasis: number; profit: number }> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.rpc("run_fifo_allocation", {
    p_user_id: userId,
    p_sale_id: saleId,
    p_game: cardIdentity.game,
    p_card_name: cardIdentity.card_name,
    p_set_name: cardIdentity.set_name,
    p_variant: cardIdentity.variant ?? "",
    p_condition: cardIdentity.condition,
    p_qty_sold: qtySold,
    p_net_proceeds: netProceeds,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("FIFO allocation returned no data");

  const result = data as { cost_basis: number; profit: number };
  return {
    costBasis: Number(result.cost_basis),
    profit: Number(result.profit),
  };
}

export async function recalculateFIFOForCard(
  userId: string,
  cardIdentity: CardIdentity
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: sales } = await supabase
    .from("sales")
    .select("id, sale_date, qty_sold, net_proceeds")
    .eq("user_id", userId)
    .eq("game", cardIdentity.game)
    .eq("card_name", cardIdentity.card_name)
    .eq("set_name", cardIdentity.set_name)
    .eq("variant", cardIdentity.variant ?? "")
    .eq("condition", cardIdentity.condition)
    .order("sale_date", { ascending: true });

  const saleIds = (sales ?? []).map((s: { id: string }) => s.id);

  if (saleIds.length > 0) {
    await supabase.from("fifo_consumption").delete().in("sale_id", saleIds);
  }

  const { data: lots } = await supabase
    .from("inventory_lots")
    .select("id, qty_initial")
    .eq("user_id", userId)
    .eq("game", cardIdentity.game)
    .eq("card_name", cardIdentity.card_name)
    .eq("set_name", cardIdentity.set_name)
    .eq("variant", cardIdentity.variant ?? "")
    .eq("condition", cardIdentity.condition);

  for (const lot of lots ?? []) {
    await supabase
      .from("inventory_lots")
      .update({ qty_on_hand: lot.qty_initial })
      .eq("id", lot.id);
  }

  for (const sale of sales ?? []) {
    const sid = (sale as { id: string; qty_sold: number; net_proceeds: number }).id;
    const qtySold = Number((sale as { qty_sold: number }).qty_sold);
    const netProceeds = Number((sale as { net_proceeds: number }).net_proceeds);
    await runFIFOAllocation(
      userId,
      sid,
      cardIdentity,
      qtySold,
      netProceeds
    );
  }
}
