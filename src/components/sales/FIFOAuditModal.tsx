"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useFIFOAudit } from "@/lib/query/sales";
import type { FIFOConsumption } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface FIFOAuditModalProps {
  saleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FIFOAuditModal({
  saleId,
  open,
  onOpenChange,
}: FIFOAuditModalProps) {
  const { data: consumptions, isLoading } = useFIFOAudit(open ? saleId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Full-width on mobile with margin, capped on sm+ */}
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[480px] p-4 sm:p-6">
        <DialogHeader className="mb-1 sm:mb-2">
          <DialogTitle className="text-base sm:text-lg">FIFO allocation</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground mb-3">
          Market values shown are estimates or user-provided.
        </p>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : !consumptions?.length ? (
          <p className="text-sm text-muted-foreground">No consumption records.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[280px] px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Lot</TableHead>
                    <TableHead className="text-xs sm:text-sm">Qty</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(consumptions as FIFOConsumption[]).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs py-2 sm:py-4">
                        {row.inventory_lot_id.slice(0, 8)}…
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                        {row.qty_taken}
                      </TableCell>
                      <TableCell className="text-right text-xs sm:text-sm py-2 sm:py-4">
                        {formatCurrency(row.cost_total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}