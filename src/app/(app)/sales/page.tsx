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
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
      <motion.div
        className="flex items-start sm:items-center justify-between gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Sales</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Record and track all your card sales
          </p>
        </div>
        <div className="shrink-0">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-4"
            onClick={() => setRecordSaleOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Record Sale</span>
            <span className="xs:hidden">Record</span>
          </Button>
        </div>
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