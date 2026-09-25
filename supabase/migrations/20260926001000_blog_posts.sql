-- Blog posts for construction articles
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body text NOT NULL DEFAULT '',
  cover_url text,
  category text NOT NULL DEFAULT 'Construction',
  author text NOT NULL DEFAULT 'Jmax Builders',
  published_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_published_idx
  ON public.blog_posts (is_published, published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published blog posts are public" ON public.blog_posts;
CREATE POLICY "Published blog posts are public" ON public.blog_posts
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins view all blog posts" ON public.blog_posts;
CREATE POLICY "Admins view all blog posts" ON public.blog_posts
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins insert blog posts" ON public.blog_posts;
CREATE POLICY "Admins insert blog posts" ON public.blog_posts
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update blog posts" ON public.blog_posts;
CREATE POLICY "Admins update blog posts" ON public.blog_posts
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete blog posts" ON public.blog_posts;
CREATE POLICY "Admins delete blog posts" ON public.blog_posts
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
