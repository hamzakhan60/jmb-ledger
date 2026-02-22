"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InventoryLot } from "@/types";
import { cn } from "@/lib/utils";

const gameColors: Record<string, string> = {
  pokemon: "bg-game-pokemon/20 text-game-pokemon border-game-pokemon/30",
  yugioh: "bg-game-yugioh/20 text-game-yugioh border-game-yugioh/30",
  riftbound: "bg-game-riftbound/20 text-game-riftbound border-game-riftbound/30",
};

interface LotDetailPanelProps {
  lot: InventoryLot | null;
}

export function LotDetailPanel({ lot }: LotDetailPanelProps) {
  if (!lot) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Select a lot to view details
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-xs", gameColors[lot.game] ?? "")}
          >
            {lot.game}
          </Badge>
          <CardTitle className="text-lg">{lot.card_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="text-muted-foreground">Set:</span> {lot.set_name}
        </p>
        <p>
          <span className="text-muted-foreground">Variant:</span>{" "}
          {lot.variant || "—"}
        </p>
        <p>
          <span className="text-muted-foreground">Condition:</span>{" "}
          {lot.condition}
        </p>
        <p>
          <span className="text-muted-foreground">Qty on hand:</span>{" "}
          {lot.qty_on_hand} / {lot.qty_initial}
        </p>
        <p>
          <span className="text-muted-foreground">Cost per card:</span>{" "}
          {formatCurrency(lot.cost_per_card)}
        </p>
        <p>
          <span className="text-muted-foreground">Total cost:</span>{" "}
          {formatCurrency(lot.total_cost)}
        </p>
        <p>
          <span className="text-muted-foreground">Purchase date:</span>{" "}
          {formatDate(lot.purchase_date)}
        </p>
        {lot.vendor && (
          <p>
            <span className="text-muted-foreground">Vendor:</span> {lot.vendor}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
