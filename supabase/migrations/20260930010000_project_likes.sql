-- Anonymous "likes" on portfolio projects, keyed by project slug so built-in
-- sample projects can be liked too. Writes go through server functions.
CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug text NOT NULL,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_slug, visitor_id)
);

CREATE INDEX IF NOT EXISTS project_likes_slug_idx
  ON public.project_likes (project_slug);

ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view project likes" ON public.project_likes;
CREATE POLICY "Admins view project likes" ON public.project_likes
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.project_like_stats
WITH (security_invoker = true) AS
SELECT
  project_slug,
  count(*)::int AS likes,
  max(created_at) AS last_liked_at
FROM public.project_likes
GROUP BY project_slug;
