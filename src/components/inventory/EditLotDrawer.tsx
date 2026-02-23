"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditLotSchema, type EditLotPayload } from "@/lib/validators/inventory";
import { useEditInventoryLot } from "@/lib/query/inventory";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryLot } from "@/types";
import { useEffect, useState } from "react";

const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"] as const;

interface EditLotDrawerProps {
  lot: InventoryLot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLotDrawer({ lot, open, onOpenChange }: EditLotDrawerProps) {
  const editLot = useEditInventoryLot();
  const [key, setKey] = useState(0);

  const form = useForm<EditLotPayload>({
    resolver: zodResolver(EditLotSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (lot) {
      form.reset({
        game: lot.game,
        card_name: lot.card_name,
        set_name: lot.set_name,
        variant: lot.variant,
        condition: lot.condition,
        qty_initial: lot.qty_initial,
        purchase_date: lot.purchase_date,
        vendor: lot.vendor ?? "",
        total_cost: lot.total_cost,
      });
      setKey((k) => k + 1);
    }
  }, [lot, form]);

  async function onSubmit(values: EditLotPayload) {
    if (!lot) return;
    await editLot.mutateAsync({ id: lot.id, payload: values });
    onOpenChange(false);
  }

  if (!lot) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full sm:max-w-[480px] ml-auto flex flex-col h-full" key={key}>
        <DrawerHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-5 shrink-0">
          <DrawerTitle className="text-base sm:text-lg">Edit lot</DrawerTitle>
        </DrawerHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <Form {...form}>
            {/* Scrollable fields area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="card_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Card name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-8 sm:h-9 text-xs sm:text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="set_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Set name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-8 sm:h-9 text-xs sm:text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Condition</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c} className="text-xs sm:text-sm">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Qty + Total cost side by side */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="qty_initial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          className="h-8 sm:h-9 text-xs sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Total cost ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="h-8 sm:h-9 text-xs sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>

          {/* Sticky footer */}
          <DrawerFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border shrink-0">
            <Button
              type="submit"
              disabled={editLot.isPending}
              className="w-full h-8 sm:h-9 text-xs sm:text-sm"
            >
              {editLot.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}