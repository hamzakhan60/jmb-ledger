"use client";

import { motion } from "motion/react";

export default function MarketPage() {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Market</h1>
        <p className="text-muted-foreground text-sm mb-4">
          Price estimates and market data.
        </p>
        <p className="text-sm text-muted-foreground">
          Market values shown are estimates or user-provided.
        </p>
      </motion.div>
    </div>
  );
}
