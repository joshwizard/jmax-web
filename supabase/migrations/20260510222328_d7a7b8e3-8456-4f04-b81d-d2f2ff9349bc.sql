-- Portfolio projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Residential',
  year text,
  location text,
  duration text,
  building_type text,
  size text,
  client text,
  cover_url text,
  summary text,
  brief text,
  scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  challenges jsonb NOT NULL DEFAULT '[]'::jsonb,
  testimonial jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone" ON public.projects
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins view all projects" ON public.projects
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert projects" ON public.projects
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update projects" ON public.projects
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete projects" ON public.projects
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Helper: lookup user_id by email (admin-only)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins may look up users';
  END IF;
  SELECT id INTO uid FROM auth.users WHERE email = lower(_email) LIMIT 1;
  RETURN uid;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO authenticated;