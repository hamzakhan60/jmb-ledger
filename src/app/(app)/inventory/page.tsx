"use client";

import { useState } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { AddLotDrawer } from "@/components/inventory/AddLotDrawer";
import { EditLotDrawer } from "@/components/inventory/EditLotDrawer";
import { LotDetailPanel } from "@/components/inventory/LotDetailPanel";
import type { InventoryLot } from "@/types";
import type { InventoryFilters } from "@/types";
import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";

export default function InventoryPage() {
  const [filters, setFilters] = useState<InventoryFilters>({
    page: 1,
    pageSize: 25,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLot, setEditingLot] = useState<InventoryLot | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  function handleEdit(lot: InventoryLot) {
    setEditingLot(lot);
    setEditOpen(true);
  }

  function handleSearch() {
    setFilters((f) => ({ ...f, search: searchTerm || undefined, page: 1 }));
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
          <h1 className="text-xl sm:text-2xl font-bold">Inventory</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your card lots and purchases
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="shrink-0">
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-4"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Add Purchase</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="p-3 sm:p-4 border-border rounded-xl">
          <div className="flex gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-8 sm:pl-10 bg-input-background text-sm h-8 sm:h-9"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch} className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="lg:col-span-2 min-w-0">
          <InventoryTable
            filters={filters}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onEdit={handleEdit}
          />
        </div>
        <div className="min-w-0">
          <LotDetailPanel lot={editingLot} />
        </div>
      </div>

      <AddLotDrawer open={addOpen} onOpenChange={setAddOpen} />
      <EditLotDrawer
        lot={editingLot}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}