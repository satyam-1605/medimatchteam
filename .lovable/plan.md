

## Plan: Authentication System + Appointment Booking

### Overview
Add email/password auth (signup/login), user profiles, and a booking system so authenticated users can book and manage doctor appointments.

### Database Migrations (3 migrations)

**Migration 1 — Profiles table**
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Migration 2 — Appointments table**
```sql
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
```

### New Files

**1. `src/pages/Auth.tsx`**
- Tabbed Sign In / Sign Up form (email + password)
- Sign Up collects full_name and phone (stored in user metadata, copied to profiles via trigger)
- Email verification required (no auto-confirm)
- Redirects to `/doctors` after successful login
- If already logged in, redirects away

**2. `src/components/doctors/BookingDialog.tsx`**
- Dialog triggered from DoctorCard "Book" button
- Date picker, time slot grid (9 AM–5 PM, 30-min intervals), reason textarea, consultation type toggle (in-person/video)
- Generates unique booking ref like `MED-XXXXXX`
- Inserts into `appointments` table with `user_id = auth.uid()`
- Shows confirmation with booking reference

**3. `src/pages/MyBookings.tsx`**
- Fetches authenticated user's appointments from database
- Shows list with booking ref, doctor name, date/time, status
- Cancel button updates status to "cancelled"

### Modified Files

**4. `src/components/doctors/DoctorCard.tsx`**
- Accept `onBook` callback prop
- "Book" button calls `onBook(doctor)` instead of `alert()`

**5. `src/pages/DoctorDirectory.tsx`**
- Check auth session; "Book" click → if not logged in, redirect to `/auth`; if logged in, open BookingDialog
- Import and render BookingDialog

**6. `src/App.tsx`**
- Add routes: `/auth`, `/my-bookings`

**7. `src/components/layout/Navbar.tsx`**
- Add "My Bookings" link
- Show Login/Logout button based on auth state using `onAuthStateChange`

### Auth Flow
1. User clicks "Book" → redirected to `/auth` if not signed in
2. User signs up with email + password → receives verification email → verifies → logs in
3. After login, navigated back to `/doctors` → clicks "Book" → BookingDialog opens
4. Booking saved to database → confirmation shown
5. User can view/cancel bookings at `/my-bookings`

