
-- Drop restrictive policies and recreate as permissive for profiles
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Drop restrictive policies and recreate as permissive for appointments
DROP POLICY IF EXISTS "Users insert own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users read own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users update own appointments" ON public.appointments;

CREATE POLICY "Users insert own appointments" ON public.appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own appointments" ON public.appointments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own appointments" ON public.appointments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
