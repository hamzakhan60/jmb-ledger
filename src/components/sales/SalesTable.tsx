"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, getGameColor, getGameDisplayName } from "@/lib/utils";
import { useSales } from "@/lib/query/sales";
import type { Sale, SaleFilters } from "@/types";
import { Info, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

function saleGross(s: Sale) {
  return s.qty_sold * s.sale_price_each;
}

function saleFees(s: Sale) {
  return s.platform_fee + s.processing_fee + s.shipping_cost + s.other_fees;
}

function saleMargin(s: Sale) {
  if (s.net_proceeds === 0) return 0;
  return (s.realized_profit / s.net_proceeds) * 100;
}

interface SalesTableProps {
  filters: SaleFilters;
  onPageChange?: (page: number) => void;
  onEdit?: (sale: Sale) => void;
  onDelete?: (sale: Sale) => void;
  onFIFOAudit?: (saleId: string) => void;
}

export function SalesTable({
  filters,
  onPageChange,
  onEdit,
  onDelete,
  onFIFOAudit,
}: SalesTableProps) {
  const { data, isLoading } = useSales(filters);
  const sales = data?.data ?? [];
  const page = data?.page ?? 1;
  const pageSize = data?.pageSize ?? 25;
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const totalGross = sales.reduce((sum, s) => sum + saleGross(s), 0);
  const totalProfit = sales.reduce((sum, s) => sum + s.realized_profit, 0);
  const avgMargin = totalGross !== 0 ? (totalProfit / totalGross) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="border-border rounded-xl overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="h-14 flex-1 rounded-lg" />
            <Skeleton className="h-14 flex-1 rounded-lg" />
            <Skeleton className="h-14 flex-1 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex gap-4 py-2">
                <Skeleton className="h-4 flex-1 max-w-[200px]" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="px-4 py-3 border-border rounded-xl flex-1">
          <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
          <p className="text-lg font-medium">{formatCurrency(totalGross)}</p>
        </Card>
        <Card className="px-4 py-3 border-border rounded-xl flex-1">
          <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
          <p className={`text-lg font-medium ${totalProfit >= 0 ? "text-profit" : "text-loss"}`}>
            {formatCurrency(totalProfit)}
          </p>
        </Card>
        <Card className="px-4 py-3 border-border rounded-xl flex-1">
          <p className="text-xs text-muted-foreground mb-1">Avg Margin</p>
          <p className={`text-lg font-medium ${avgMargin >= 0 ? "text-profit" : "text-loss"}`}>
            {avgMargin.toFixed(1)}%
          </p>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Card</th>
                  <th className="text-left p-4 text-sm font-medium">Platform</th>
                  <th className="text-left p-4 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-sm font-medium">Qty</th>
                  <th className="text-left p-4 text-sm font-medium">Gross</th>
                  <th className="text-left p-4 text-sm font-medium">Fees</th>
                  <th className="text-left p-4 text-sm font-medium">Net</th>
                  <th className="text-left p-4 text-sm font-medium">Profit</th>
                  <th className="text-left p-4 text-sm font-medium">Margin</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground text-sm">
                      No sales yet. Record a sale to see it here.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale, index) => (
                    <motion.tr
                      key={sale.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      whileHover={{ backgroundColor: "var(--muted)" }}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1 h-12 rounded-full shrink-0"
                            style={{ backgroundColor: getGameColor(sale.game) }}
                          />
                          <div>
                            <p className="text-sm font-medium">{sale.card_name}</p>
                            <p className="text-xs text-muted-foreground">{getGameDisplayName(sale.game)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {sale.platform}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">{formatDate(sale.sale_date)}</td>
                      <td className="p-4 text-sm">{sale.qty_sold}</td>
                      <td className="p-4 text-sm font-mono">{formatCurrency(saleGross(sale))}</td>
                      <td className="p-4 text-sm font-mono text-destructive">
                        -{formatCurrency(saleFees(sale))}
                      </td>
                      <td className="p-4 text-sm font-mono">{formatCurrency(sale.net_proceeds)}</td>
                      <td className="p-4">
                        <p
                          className={`text-sm font-mono ${
                            sale.realized_profit >= 0 ? "text-profit" : "text-loss"
                          }`}
                        >
                          {sale.realized_profit >= 0 ? "+" : ""}
                          {formatCurrency(sale.realized_profit)}
                        </p>
                      </td>
                      <td className="p-4">
                        <p
                          className={`text-sm ${
                            saleMargin(sale) >= 0 ? "text-profit" : "text-loss"
                          }`}
                        >
                          {saleMargin(sale).toFixed(1)}%
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {onFIFOAudit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onFIFOAudit(sale.id)}
                              aria-label="FIFO audit"
                            >
                              <Info className="w-4 h-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onEdit(sale)}
                              aria-label="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => onDelete(sale)}
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onPageChange?.(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => onPageChange?.(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </>
  );
}
