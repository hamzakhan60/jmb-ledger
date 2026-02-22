-- RPC for atomic FIFO allocation. Run this migration if you get
-- "Could not find the function public.run_fifo_allocation ... in the schema cache"

CREATE OR REPLACE FUNCTION public.run_fifo_allocation(
  p_user_id UUID,
  p_sale_id UUID,
  p_game TEXT,
  p_card_name TEXT,
  p_set_name TEXT,
  p_variant TEXT,
  p_condition TEXT,
  p_qty_sold INTEGER,
  p_net_proceeds DECIMAL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  lot_rec RECORD;
  remaining_qty INTEGER;
  cost_basis DECIMAL(10,2) := 0;
  take_qty INTEGER;
  cost_total DECIMAL(10,2);
BEGIN
  remaining_qty := p_qty_sold;

  FOR lot_rec IN
    SELECT id, qty_on_hand, cost_per_card
    FROM inventory_lots
    WHERE user_id = p_user_id
      AND game = p_game
      AND card_name = p_card_name
      AND set_name = p_set_name
      AND variant = COALESCE(NULLIF(TRIM(p_variant), ''), '')
      AND condition = p_condition
      AND qty_on_hand > 0
    ORDER BY purchase_date ASC
    FOR UPDATE SKIP LOCKED
  LOOP
    IF remaining_qty <= 0 THEN
      EXIT;
    END IF;

    take_qty := LEAST(remaining_qty, lot_rec.qty_on_hand);
    cost_total := take_qty * lot_rec.cost_per_card;

    INSERT INTO fifo_consumption (
      sale_id,
      inventory_lot_id,
      qty_taken,
      cost_per_card,
      cost_total
    ) VALUES (
      p_sale_id,
      lot_rec.id,
      take_qty,
      lot_rec.cost_per_card,
      cost_total
    );

    UPDATE inventory_lots
    SET qty_on_hand = qty_on_hand - take_qty
    WHERE id = lot_rec.id;

    cost_basis := cost_basis + cost_total;
    remaining_qty := remaining_qty - take_qty;
  END LOOP;

  UPDATE sales
  SET
    cost_basis_used = cost_basis,
    realized_profit = p_net_proceeds - cost_basis
  WHERE id = p_sale_id AND user_id = p_user_id;

  RETURN jsonb_build_object(
    'cost_basis', cost_basis,
    'profit', p_net_proceeds - cost_basis
  );
END;
$$;
