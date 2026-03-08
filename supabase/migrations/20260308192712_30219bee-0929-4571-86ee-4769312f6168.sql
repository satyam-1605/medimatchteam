
ALTER TABLE public.government_schemes_db
  ADD COLUMN IF NOT EXISTS eligibility text,
  ADD COLUMN IF NOT EXISTS official_url text;
