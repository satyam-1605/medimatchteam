
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create has_role() security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. RLS on user_roles: users can read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Create doctor_profiles table
CREATE TABLE public.doctor_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id integer NOT NULL UNIQUE,
  full_name text NOT NULL,
  specialty text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS on doctor_profiles: doctors can read their own profile
CREATE POLICY "Doctors read own profile"
ON public.doctor_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 7. Allow doctors to read appointments assigned to them
CREATE POLICY "Doctors read assigned appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor') AND
  doctor_id = (SELECT dp.doctor_id FROM public.doctor_profiles dp WHERE dp.id = auth.uid())
);

-- 8. Allow doctors to update appointments assigned to them
CREATE POLICY "Doctors update assigned appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor') AND
  doctor_id = (SELECT dp.doctor_id FROM public.doctor_profiles dp WHERE dp.id = auth.uid())
);
