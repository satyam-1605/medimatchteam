
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_ref text UNIQUE NOT NULL,
  doctor_id integer NOT NULL,
  doctor_name text NOT NULL,
  appointment_date date NOT NULL,
  time_slot text NOT NULL,
  reason text,
  consultation_type text DEFAULT 'in-person',
  status text DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
