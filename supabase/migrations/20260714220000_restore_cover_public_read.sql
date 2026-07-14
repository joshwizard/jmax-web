-- Restore public read on product covers (was dropped in 20260510214211).
-- Needed for client listing/upsert safety; public bucket URLs also rely on this in some setups.
CREATE POLICY "Covers public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-covers');

-- Ensure admins can always select covers (helps upsert/admin UI).
DROP POLICY IF EXISTS "Admins read covers" ON storage.objects;
CREATE POLICY "Admins read covers" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-covers' AND public.has_role(auth.uid(), 'admin'));
