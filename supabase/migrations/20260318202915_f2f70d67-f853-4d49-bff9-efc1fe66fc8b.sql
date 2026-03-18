
CREATE TABLE public.video_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL,
  doctor_id integer NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  offer jsonb,
  answer jsonb,
  ice_candidates_offer jsonb DEFAULT '[]'::jsonb,
  ice_candidates_answer jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(appointment_id)
);

ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own video sessions"
  ON public.video_sessions FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Any authenticated read video sessions"
  ON public.video_sessions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users update video sessions"
  ON public.video_sessions FOR UPDATE TO authenticated
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.video_sessions;
