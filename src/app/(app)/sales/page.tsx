"use client";

import { useState } from "react";
import { SalesTable } from "@/components/sales/SalesTable";
import { RecordSaleDrawer } from "@/components/sales/RecordSaleDrawer";
import { FIFOAuditModal } from "@/components/sales/FIFOAuditModal";
import type { SaleFilters } from "@/types";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SalesPage() {
  const [filters, setFilters] = useState<SaleFilters>({
    page: 1,
    pageSize: 25,
  });
  const [fifoAuditSaleId, setFifoAuditSaleId] = useState<string | null>(null);
  const [fifoAuditOpen, setFifoAuditOpen] = useState(false);
  const [recordSaleOpen, setRecordSaleOpen] = useState(false);

  function handleFIFOAudit(saleId: string) {
    setFifoAuditSaleId(saleId);
    setFifoAuditOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Sales</h1>
          <p className="text-sm text-muted-foreground">
            Record and track all your card sales
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setRecordSaleOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Record Sale
        </Button>
        <RecordSaleDrawer open={recordSaleOpen} onOpenChange={setRecordSaleOpen} />
      </motion.div>

      <SalesTable
        filters={filters}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        onFIFOAudit={handleFIFOAudit}
      />

      <FIFOAuditModal
        saleId={fifoAuditSaleId}
        open={fifoAuditOpen}
        onOpenChange={setFifoAuditOpen}
      />
    </div>
  );
}
