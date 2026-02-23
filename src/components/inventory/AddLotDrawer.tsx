"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateLotSchema, type CreateLotPayload } from "@/lib/validators/inventory";
import { useAddInventoryLot } from "@/lib/query/inventory";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

const GAMES = ["pokemon", "yugioh", "riftbound"] as const;
const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"] as const;

interface AddLotDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddLotDrawer({ open: controlledOpen, onOpenChange }: AddLotDrawerProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const addLot = useAddInventoryLot();

  const form = useForm<CreateLotPayload>({
    resolver: zodResolver(CreateLotSchema) as Resolver<CreateLotPayload>,
    defaultValues: {
      game: "pokemon",
      card_name: "",
      set_name: "",
      variant: "",
      condition: "NM",
      qty_initial: 1,
      purchase_date: new Date().toISOString().split("T")[0],
      vendor: "",
      total_cost: 0,
    },
  });

  async function onSubmit(values: CreateLotPayload) {
    await addLot.mutateAsync(values);
    form.reset();
    setOpen(false);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      {controlledOpen == null && (
        <DrawerTrigger asChild>
          <Button>
            <Plus className="size-4 mr-2" />
            Add lot
          </Button>
        </DrawerTrigger>
      )}
      {/* Full-width on mobile, fixed width on sm+ */}
      <DrawerContent className="w-full sm:max-w-[480px] ml-auto flex flex-col h-full">
        <DrawerHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-5 shrink-0">
          <DrawerTitle className="text-base sm:text-lg">Add Inventory Lot</DrawerTitle>
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
                name="game"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Game</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GAMES.map((g) => (
                          <SelectItem key={g} value={g} className="text-xs sm:text-sm">
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
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
                name="variant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Variant (optional)</FormLabel>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              {/* Qty + Purchase date side by side on sm+ */}
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
                  name="purchase_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Purchase date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-8 sm:h-9 text-xs sm:text-sm" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Vendor + Total cost side by side on sm+ */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm">Vendor (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} className="h-8 sm:h-9 text-xs sm:text-sm" />
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
              disabled={addLot.isPending}
              className="w-full h-8 sm:h-9 text-xs sm:text-sm"
            >
              {addLot.isPending ? "Adding..." : "Add lot"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}