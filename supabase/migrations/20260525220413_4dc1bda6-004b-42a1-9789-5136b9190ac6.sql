ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS architectural_price_kes integer,
  ADD COLUMN IF NOT EXISTS structural_price_kes integer,
  ADD COLUMN IF NOT EXISTS boq_price_kes integer;