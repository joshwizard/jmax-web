-- Product image gallery (up to 5 URLs; cover_url stays the listing thumbnail).
alter table public.products
  add column if not exists gallery jsonb not null default '[]'::jsonb;
