import { z } from "zod";

const gameEnum = z.enum(["pokemon", "yugioh", "riftbound"]);
const conditionEnum = z.enum(["NM", "LP", "MP", "HP", "DMG"]);

export const CreateLotSchema = z.object({
  game: gameEnum,
  card_name: z.string().min(1),
  set_name: z.string().min(1),
  variant: z.string().default(""),
  condition: conditionEnum,
  qty_initial: z.number().int().positive(),
  purchase_date: z.string().min(1),
  vendor: z.string().nullable().optional(),
  total_cost: z.number().min(0),
});

export const EditLotSchema = CreateLotSchema.partial();

export const InventoryFiltersSchema = z.object({
  game: gameEnum.optional(),
  search: z.string().optional(),
  condition: conditionEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(25),
});

export type CreateLotPayload = z.output<typeof CreateLotSchema>;
export type EditLotPayload = z.output<typeof EditLotSchema>;
export type InventoryFiltersPayload = z.output<typeof InventoryFiltersSchema>;
