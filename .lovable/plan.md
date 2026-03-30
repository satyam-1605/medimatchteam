

# Doctor Dashboard — Implementation Plan

## Overview
Build a doctor-facing dashboard where doctors can log in with their own credentials, view incoming appointment bookings, and manage them (confirm, cancel). Doctors will use the same auth system but with a separate role and dedicated UI.

## Database Changes

1. **Add `user_roles` table** (following the required role pattern):
   - `id` (uuid, PK), `user_id` (uuid, FK → auth.users), `role` (app_role enum: admin, doctor, user)
   - RLS: authenticated users can read their own role
   - Create `has_role()` security definer function

2. **Add `doctor_profiles` table**:
   - `id` (uuid, PK = auth user id), `doctor_id` (integer, links to the doctor ID used in appointments), `full_name`, `specialty`, `created_at`
   - RLS: doctors can read their own profile

3. **Update `appointments` RLS**: Add SELECT policy so doctors can read appointments where `doctor_id` matches their `doctor_profiles.doctor_id`, using the `has_role()` function.

## New Pages & Components

1. **`/doctor-dashboard`** — Protected route for doctors only
   - Shows list of all appointments for this doctor (upcoming, past)
   - Each appointment card: patient name (from profiles), date, time, consultation type, status
   - Actions: mark as completed, cancel
   - Filter by date range and status
   - Badge showing count of new/upcoming appointments

2. **Doctor login** — Uses the same `/auth` page; after login, check role and redirect:
   - If `doctor` role → `/doctor-dashboard`
   - If no role (regular user) → `/dashboard`

## Component Structure
```text
src/
├── pages/
│   └── DoctorDashboard.tsx
├── components/doctor/
│   ├── DoctorAppointmentCard.tsx
│   └── DoctorStats.tsx
```

## Implementation Steps

1. Create `app_role` enum, `user_roles` table, `has_role()` function, and `doctor_profiles` table via migration
2. Add RLS policies on new tables + update appointments RLS for doctor access
3. Build `DoctorDashboard.tsx` page with appointment list, filters, and stats
4. Update Auth redirect logic to route doctors to their dashboard
5. Add `/doctor-dashboard` route in `App.tsx`
6. Add a way to register/assign doctor roles (initially manual via database insert; can add admin UI later)

## Notes
- Doctors will need to be manually registered initially (insert into `user_roles` and `doctor_profiles`). A registration flow can be added later.
- The existing `doctor_id` (integer) in appointments will be linked to `doctor_profiles.doctor_id` to map auth users to their doctor records.

