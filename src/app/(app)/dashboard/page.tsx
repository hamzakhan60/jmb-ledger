"use client";

import { useState } from "react";
import { useDashboardStats } from "@/lib/query/dashboard";
import { useSales } from "@/lib/query/sales";
import { KPICard } from "@/components/dashboard/KPICard";
import { ProfitChart } from "@/components/dashboard/ProfitChart";
import { RecentSalesTable } from "@/components/dashboard/RecentSalesTable";
import { TrendingUp, Package, DollarSign, Receipt } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { formatCurrency, getGameColor, getGameDisplayName } from "@/lib/utils";
import type { Sale } from "@/types";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const { data: stats, isLoading: statsLoading } = useDashboardStats(period);
  const { data: salesData } = useSales({ page: 1, pageSize: 10 });
  const recentSales = salesData?.data ?? [];
  const topCards = [...recentSales].sort(
    (a, b) => b.realized_profit - a.realized_profit
  ).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s your card business at a glance.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <KPICard
            title="Total Realized Profit"
            value={stats?.total_profit ?? 0}
            icon={TrendingUp}
            trend={(stats?.total_profit ?? 0) >= 0 ? "up" : "down"}
            isLoading={statsLoading}
            className="border-border rounded-xl relative overflow-hidden glow-primary"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <KPICard
            title="Total Revenue"
            value={stats?.total_revenue ?? 0}
            icon={DollarSign}
            isLoading={statsLoading}
            className="border-border rounded-xl glow-secondary"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <KPICard
            title="Cards on Hand"
            value={stats?.cards_on_hand ?? 0}
            icon={Package}
            isLoading={statsLoading}
            className="border-border rounded-xl glow-accent"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <KPICard
            title="Active Lots"
            value={stats?.active_lots ?? 0}
            icon={Receipt}
            isLoading={statsLoading}
            className="border-border rounded-xl"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfitChart
          data={stats?.profit_by_period ?? []}
          isLoading={statsLoading}
          period={period}
          onPeriodChange={setPeriod}
        />

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <RecentSalesTable
            sales={recentSales}
            isLoading={statsLoading}
          />
          <Card className="p-6 border-border rounded-xl">
            <h3 className="mb-4 font-medium">Top Performing Cards</h3>
            <div className="space-y-3">
              {topCards.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales yet</p>
              ) : (
                topCards.map((sale: Sale, index: number) => (
                  <motion.div
                    key={sale.id}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{
                        backgroundColor: `${getGameColor(sale.game)}20`,
                        color: getGameColor(sale.game),
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{sale.card_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getGameDisplayName(sale.game)}
                      </p>
                    </div>
                    <p
                      className={`text-sm shrink-0 ${
                        sale.realized_profit >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {sale.realized_profit >= 0 ? "+" : ""}
                      {formatCurrency(sale.realized_profit)}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
