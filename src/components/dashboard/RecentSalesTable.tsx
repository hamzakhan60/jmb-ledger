"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface RecentSalesTableProps {
  sales: Sale[];
  isLoading?: boolean;
}

export function RecentSalesTable({ sales, isLoading }: RecentSalesTableProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border-border rounded-xl">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const margin = (s: Sale) =>
    s.net_proceeds !== 0 ? (s.realized_profit / s.net_proceeds) * 100 : 0;

  return (
    <Card className="p-6 border-border rounded-xl">
      <h3 className="mb-4 font-medium">Recent Sales</h3>
      <div className="space-y-3">
        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No sales yet</p>
        ) : (
          sales.slice(0, 5).map((sale, index) => (
            <motion.div
              key={sale.id}
              className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
            >
              <div>
                <p className="text-sm">{sale.card_name}</p>
                <p className="text-xs text-muted-foreground">
                  {sale.platform} • {sale.qty_sold}x
                </p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm",
                    sale.realized_profit >= 0 ? "text-profit" : "text-loss"
                  )}
                >
                  {sale.realized_profit >= 0 ? "+" : ""}
                  {formatCurrency(sale.realized_profit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {margin(sale).toFixed(1)}%
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}
