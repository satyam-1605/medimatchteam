CREATE OR REPLACE FUNCTION public.submit_doctor_registration(
  _user_id uuid,
  _full_name text,
  _specialty text,
  _license_number text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO doctor_registrations (user_id, full_name, specialty, license_number, status)
  VALUES (_user_id, _full_name, _specialty, _license_number, 'pending')
  ON CONFLICT (user_id) DO UPDATE 
    SET full_name = _full_name, 
        specialty = _specialty, 
        license_number = _license_number, 
        status = 'pending',
        updated_at = now();
END;
$$;