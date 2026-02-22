"use client";

import { formatCurrency } from "@/lib/utils";

interface FIFOPreviewProps {
  netProceeds: number;
  estimatedCostBasis: number;
}

export function FIFOPreview({
  netProceeds,
  estimatedCostBasis,
}: FIFOPreviewProps) {
  const estimatedProfit = netProceeds - estimatedCostBasis;

  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-sm">
      <p className="text-muted-foreground">
        Net proceeds: {formatCurrency(netProceeds)}
      </p>
      <p className="text-muted-foreground">
        Est. cost basis (FIFO): {formatCurrency(estimatedCostBasis)}
      </p>
      <p
        className={
          estimatedProfit >= 0 ? "font-medium text-profit" : "font-medium text-loss"
        }
      >
        Est. profit: {formatCurrency(estimatedProfit)}
      </p>
    </div>
  );
}
