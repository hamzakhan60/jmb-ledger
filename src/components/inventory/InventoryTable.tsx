"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getGameColor, getGameDisplayName } from "@/lib/utils";
import { useInventoryLots } from "@/lib/query/inventory";
import type { InventoryLot, InventoryFilters } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryTableProps {
  filters: InventoryFilters;
  onPageChange?: (page: number) => void;
  onEdit?: (lot: InventoryLot) => void;
  onDelete?: (lot: InventoryLot) => void;
}

export function InventoryTable({
  filters,
  onPageChange,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  const { data, isLoading } = useInventoryLots(filters);
  const lots = data?.data ?? [];
  const page = data?.page ?? 1;
  const pageSize = data?.pageSize ?? 25;
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (isLoading) {
    return (
      <Card className="border-border rounded-xl overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex gap-4 py-2">
                <Skeleton className="h-4 flex-1 max-w-[180px]" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (lots.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-2">No inventory yet</p>
          <p className="text-sm text-muted-foreground">
            Start by adding your first inventory lot to track your card investments.
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Card</th>
                <th className="text-left p-4 text-sm font-medium">Set</th>
                <th className="text-left p-4 text-sm font-medium">Condition</th>
                <th className="text-left p-4 text-sm font-medium">Qty</th>
                <th className="text-left p-4 text-sm font-medium">Unit Cost</th>
                <th className="text-left p-4 text-sm font-medium">Total Cost</th>
                <th className="text-left p-4 text-sm font-medium">Market Est.</th>
                <th className="text-right p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot, index) => (
                <motion.tr
                  key={lot.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                  whileHover={{ backgroundColor: "var(--muted)" }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-12 rounded-full shrink-0"
                        style={{ backgroundColor: getGameColor(lot.game) }}
                      />
                      <div>
                        <p className="text-sm font-medium">{lot.card_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getGameDisplayName(lot.game)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{lot.set_name}</p>
                    {lot.variant ? (
                      <p className="text-xs text-muted-foreground">{lot.variant}</p>
                    ) : null}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-xs">
                      {lot.condition}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm">{lot.qty_on_hand}</p>
                      <p className="text-xs text-muted-foreground">of {lot.qty_initial}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-mono">
                    {formatCurrency(lot.cost_per_card)}
                  </td>
                  <td className="p-4 text-sm font-mono">
                    {formatCurrency(lot.total_cost)}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">—</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(lot)}
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDelete(lot)}
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
