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
      <DrawerContent className="max-w-[480px] w-full ml-auto" key={key}>
        <DrawerHeader>
          <DrawerTitle>Edit lot</DrawerTitle>
        </DrawerHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-4 pb-4"
        >
          <Form {...form}>
            <FormField
              control={form.control}
              name="card_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="set_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Set name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONDITIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qty_initial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
          <DrawerFooter>
            <Button type="submit" disabled={editLot.isPending}>
              Save changes
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
