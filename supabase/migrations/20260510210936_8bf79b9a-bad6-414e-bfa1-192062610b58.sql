
CREATE OR REPLACE FUNCTION public.has_purchased(_user_id UUID, _product_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.user_id = _user_id
      AND oi.product_id = _product_id
      AND o.status = 'paid'
  );
$$;
