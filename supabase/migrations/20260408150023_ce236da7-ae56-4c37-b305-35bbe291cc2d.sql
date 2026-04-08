
-- Doctor registration requests table
CREATE TABLE public.doctor_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  specialty text NOT NULL,
  license_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  invite_code text,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.doctor_registrations ENABLE ROW LEVEL SECURITY;

-- Users can insert their own registration
CREATE POLICY "Users insert own registration"
ON public.doctor_registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can read their own registration
CREATE POLICY "Users read own registration"
ON public.doctor_registrations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all registrations
CREATE POLICY "Admins read all registrations"
ON public.doctor_registrations FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can update registrations
CREATE POLICY "Admins update registrations"
ON public.doctor_registrations FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Function to approve a doctor registration (admin only)
CREATE OR REPLACE FUNCTION public.approve_doctor_registration(_registration_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reg record;
  _next_doctor_id integer;
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve registrations';
  END IF;

  SELECT * INTO _reg FROM doctor_registrations WHERE id = _registration_id;
  IF _reg IS NULL THEN
    RAISE EXCEPTION 'Registration not found';
  END IF;
  IF _reg.status != 'pending' THEN
    RAISE EXCEPTION 'Registration is not pending';
  END IF;

  -- Get next doctor_id
  SELECT COALESCE(MAX(doctor_id), 0) + 1 INTO _next_doctor_id FROM doctor_profiles;

  -- Update registration status
  UPDATE doctor_registrations SET status = 'approved', updated_at = now() WHERE id = _registration_id;

  -- Add doctor role
  INSERT INTO user_roles (user_id, role) VALUES (_reg.user_id, 'doctor') ON CONFLICT (user_id, role) DO NOTHING;

  -- Create doctor profile
  INSERT INTO doctor_profiles (id, doctor_id, full_name, specialty)
  VALUES (_reg.user_id, _next_doctor_id, _reg.full_name, _reg.specialty)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- Function to process invite code registration (self-service)
CREATE OR REPLACE FUNCTION public.register_doctor_with_code(_user_id uuid, _full_name text, _specialty text, _license_number text, _invite_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _valid_code text := 'MEDIMATCH2024';
  _next_doctor_id integer;
BEGIN
  IF _invite_code != _valid_code THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Get next doctor_id
  SELECT COALESCE(MAX(doctor_id), 0) + 1 INTO _next_doctor_id FROM doctor_profiles;

  -- Insert registration record as approved
  INSERT INTO doctor_registrations (user_id, full_name, specialty, license_number, invite_code, status)
  VALUES (_user_id, _full_name, _specialty, _license_number, _invite_code, 'approved')
  ON CONFLICT (user_id) DO UPDATE SET status = 'approved', invite_code = _invite_code, updated_at = now();

  -- Add doctor role
  INSERT INTO user_roles (user_id, role) VALUES (_user_id, 'doctor') ON CONFLICT (user_id, role) DO NOTHING;

  -- Create doctor profile
  INSERT INTO doctor_profiles (id, doctor_id, full_name, specialty)
  VALUES (_user_id, _next_doctor_id, _full_name, _specialty)
  ON CONFLICT (id) DO NOTHING;
END;
$$;
