-- Create storage bucket for medical reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-reports', 'medical-reports', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: users can upload to their own folder
CREATE POLICY "Users upload own reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: users can read their own reports
CREATE POLICY "Users read own reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RLS: users can delete their own reports
CREATE POLICY "Users delete own reports"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);