'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';

export default function SettingsPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Plan and upgrade options
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <Card className="p-4 sm:p-5 md:p-6 border-border rounded-xl space-y-3 sm:space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            View your current plan and upgrade options.
          </p>
          <Button asChild variant="outline" className="h-8 sm:h-9 text-xs sm:text-sm">
            <Link href="/settings/plan">Go to Plan & Billing</Link>
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
