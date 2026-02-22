import { createSupabaseServerClient } from "./server";
import type { DashboardStats } from "@/types";

type Period = "7d" | "30d" | "90d";

function daysForPeriod(period: Period): number {
  switch (period) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return 30;
  }
}

export async function getDashboardStats(
  userId: string,
  period: Period
): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();
  const days = daysForPeriod(period);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromStr = fromDate.toISOString().split("T")[0];

  const { data: viewRows, error: viewError } = await supabase
    .from("user_daily_profit")
    .select("day, daily_profit, daily_revenue, daily_fees")
    .eq("user_id", userId)
    .gte("day", fromStr)
    .order("day", { ascending: true });

  if (viewError) {
    const { data: fallback } = await supabase
      .from("sales")
      .select("realized_profit, net_proceeds, platform_fee, processing_fee, shipping_cost, other_fees")
      .eq("user_id", userId)
      .gte("sale_date", fromStr);

    const totalProfit = (fallback ?? []).reduce((s, r) => s + Number(r.realized_profit), 0);
    const totalRevenue = (fallback ?? []).reduce((s, r) => s + Number(r.net_proceeds), 0);
    const totalFees = (fallback ?? []).reduce(
      (s, r) =>
        s +
        Number(r.platform_fee) +
        Number(r.processing_fee) +
        Number(r.shipping_cost) +
        Number(r.other_fees),
      0
    );

    const { count: cardsCount } = await supabase
      .from("inventory_lots")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("qty_on_hand", 0);

    const { count: lotsCount } = await supabase
      .from("inventory_lots")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const { data: invRows } = await supabase
      .from("inventory_lots")
      .select("qty_on_hand, cost_per_card")
      .eq("user_id", userId)
      .gt("qty_on_hand", 0);

    const inventory_estimated_value = (invRows ?? []).reduce(
      (s, r) => s + Number(r.qty_on_hand) * Number(r.cost_per_card),
      0
    );

    const profitByPeriod = (fallback ?? []).reduce(
      (acc: { date: string; profit: number }[], r: Record<string, unknown>) => {
        const d = (r.sale_date as string).split("T")[0];
        const p = Number(r.realized_profit);
        const existing = acc.find((x) => x.date === d);
        if (existing) existing.profit += p;
        else acc.push({ date: d, profit: p });
        return acc;
      },
      []
    );
    profitByPeriod.sort((a, b) => a.date.localeCompare(b.date));

    return {
      total_profit: totalProfit,
      total_revenue: totalRevenue,
      total_fees: totalFees,
      cards_on_hand: cardsCount ?? 0,
      active_lots: lotsCount ?? 0,
      inventory_estimated_value,
      profit_by_period: profitByPeriod,
    };
  }

  const totalProfit = (viewRows ?? []).reduce(
    (s, r) => s + Number(r.daily_profit ?? 0),
    0
  );
  const totalRevenue = (viewRows ?? []).reduce(
    (s, r) => s + Number(r.daily_revenue ?? 0),
    0
  );
  const totalFees = (viewRows ?? []).reduce(
    (s, r) =>
      s +
      Number(r.daily_fees ?? 0),
    0
  );

  const { count: cardsCount } = await supabase
    .from("inventory_lots")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gt("qty_on_hand", 0);

  const { count: lotsCount } = await supabase
    .from("inventory_lots")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: invRows } = await supabase
    .from("inventory_lots")
    .select("qty_on_hand, cost_per_card")
    .eq("user_id", userId)
    .gt("qty_on_hand", 0);

  const inventory_estimated_value = (invRows ?? []).reduce(
    (s, r) => s + Number(r.qty_on_hand) * Number(r.cost_per_card),
    0
  );

  const profit_by_period = (viewRows ?? []).map((r) => ({
    date: (r.day as string).split("T")[0],
    profit: Number(r.daily_profit ?? 0),
  }));

  return {
    total_profit: totalProfit,
    total_revenue: totalRevenue,
    total_fees: totalFees,
    cards_on_hand: cardsCount ?? 0,
    active_lots: lotsCount ?? 0,
    inventory_estimated_value,
    profit_by_period,
  };
}
