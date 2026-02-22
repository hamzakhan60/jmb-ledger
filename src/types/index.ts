export type GameType = "pokemon" | "yugioh" | "riftbound";
export type ConditionType = "NM" | "LP" | "MP" | "HP" | "DMG";
export type UserRole = "free" | "pro" | "dealer" | "admin";
export type SubscriptionStatus = "active" | "canceled" | "past_due";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  created_at: string;
}

export interface InventoryLot {
  id: string;
  user_id: string;
  game: GameType;
  card_name: string;
  set_name: string;
  variant: string;
  condition: ConditionType;
  qty_on_hand: number;
  qty_initial: number;
  purchase_date: string;
  vendor: string | null;
  total_cost: number;
  cost_per_card: number;
  created_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  sale_date: string;
  platform: string;
  card_name: string;
  game: GameType;
  set_name: string;
  variant: string;
  condition: ConditionType;
  qty_sold: number;
  sale_price_each: number;
  platform_fee: number;
  processing_fee: number;
  shipping_cost: number;
  other_fees: number;
  net_proceeds: number;
  cost_basis_used: number;
  realized_profit: number;
  created_at: string;
}

export interface FIFOConsumption {
  id: string;
  sale_id: string;
  inventory_lot_id: string;
  qty_taken: number;
  cost_per_card: number;
  cost_total: number;
}

export interface DashboardStats {
  total_profit: number;
  total_revenue: number;
  total_fees: number;
  cards_on_hand: number;
  active_lots: number;
  inventory_estimated_value: number;
  profit_by_period: { date: string; profit: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface InventoryFilters {
  game?: GameType;
  search?: string;
  condition?: ConditionType;
  page?: number;
  pageSize?: number;
}

export interface SaleFilters {
  game?: GameType;
  search?: string;
  platform?: string;
  page?: number;
  pageSize?: number;
}

export interface CardIdentity {
  game: GameType;
  card_name: string;
  set_name: string;
  variant: string;
  condition: ConditionType;
}
