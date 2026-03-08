
-- Hospitals table
CREATE TABLE public.hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Government schemes stored in DB
CREATE TABLE public.government_schemes_db (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  description text,
  coverage text,
  state text NOT NULL,
  is_national boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Scheme doctors (doctors who accept government schemes)
CREATE TABLE public.scheme_doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text NOT NULL,
  hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
  languages text,
  experience text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Link hospitals to schemes
CREATE TABLE public.hospital_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid REFERENCES public.hospitals(id) ON DELETE CASCADE NOT NULL,
  scheme_id uuid REFERENCES public.government_schemes_db(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(hospital_id, scheme_id)
);

-- Enable RLS on all tables
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes_db ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_schemes ENABLE ROW LEVEL SECURITY;

-- Public read policies (no auth required)
CREATE POLICY "Public read hospitals" ON public.hospitals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read schemes" ON public.government_schemes_db FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read scheme doctors" ON public.scheme_doctors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read hospital schemes" ON public.hospital_schemes FOR SELECT TO anon, authenticated USING (true);
