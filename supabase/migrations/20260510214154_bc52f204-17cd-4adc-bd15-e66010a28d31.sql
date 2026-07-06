
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders: admins can view/update all
CREATE POLICY "Admins view all orders" ON public.orders
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update all orders" ON public.orders
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all order items" ON public.order_items
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Products: admin manage
CREATE POLICY "Admins insert products" ON public.products
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update products" ON public.products
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete products" ON public.products
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins view all products" ON public.products
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('product-covers', 'product-covers', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-files', 'product-files', false)
  ON CONFLICT (id) DO NOTHING;

-- product-covers: public read, admin write
CREATE POLICY "Covers public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-covers');
CREATE POLICY "Admins upload covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));

-- product-files: admin read/write directly; buyers get access via signed URLs from server
CREATE POLICY "Admins read files" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete files" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-files' AND public.has_role(auth.uid(), 'admin'));
