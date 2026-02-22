"use client";

import { motion } from "motion/react";

export default function ReportsPage() {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm">
          Custom reports and exports.
        </p>
      </motion.div>
    </div>
  );
}
