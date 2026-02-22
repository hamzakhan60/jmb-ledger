"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RecordSaleSchema,
  type RecordSalePayload,
} from "@/lib/validators/sales";
import { useRecordSale } from "@/lib/query/sales";
import { useInventoryLots } from "@/lib/query/inventory";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { formatCurrency } from "@/lib/utils";

const GAMES = ["pokemon", "yugioh", "riftbound"] as const;
const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"] as const;
const PLATFORMS = ["eBay", "TCGPlayer", "Facebook", "Local", "Other"] as const;

interface RecordSaleDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RecordSaleDrawer({ open: controlledOpen, onOpenChange }: RecordSaleDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const recordSale = useRecordSale();
  const { data: inventoryData } = useInventoryLots({ page: 1, pageSize: 200 });
  const lots = inventoryData?.data ?? [];

  const form = useForm<RecordSalePayload>({
    resolver: zodResolver(RecordSaleSchema) as import("react-hook-form").Resolver<RecordSalePayload>,
    defaultValues: {
      sale_date: new Date().toISOString().split("T")[0],
      platform: "",
      card_name: "",
      game: "pokemon",
      set_name: "",
      variant: "",
      condition: "NM",
      qty_sold: 1,
      sale_price_each: 0,
      platform_fee: 0,
      processing_fee: 0,
      shipping_cost: 0,
      other_fees: 0,
    },
  });

  const qtySold = form.watch("qty_sold") ?? 1;
  const salePriceEach = form.watch("sale_price_each") ?? 0;
  const platformFee = form.watch("platform_fee") ?? 0;
  const processingFee = form.watch("processing_fee") ?? 0;
  const shippingCost = form.watch("shipping_cost") ?? 0;
  const otherFees = form.watch("other_fees") ?? 0;

  const grossRevenue = qtySold * salePriceEach;
  const totalFees = platformFee + processingFee + shippingCost + otherFees;
  const netProceeds = grossRevenue - totalFees;
  const estimatedCostBasis = 0;
  const estimatedProfit = netProceeds - estimatedCostBasis;


  async function onSubmit(values: RecordSalePayload) {
    await recordSale.mutateAsync(values);
    form.reset();
    setOpen(false);
  }

  const triggerButton = (
    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
      <Plus className="w-4 h-4 mr-2" />
      Record Sale
    </Button>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      {controlledOpen == null && <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>}
      <DrawerContent className="w-full sm:max-w-[520px] ml-auto overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Record a Sale</DrawerTitle>
        </DrawerHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 px-4 pb-6 mt-6"
        >
          <Form {...form}>
            {/* Card Identity */}
            <div className="space-y-4">
              <h4 className="text-sm text-muted-foreground">Card Identity</h4>
              <FormField
                control={form.control}
                name="card_name"
                render={({ field }) => {
                  const currentLot = lots.find(
                    (l) =>
                      l.card_name === field.value &&
                      l.set_name === form.getValues("set_name") &&
                      l.game === form.getValues("game") &&
                      l.condition === form.getValues("condition")
                  );
                  return (
                    <FormItem>
                      <FormLabel>Card</FormLabel>
                      <Select
                        value={currentLot?.id ?? ""}
                        onValueChange={(id) => {
                          const lot = lots.find((l) => l.id === id);
                          if (lot) {
                            form.setValue("card_name", lot.card_name);
                            form.setValue("set_name", lot.set_name);
                            form.setValue("game", lot.game);
                            form.setValue("variant", lot.variant ?? "");
                            form.setValue("condition", lot.condition);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-input-background">
                            <SelectValue placeholder="Select from inventory..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lots.map((lot) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              {lot.card_name} ({lot.set_name}) — {lot.qty_on_hand} available
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="game"
                render={({ field }) => (
                  <FormItem className="sr-only">
                    <FormControl>
                      <input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="set_name"
                render={({ field }) => (
                  <FormItem className="sr-only">
                    <FormControl>
                      <input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="variant"
                render={({ field }) => (
                  <FormItem className="sr-only">
                    <FormControl>
                      <input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem className="sr-only">
                    <FormControl>
                      <input type="hidden" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qty_sold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity Sold</FormLabel>
                    <FormControl>
                      <Input
                        id="qty_sold"
                        type="number"
                        min={1}
                        className="bg-input-background"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sale Details */}
            <div className="space-y-4">
              <h4 className="text-sm text-muted-foreground">Sale Details</h4>
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-2">
                        {PLATFORMS.map((platform) => (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => field.onChange(platform)}
                            className={`p-2 rounded-lg border-2 text-xs transition-all ${
                              field.value === platform
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {platform}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-input-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sale_price_each"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price Each ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={0.01}
                        placeholder="0.00"
                        className="font-mono text-right bg-input-background"
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
              {grossRevenue > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Gross Revenue</p>
                  <p className="text-lg font-mono">{formatCurrency(grossRevenue)}</p>
                </div>
              )}
            </div>

            {/* Fees */}
            <div className="space-y-4">
              <h4 className="text-sm text-muted-foreground">Fees</h4>
              <FormField
                control={form.control}
                name="platform_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform Fee ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={0.01}
                        placeholder="0.00"
                        className="font-mono text-right bg-input-background"
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
              <FormField
                control={form.control}
                name="processing_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Processing Fee ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={0.01}
                        placeholder="0.00"
                        className="font-mono text-right bg-input-background"
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
              <FormField
                control={form.control}
                name="shipping_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={0.01}
                        placeholder="0.00"
                        className="font-mono text-right bg-input-background"
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
              <FormField
                control={form.control}
                name="other_fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Fees ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={0.01}
                        placeholder="0.00"
                        className="font-mono text-right bg-input-background"
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
              {totalFees > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-destructive">Total Fees</p>
                  <p className="text-lg font-mono text-destructive">
                    -{formatCurrency(totalFees)}
                  </p>
                </div>
              )}
            </div>

            {/* FIFO Preview */}
            {form.watch("card_name") && salePriceEach > 0 && (
              <div className="p-4 border-2 border-primary/30 bg-primary/5 rounded-lg space-y-2">
                <p className="text-sm text-primary">FIFO Preview</p>
                <p className="text-xs text-muted-foreground">
                  Will consume {qtySold} card(s) from matching lots (FIFO). Cost basis calculated on record.
                </p>
                <div className="flex justify-between pt-2 border-t border-primary/20 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Net Proceeds</p>
                    <p className="font-mono">{formatCurrency(netProceeds)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Profit</p>
                    <p
                      className={`font-mono ${
                        estimatedProfit >= 0 ? "text-profit" : "text-loss"
                      }`}
                    >
                      {formatCurrency(estimatedProfit)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={recordSale.isPending}
              >
                Record Sale
              </Button>
            </div>
          </Form>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
