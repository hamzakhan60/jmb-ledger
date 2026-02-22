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
    <div className="p-6 space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage your card lots and purchases
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Purchase
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="p-4 border-border rounded-xl">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-input-background"
              />
            </div>
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryTable
            filters={filters}
            onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            onEdit={handleEdit}
          />
        </div>
        <div>
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
