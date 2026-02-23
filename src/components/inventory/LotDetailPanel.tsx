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
        <CardContent className="py-6 sm:py-8 text-center text-muted-foreground text-sm">
          Select a lot to view details
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-5 sm:pb-3">
        <div className="flex items-start gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn("text-xs shrink-0 mt-0.5", gameColors[lot.game] ?? "")}
          >
            {lot.game}
          </Badge>
          <CardTitle className="text-base sm:text-lg leading-snug">{lot.card_name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-5">
        {/* Two-column grid on sm+, single column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          <DetailRow label="Set" value={lot.set_name} />
          <DetailRow label="Variant" value={lot.variant || "—"} />
          <DetailRow label="Condition" value={lot.condition} />
          <DetailRow label="Qty on hand" value={`${lot.qty_on_hand} / ${lot.qty_initial}`} />
          <DetailRow label="Cost per card" value={formatCurrency(lot.cost_per_card)} />
          <DetailRow label="Total cost" value={formatCurrency(lot.total_cost)} />
          <DetailRow label="Purchase date" value={formatDate(lot.purchase_date)} />
          {lot.vendor && <DetailRow label="Vendor" value={lot.vendor} />}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs sm:text-sm flex items-baseline gap-1 min-w-0">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="truncate">{value}</span>
    </p>
  );
}