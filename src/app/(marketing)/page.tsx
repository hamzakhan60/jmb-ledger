"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        <h1 className="text-4xl font-bold mb-4">JMB Card Ledger</h1>
        <p className="text-muted-foreground mb-8">
          Track inventory, FIFO profit after fees, and subscriptions for
          Pokémon, Yu-Gi-Oh!, and Riftbound.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
