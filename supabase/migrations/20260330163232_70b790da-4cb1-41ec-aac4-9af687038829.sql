
-- Allow doctors to read patient profiles for their appointments
CREATE POLICY "Doctors read patient profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
);
