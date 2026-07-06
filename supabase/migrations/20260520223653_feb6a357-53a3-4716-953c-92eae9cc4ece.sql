
-- Settings (singleton)
CREATE TABLE public.consultation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_kes integer NOT NULL DEFAULT 0,
  slot_minutes integer NOT NULL DEFAULT 30,
  work_start_hour integer NOT NULL DEFAULT 10,
  work_end_hour integer NOT NULL DEFAULT 16,
  blocked_weekdays integer[] NOT NULL DEFAULT ARRAY[0], -- 0=Sun
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.consultation_settings (price_kes) VALUES (0);

ALTER TABLE public.consultation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON public.consultation_settings FOR SELECT USING (true);
CREATE POLICY "Admins update settings" ON public.consultation_settings FOR UPDATE USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert settings" ON public.consultation_settings FOR INSERT WITH CHECK (has_role(auth.uid(),'admin'));

-- Blocked dates
CREATE TABLE public.consultation_blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.consultation_blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blocked dates public read" ON public.consultation_blocked_dates FOR SELECT USING (true);
CREATE POLICY "Admins manage blocked dates" ON public.consultation_blocked_dates FOR ALL
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Bookings
CREATE TYPE booking_status AS ENUM ('pending','paid','confirmed','cancelled','completed');

CREATE TABLE public.consultation_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  scheduled_at timestamptz NOT NULL,
  slot_minutes integer NOT NULL DEFAULT 30,
  topic text NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  price_kes integer NOT NULL DEFAULT 0,
  payment_ref text,
  paid_at timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_name_len CHECK (char_length(customer_name) BETWEEN 1 AND 120),
  CONSTRAINT bookings_email_len CHECK (char_length(customer_email) BETWEEN 3 AND 255),
  CONSTRAINT bookings_topic_len CHECK (char_length(topic) BETWEEN 1 AND 4000)
);
CREATE INDEX idx_bookings_scheduled ON public.consultation_bookings(scheduled_at);

ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create booking" ON public.consultation_bookings FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Users view own bookings" ON public.consultation_bookings FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all bookings" ON public.consultation_bookings FOR SELECT
  USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update bookings" ON public.consultation_bookings FOR UPDATE
  USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete bookings" ON public.consultation_bookings FOR DELETE
  USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.consultation_bookings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.consultation_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
