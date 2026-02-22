"use client";

import { motion } from "motion/react";

export default function PartnersPage() {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Partners</h1>
        <p className="text-muted-foreground text-sm">
          Dealer waitlist and partner program.
        </p>
      </motion.div>
    </div>
  );
}
