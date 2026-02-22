CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free','pro','dealer','admin')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active','canceled','past_due')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game TEXT NOT NULL CHECK (game IN ('pokemon','yugioh','riftbound')),
  card_name TEXT NOT NULL,
  set_name TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT '',
  condition TEXT NOT NULL CHECK (condition IN ('NM','LP','MP','HP','DMG')),
  qty_on_hand INTEGER NOT NULL CHECK (qty_on_hand >= 0),
  qty_initial INTEGER NOT NULL CHECK (qty_initial > 0),
  purchase_date DATE NOT NULL,
  vendor TEXT,
  total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
  cost_per_card DECIMAL(10,2) NOT NULL CHECK (cost_per_card >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  platform TEXT NOT NULL,
  card_name TEXT NOT NULL,
  game TEXT NOT NULL,
  set_name TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT '',
  condition TEXT NOT NULL,
  qty_sold INTEGER NOT NULL CHECK (qty_sold > 0),
  sale_price_each DECIMAL(10,2) NOT NULL CHECK (sale_price_each >= 0),
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  processing_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_proceeds DECIMAL(10,2) NOT NULL,
  cost_basis_used DECIMAL(10,2) NOT NULL DEFAULT 0,
  realized_profit DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fifo_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  inventory_lot_id UUID NOT NULL REFERENCES inventory_lots(id),
  qty_taken INTEGER NOT NULL CHECK (qty_taken > 0),
  cost_per_card DECIMAL(10,2) NOT NULL,
  cost_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_lot_id UUID NOT NULL REFERENCES inventory_lots(id) ON DELETE CASCADE,
  estimated_value_each DECIMAL(10,2),
  source TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dealer_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_user_date ON inventory_lots(user_id, purchase_date ASC);
CREATE INDEX idx_inventory_user_card ON inventory_lots(user_id, card_name, game, condition);
CREATE INDEX idx_inventory_user_qty ON inventory_lots(user_id, qty_on_hand);
CREATE INDEX idx_sales_user_date ON sales(user_id, sale_date DESC);
CREATE INDEX idx_sales_user_card ON sales(user_id, card_name, game, condition);
CREATE INDEX idx_fifo_sale_id ON fifo_consumption(sale_id);
CREATE INDEX idx_fifo_lot_id ON fifo_consumption(inventory_lot_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE fifo_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users own their inventory" ON inventory_lots
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their sales" ON sales
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their FIFO records" ON fifo_consumption
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sales WHERE sales.id = fifo_consumption.sale_id AND sales.user_id = auth.uid())
  );

CREATE POLICY "Users own price estimates for their lots" ON price_estimates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM inventory_lots WHERE inventory_lots.id = price_estimates.inventory_lot_id AND inventory_lots.user_id = auth.uid())
  );

CREATE MATERIALIZED VIEW user_daily_profit AS
SELECT
  user_id,
  DATE_TRUNC('day', sale_date::timestamptz) AS day,
  SUM(realized_profit) AS daily_profit,
  SUM(net_proceeds) AS daily_revenue,
  SUM(platform_fee + processing_fee + shipping_cost + other_fees) AS daily_fees,
  COUNT(*) AS sale_count
FROM sales
GROUP BY user_id, DATE_TRUNC('day', sale_date::timestamptz);

CREATE UNIQUE INDEX ON user_daily_profit(user_id, day);

CREATE OR REPLACE FUNCTION refresh_profit_view()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_daily_profit;
  RETURN NULL;
END;
$$;

CREATE TRIGGER refresh_profit_on_sale
AFTER INSERT OR UPDATE OR DELETE ON sales
FOR EACH STATEMENT EXECUTE FUNCTION refresh_profit_view();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
