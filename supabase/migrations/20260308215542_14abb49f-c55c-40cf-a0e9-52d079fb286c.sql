
CREATE TABLE public.saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.saved_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.saved_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.saved_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
