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
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>FIFO allocation</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground mb-2">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lot</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(consumptions as FIFOConsumption[]).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">
                    {row.inventory_lot_id.slice(0, 8)}…
                  </TableCell>
                  <TableCell>{row.qty_taken}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.cost_total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
