import { z } from "zod";

const gameEnum = z.enum(["pokemon", "yugioh", "riftbound"]);
const conditionEnum = z.enum(["NM", "LP", "MP", "HP", "DMG"]);

export const RecordSaleSchema = z.object({
  sale_date: z.string().min(1),
  platform: z.string().min(1),
  card_name: z.string().min(1),
  game: gameEnum,
  set_name: z.string().min(1),
  variant: z.string().default(""),
  condition: conditionEnum,
  qty_sold: z.number().int().positive(),
  sale_price_each: z.number().min(0),
  platform_fee: z.number().min(0).default(0),
  processing_fee: z.number().min(0).default(0),
  shipping_cost: z.number().min(0).default(0),
  other_fees: z.number().min(0).default(0),
});

export const EditSaleSchema = RecordSaleSchema.partial();

export const SaleFiltersSchema = z.object({
  game: gameEnum.optional(),
  search: z.string().optional(),
  platform: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
});

export type RecordSalePayload = z.output<typeof RecordSaleSchema>;
export type EditSalePayload = z.output<typeof EditSaleSchema>;
export type SaleFiltersPayload = z.output<typeof SaleFiltersSchema>;
